
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SimulationDashboard from "@/components/SimulationDashboard";
import { Button } from "@/components/ui/button";
// Perspective type is now string as managed by context, can be refined if needed
// import { Perspective } from "@/types/simulation"; 
import { useSimulation } from "@/App"; 
import { 
    startSimulation as apiStartSimulation, 
    fetchSimulationData, 
    fetchSimulationBrief, // Import new service
    AgentData, 
    ModelData,
    BriefData // Import BriefData interface
} from "@/services/simulationApi";
import { toast } from "sonner";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


const SimulationPage = () => {
  const { scenarioIdUrl } = useParams<{ scenarioIdUrl: string }>(); 
  const navigate = useNavigate();
  // const [perspective, setPerspective] = useState<Perspective>("CRO"); // Local perspective state removed, use context

  const {
    selectedScenario,
    // setSelectedScenario, // No longer needed here as it's set in ControlRoom
    simulationId,
    setSimulationId,
    simulationData,
    setSimulationData,
    currentRound,
    setCurrentRound,
    totalRounds,
    setTotalRounds,
    simulationStatus,
    setSimulationStatus,
    currentRoundData,
    setCurrentRoundData,
    isLoading: isContextLoading, // Renamed for clarity
    setIsLoading: setIsContextLoading, // Renamed for clarity
    setError: setContextError,
    resetSimulation,
    currentPerspective // Get currentPerspective from context
  } = useSimulation();

  // Local loading states for this page
  const [isSimStarting, setIsSimStarting] = useState<boolean>(false);
  const [isBriefLoading, setIsBriefLoading] = useState<boolean>(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [showBrief, setShowBrief] = useState<boolean>(false);


  const handleBackToControlRoom = () => {
    if (simulationStatus === 'running' || simulationStatus === 'loading' || isSimStarting) {
      if (window.confirm("A simulation is active or loading. Are you sure you want to go back and reset it?")) {
        resetSimulation(navigate); // resetSimulation now handles navigation
      }
    } else {
      navigate("/");
    }
  };
  
  
  const updateCurrentRoundDisplayData = useCallback(() => {
    if (!simulationData || !simulationData.agent_data || simulationData.agent_data.length === 0) {
      setCurrentRoundData(null);
      return;
    }
    const roundForFiltering = currentRound + 1; // Assuming currentRound is 0-indexed for playback
    const agentsForRound = simulationData.agent_data.filter(ad => ad.Step === roundForFiltering);
    const modelForRound = simulationData.model_data.find(md => md.CurrentRound === roundForFiltering) || null;
    setCurrentRoundData({ model: modelForRound, agents: agentsForRound });
  }, [simulationData, currentRound, setCurrentRoundData]);

  // Effect for initiating simulation
  useEffect(() => {
    if (!selectedScenario && scenarioIdUrl) {
      toast.error("Scenario not selected. Please return to the Control Room.");
      navigate("/");
      return;
    }

    if (selectedScenario && scenarioIdUrl === selectedScenario.id && !simulationId && simulationStatus !== 'completed' && !isSimStarting) {
      const initiateSim = async () => {
        setIsSimStarting(true);
        setIsContextLoading(true);
        setSimulationStatus('loading');
        setContextError(null);
        setBriefData(null); // Clear previous brief
        setShowBrief(false); 
        try {
          toast.info(`Starting simulation: ${selectedScenario.name}`);
          const response = await apiStartSimulation({
            scenario_id: selectedScenario.id,
            num_rounds: selectedScenario.rounds,
          });
          setSimulationId(response.simulation_id);
          setTotalRounds(response.total_rounds);
          const fullData = await fetchSimulationData(response.simulation_id);
          setSimulationData(fullData);
          setCurrentRound(0);
          setSimulationStatus('completed');
          toast.success(`Simulation for ${selectedScenario.name} ready.`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to start/fetch simulation.";
          setContextError(msg);
          setSimulationStatus('error');
          toast.error(msg);
        } finally {
          setIsContextLoading(false);
          setIsSimStarting(false);
        }
      };
      initiateSim();
    }
  }, [selectedScenario, scenarioIdUrl, simulationId, simulationStatus, isSimStarting, setSimulationId, setTotalRounds, setSimulationData, setCurrentRound, setSimulationStatus, setIsContextLoading, setContextError, navigate]);

  // Effect for updating round display data
  useEffect(() => {
    if (simulationStatus === 'completed' && simulationData) {
      updateCurrentRoundDisplayData();
    }
  }, [currentRound, simulationData, simulationStatus, updateCurrentRoundDisplayData]);

  // Effect for fetching brief when perspective changes or simulation completes
  const fetchBriefForCurrentPerspective = useCallback(async () => {
    if (simulationId && simulationStatus === 'completed') {
      setIsBriefLoading(true);
      try {
        toast.info(`Fetching brief for ${currentPerspective} perspective...`);
        const brief = await fetchSimulationBrief(simulationId, currentPerspective);
        setBriefData(brief);
        // setShowBrief(true); // Optionally auto-show brief when perspective changes
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch brief.";
        toast.error(msg);
        setBriefData(null);
      } finally {
        setIsBriefLoading(false);
      }
    }
  }, [simulationId, simulationStatus, currentPerspective]);

  useEffect(() => {
    // Fetch brief when simulation completes or perspective changes (if sim is already complete)
    fetchBriefForCurrentPerspective();
  }, [fetchBriefForCurrentPerspective]); // Runs when this callback identity changes (i.e. its deps change)

  const toggleBriefDisplay = () => {
    if (!briefData && simulationStatus === 'completed' && simulationId) {
        fetchBriefForCurrentPerspective(); // Fetch if not already loaded
    }
    setShowBrief(!showBrief);
  };

  const handleNextRound = () => setCurrentRound(prev => Math.min(prev + 1, totalRounds - 1));
  const handlePrevRound = () => setCurrentRound(prev => Math.max(prev - 1, 0));
  const handleSetRound = (round: number) => {
    if (round >= 0 && round < totalRounds) setCurrentRound(round);
  };

  if (!selectedScenario || selectedScenario.id !== scenarioIdUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading scenario details or redirecting...</p>
        <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
      </div>
    );
  }
  
  if ((isContextLoading && simulationStatus === 'loading') || isSimStarting) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing simulation, please wait...</p>
      </div>
    );
  }

  if (simulationStatus === 'error') {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Simulation Error</h2>
        <p className="text-red-500 mb-6">{useSimulation().error || "An unknown error occurred."}</p>
        <Button onClick={handleBackToControlRoom} className="mt-4">Back to Control Room</Button>
      </div>
    );
  }
  
