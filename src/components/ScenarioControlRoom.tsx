
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScenarioCard from "@/components/ScenarioCard";
import { Perspective } from "@/types/simulation"; // ScenarioStatus might be removed or adapted
import { fetchScenarios, Scenario as ApiScenario } from "@/services/simulationApi";
import { useSimulation } from "@/App"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScenarioControlRoomProps {
  perspective: Perspective;
}

const ScenarioControlRoom = ({ perspective }: ScenarioControlRoomProps) => {
  const [apiScenarios, setApiScenarios] = useState<ApiScenario[]>([]);
  const [uiLoading, setUiLoading] = useState<boolean>(true); // Separate loading state for UI
  const [uiError, setUiError] = useState<string | null>(null);
  // Filter state - adapt based on actual scenario properties if needed
  const [filter, setFilter] = useState<string>("All"); 

  const { 
    startNewSimulation, 
    isLoading: isSimContextLoading, 
    error: simContextError,
    resetSimulation, // Get resetSimulation from context
    simulationStatus, // Get status to potentially show "Simulating..." or allow reset
    selectedScenario
  } = useSimulation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadScenarios = async () => {
      setUiLoading(true);
      try {
        const fetchedScenarios = await fetchScenarios();
        setApiScenarios(fetchedScenarios);
        setUiError(null);
      } catch (err) {
        console.error("Error fetching scenarios:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load scenarios. Please try again later.";
        setUiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setUiLoading(false);
      }
    };
    loadScenarios();
  }, []);

  const handleStartSimulation = (scenario: ApiScenario) => {
    if (simulationStatus === 'running' || simulationStatus === 'loading') {
        toast.info("A simulation is already in progress or loading.");
        return;
    }
    startNewSimulation(scenario, navigate);
  };

  const handleResetAndGoHome = () => {
    resetSimulation(navigate); // navigate to home is handled by resetSimulation
  };

  // Example filtering - adapt based on your ApiScenario structure
  const filteredApiScenarios = filter === "All" 
    ? apiScenarios 
    : apiScenarios.filter(s => s.id.includes(filter.toLowerCase())); // Example: filter by part of ID or name

  useEffect(() => {
    if (simContextError) {
      toast.error(`Simulation Error: ${simContextError}`);
    }
  }, [simContextError]);

  if (uiLoading) {
    return <div className="container py-24 text-center">Loading scenarios...</div>;
  }

  if (uiError) {
    return <div className="container py-24 text-center text-red-500">{uiError}</div>;
  }

  return (
    <div className="container py-24">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Scenario Control Room</h1>
        <p className="text-xl text-muted-foreground">
          Select a scenario to simulate the high-stakes consequences of altering Business Credit Agreements 
          in a volatile ecosystem of competitive bureaus.
        </p>
        {(simulationStatus === 'running' || simulationStatus === 'loading' || simulationStatus === 'completed') && selectedScenario && (
          <div className="mt-4">
            <p className="text-lg">
              Currently viewing: <strong>{selectedScenario.name}</strong> (Status: {simulationStatus})
            </p>
            <Button onClick={() => navigate(`/simulation/${selectedScenario.id}`)} className="mt-2 mr-2">
              Go to Simulation Dashboard
            </Button>
            <Button onClick={handleResetAndGoHome} variant="outline" className="mt-2">
              Reset Simulation & Go Home
            </Button>
          </div>
        )}
      </div>

      {/* Filter buttons - adapt based on actual scenario properties */}
      <div className="mb-8 flex justify-center space-x-4">
        <Button 
          onClick={() => setFilter("All")}
          variant={filter === "All" ? "secondary" : "ghost"}
        >
          All
        </Button>
        <Button 
          onClick={() => setFilter("gambit")} // Example filter
          variant={filter === "gambit" ? "secondary" : "ghost"}
        >
          Gambits
        </Button>
        <Button 
          onClick={() => setFilter("breach")} // Example filter
          variant={filter === "breach" ? "secondary" : "ghost"}
        >
          Breaches
        </Button>
         <Button 
          onClick={() => setFilter("alliance")} // Example filter
          variant={filter === "alliance" ? "secondary" : "ghost"}
        >
          Alliances
        </Button>
      </div>

      {isSimContextLoading && <div className="text-center my-4 text-lg">Initializing Simulation Environment... Please Wait.</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApiScenarios.map((scenario) => (
          <ScenarioCard 
            key={scenario.id} 
            scenario={scenario} 
            // Pass perspective if ScenarioCard uses it
            // perspective={perspective} 
            onStartSimulation={() => handleStartSimulation(scenario)}
            // Disable start button if a simulation is active and it's not the current one
            isSimulationActive={ (simulationStatus === 'running' || simulationStatus === 'loading' || simulationStatus === 'completed') && selectedScenario?.id !== scenario.id }
          />
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Viewing scenarios from {perspective} perspective</p>
      </div>
    </div>
  );
};

export default ScenarioControlRoom;
