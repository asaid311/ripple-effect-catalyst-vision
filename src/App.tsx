
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import SimulationPage from "./pages/SimulationPage"; 
import NotFound from "./pages/NotFound";

import { useState, createContext, useContext, ReactNode } from "react";
import type { Scenario, SimulationDataResponse, AgentData, ModelData } from "./services/simulationApi";

// Simulation Context
interface SimulationContextType {
  selectedScenario: Scenario | null;
  setSelectedScenario: (scenario: Scenario | null) => void;
  simulationId: string | null;
  setSimulationId: (id: string | null) => void;
  simulationData: SimulationDataResponse | null;
  setSimulationData: (data: SimulationDataResponse | null) => void;
  currentRoundData: { model: ModelData | null; agents: AgentData[] } | null;
  setCurrentRoundData: (data: { model: ModelData | null; agents: AgentData[] } | null) => void;
  simulationStatus: 'idle' | 'running' | 'loading' | 'completed' | 'error';
  setSimulationStatus: (status: 'idle' | 'running' | 'loading' | 'completed' | 'error') => void;
  currentRound: number;
  setCurrentRound: (round: number) => void;
  totalRounds: number;
  setTotalRounds: (rounds: number) => void;
  isLoading: boolean; // More generic loading state
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  currentPerspective: string; // 'CRO', 'Regulator', 'Investor'
  setCurrentPerspective: (perspective: string) => void;
  startNewSimulation: (scenario: Scenario, navigateFn: (path: string) => void) => void;
  resetSimulation: (navigateFn: (path: string) => void) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};

const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationDataResponse | null>(null);
  const [currentRoundData, setCurrentRoundData] = useState<{ model: ModelData | null; agents: AgentData[] } | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'loading' | 'completed' | 'error'>('idle');
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading
  const [error, setError] = useState<string | null>(null);
  const [currentPerspective, setCurrentPerspective] = useState<string>('CRO'); // Default perspective

  const startNewSimulation = (scenario: Scenario, navigateFn: (path: string) => void) => {
    setSelectedScenario(scenario);
    setSimulationId(null);
    setSimulationData(null);
    setCurrentRoundData(null);
    setSimulationStatus('loading'); // Set to loading as API call will be made
    setCurrentRound(0);
    setTotalRounds(scenario.rounds);
    setError(null);
    setIsLoading(true);
    navigateFn(`/simulation/${scenario.id}`);
  };
  
  const resetSimulation = (navigateFn: (path: string) => void) => {
    setSelectedScenario(null);
    setSimulationId(null);
    setSimulationData(null);
    setCurrentRoundData(null);
    setSimulationStatus('idle');
    setCurrentRound(0);
    setTotalRounds(0);
    setError(null);
    setIsLoading(false);
    navigateFn('/'); 
  };

  return (
    <SimulationContext.Provider
      value={{
        selectedScenario, setSelectedScenario,
        simulationId, setSimulationId,
        simulationData, setSimulationData,
        currentRoundData, setCurrentRoundData,
        simulationStatus, setSimulationStatus,
        currentRound, setCurrentRound,
        totalRounds, setTotalRounds,
        isLoading, setIsLoading,
        error, setError,
        currentPerspective, setCurrentPerspective,
        startNewSimulation,
        resetSimulation
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

const queryClient = new QueryClient();

// App component now wraps BrowserRouter with SimulationProvider
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SimulationProvider> {/* SimulationProvider now wraps Routes */}
          <Routes>
            <Route path="/" element={<Index />} />
            {/* The :id in the route path for SimulationPage will correspond to selectedScenario.id */}
            <Route path="/simulation/:scenarioIdUrl" element={<SimulationPage />} />
            {/* Optional: Route for a dedicated brief page if not part of SimulationPage */}
            {/* <Route path="/simulation/:scenarioIdUrl/brief" element={<OutcomeBriefPage />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SimulationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