import RiskRewardHeatmap, { HeatmapPoint } from "@/components/RiskRewardHeatmap";
import StrategicActionMatrix, { MatrixAction, Level as MatrixLevel } from "@/components/StrategicActionMatrix";


const SimulationPage = () => {
  const { scenarioIdUrl } = useParams<{ scenarioIdUrl: string }>(); 
  const navigate = useNavigate();

  const {
    selectedScenario,
    simulationId,
    setSimulationId,
    simulationData,
    setSimulationData,
    currentRound,
    setCurrentRound,
    totalRounds,
    setTotalRounds,
    simulationStatus,
    setSimulationStatus,
    currentRoundData,
    setCurrentRoundData,
    isLoading: isContextLoading, 
    setIsLoading: setIsContextLoading, 
    setError: setContextError,
    resetSimulation,
    currentPerspective 
  } = useSimulation();

  const [isSimStarting, setIsSimStarting] = useState<boolean>(false);
  const [isBriefLoading, setIsBriefLoading] = useState<boolean>(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [showBrief, setShowBrief] = useState<boolean>(false);

  // Placeholder data for new visual components
  const placeholderHeatmapData: HeatmapPoint[] = [
    { id: 'opt1', label: 'Option A', risk: 0, reward: 2, description: 'Low risk, high potential upside.' },
    { id: 'opt2', label: 'Option B', risk: 1, reward: 1, description: 'Moderate risk and reward.' },
    { id: 'opt3', label: 'Option C', risk: 2, reward: 0, description: 'High risk, low potential reward.' },
    { id: 'opt4', label: 'Competitor X Move', risk: 2, reward: 2, description: 'High risk, high reward counter.' },
    { id: 'opt5', label: 'Market Trend Alpha', risk: 0, reward: 0, description: 'Low risk, low reward but stable.' },
  ];

  const placeholderMatrixActions: MatrixAction[] = [
    { id: 'act1', label: 'Launch Product X', impact: 2, probability: 2, description: 'High impact, high probability of success.' },
    { id: 'act2', label: 'Explore Market Y', impact: 2, probability: 0, description: 'High impact, low probability (moonshot).' },
    { id: 'act3', label: 'Optimize Process Z', impact: 0, probability: 2, description: 'Low impact, high probability (quick win).' },
    { id: 'act4', label: 'Maintain System Q', impact: 0, probability: 0, description: 'Low impact, low probability (re-evaluate).' },
    { id: 'act5', label: 'Partnership Alpha', impact: 1, probability: 1, description: 'Medium impact, medium probability.' },
  ];


  const handleBackToControlRoom = () => {
    if (simulationStatus === 'running' || simulationStatus === 'loading' || isSimStarting) {
      if (window.confirm("A simulation is active or loading. Are you sure you want to go back and reset it?")) {
        resetSimulation(navigate); 
      }
    } else {
      navigate("/");
    }
  };
  
  const updateCurrentRoundDisplayData = useCallback(() => {
    if (!simulationData || !simulationData.agent_data || simulationData.agent_data.length === 0) {
      setCurrentRoundData(null);
      return;
    }
    const roundForFiltering = currentRound + 1; 
    const agentsForRound = simulationData.agent_data.filter(ad => ad.Step === roundForFiltering);
    const modelForRound = simulationData.model_data.find(md => md.CurrentRound === roundForFiltering) || null;
    setCurrentRoundData({ model: modelForRound, agents: agentsForRound });
  }, [simulationData, currentRound, setCurrentRoundData]);

  useEffect(() => {
    if (!selectedScenario && scenarioIdUrl) {
      toast.error("Scenario not selected. Please return to the Control Room.");
      navigate("/");
      return;
    }

    if (selectedScenario && scenarioIdUrl === selectedScenario.id && !simulationId && simulationStatus !== 'completed' && !isSimStarting) {
      const initiateSim = async () => {
        setIsSimStarting(true);
        setIsContextLoading(true);
        setSimulationStatus('loading');
        setContextError(null);
        setBriefData(null); 
        setShowBrief(false); 
        try {
          toast.info(`Starting simulation: ${selectedScenario.name}`);
          const response = await apiStartSimulation({
            scenario_id: selectedScenario.id,
            num_rounds: selectedScenario.rounds,
          });
          setSimulationId(response.simulation_id);
          setTotalRounds(response.total_rounds);
          const fullData = await fetchSimulationData(response.simulation_id);
          setSimulationData(fullData);
          setCurrentRound(0);
          setSimulationStatus('completed');
          toast.success(`Simulation for ${selectedScenario.name} ready.`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to start/fetch simulation.";
          setContextError(msg);
          setSimulationStatus('error');
          toast.error(msg);
        } finally {
          setIsContextLoading(false);
          setIsSimStarting(false);
        }
      };
      initiateSim();
    }
  }, [selectedScenario, scenarioIdUrl, simulationId, simulationStatus, isSimStarting, setSimulationId, setTotalRounds, setSimulationData, setCurrentRound, setSimulationStatus, setIsContextLoading, setContextError, navigate]);

  useEffect(() => {
    if (simulationStatus === 'completed' && simulationData) {
      updateCurrentRoundDisplayData();
    }
  }, [currentRound, simulationData, simulationStatus, updateCurrentRoundDisplayData]);

  const fetchBriefForCurrentPerspective = useCallback(async () => {
    if (simulationId && simulationStatus === 'completed') {
      setIsBriefLoading(true);
      try {
        toast.info(`Fetching brief for ${currentPerspective} perspective...`);
        const brief = await fetchSimulationBrief(simulationId, currentPerspective);
        setBriefData(brief);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch brief.";
        toast.error(msg);
        setBriefData(null);
      } finally {
        setIsBriefLoading(false);
      }
    }
  }, [simulationId, simulationStatus, currentPerspective]);

  useEffect(() => {
    fetchBriefForCurrentPerspective();
  }, [fetchBriefForCurrentPerspective]); 

  const toggleBriefDisplay = () => {
    if (!briefData && simulationStatus === 'completed' && simulationId) {
        fetchBriefForCurrentPerspective(); 
    }
    setShowBrief(!showBrief);
  };

  const handleNextRound = () => setCurrentRound(prev => Math.min(prev + 1, totalRounds - 1));
  const handlePrevRound = () => setCurrentRound(prev => Math.max(prev - 1, 0));
  const handleSetRound = (round: number) => {
    if (round >= 0 && round < totalRounds) setCurrentRound(round);
  };

  if (!selectedScenario || selectedScenario.id !== scenarioIdUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading scenario details or redirecting...</p>
        <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
      </div>
    );
  }
  
  if ((isContextLoading && simulationStatus === 'loading') || isSimStarting) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing simulation, please wait...</p>
      </div>
    );
  }

  if (simulationStatus === 'error') {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Simulation Error</h2>
        <p className="text-red-500 mb-6">{useSimulation().error || "An unknown error occurred."}</p>
        <Button onClick={handleBackToControlRoom} className="mt-4">Back to Control Room</Button>
      </div>
    );
  }
  
  const dashboardDataReady = !!(simulationStatus === 'completed' && currentRoundData && selectedScenario);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header /> 
      
      <div className="pt-20"> 
        <div className="container py-4">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <Button 
              variant="ghost" 
              onClick={handleBackToControlRoom}
              className="transition-colors hover:bg-secondary/50"
            >
              ← Back to Control Room
            </Button>
            {dashboardDataReady && (
              <div className="flex items-center space-x-2">
                <Button onClick={handlePrevRound} disabled={currentRound === 0}>Prev</Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Round: {currentRound + 1} / {totalRounds}
                </span>
                <Button onClick={handleNextRound} disabled={currentRound >= totalRounds - 1}>Next</Button>
              </div>
            )}
            {simulationStatus === 'completed' && simulationId && (
                 <Button onClick={toggleBriefDisplay} variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> {showBrief ? "Hide" : "View"} Strategic Brief ({currentPerspective})
                </Button>
            )}
          </div>

          {showBrief && briefData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Strategic Brief ({briefData.perspective})
                  <Button variant="ghost" size="sm" onClick={fetchBriefForCurrentPerspective} disabled={isBriefLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isBriefLoading ? 'animate-spin' : ''}`} />
                    Refresh Brief
                  </Button>
                </CardTitle>
                <CardDescription>Scenario: {selectedScenario.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {isBriefLoading && !briefData ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" /> 
                        <p className="ml-2">Loading brief for {currentPerspective}...</p>
                    </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg mb-1">What Happened:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {briefData.summary.what_happened.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg mb-1">Strategic Implications ({briefData.perspective}):</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {briefData.summary.strategic_implications.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Suggested Next Move ({briefData.perspective}):</h4>
                      <p className="text-sm">{briefData.summary.suggested_next_move}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Visualizations displayed alongside or below the brief when shown */}
          {showBrief && simulationStatus === 'completed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <RiskRewardHeatmap 
                data={placeholderHeatmapData} 
                title="Key Opportunities/Threats Heatmap"
                description={`Visualizing potential impact based on current scenario: ${selectedScenario.name} (${currentPerspective} View)`}
              />
              <StrategicActionMatrix 
                actions={placeholderMatrixActions} 
                title="Potential Strategic Actions Matrix"
                description={`Derived from suggested moves for ${currentPerspective} perspective.`}
              />
            </div>
          )}
        </div>
        
        {dashboardDataReady ? (
          <SimulationDashboard
            scenario={{ // Mapping to the props SimulationDashboard expects
                id: selectedScenario.id,
                title: selectedScenario.name,
                description: selectedScenario.description,
                status: "Active", // This status is for display in dashboard, not sim context status
                imageSrc: selectedScenario.image_url,
            }}
            perspective={currentPerspective} // Pass perspective from context
            currentRoundData={currentRoundData}
            totalRounds={totalRounds}
            currentRound={currentRound}
            setCurrentRound={handleSetRound}
          />
        ) : (
          <div className="flex flex-col items-center justify-center" style={{minHeight: 'calc(100vh - 12rem)'}}>
             { simulationStatus !== 'error' &&  <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
                <p className="text-md text-muted-foreground">
                    {simulationStatus === 'loading' ? 'Initializing simulation...' : 'Loading simulation data...'}
                </p>
             </>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationPage;
