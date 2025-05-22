// src/services/simulationApi.ts

const API_BASE_URL = 'http://localhost:5001/api'; // Backend API URL

export interface Scenario {
  id: string;
  name: string;
  description: string;
  rounds: number;
  image_url: string; // Or whatever image property you have
}

export interface SimulationStartParams {
  scenario_id: string;
  num_rounds?: number;
}

export interface SimulationStartResponse {
  simulation_id: string;
  status: string;
  scenario_id: string;
  total_rounds: number;
  message: string;
}

export interface AgentData {
  Step: number;
  AgentID: number;
  Name: string;
  Vote: string | null;
  TrustLevel: number;
  CurrentIncentive: string;
  MarketShare: number;
  // Add other agent properties as they come from the backend
}

export interface ModelData {
  Step: number;
  CurrentRound: number;
  CurrentScenario: string | null;
  TotalVotesYes: number;
  TotalVotesNo: number;
  TotalVotesAbstain: number;
  ExclusivityDealSecured: boolean | null;
  // Add other model properties
}

export interface SimulationDataResponse {
  simulation_id: string;
  scenario_id: string;
  status: string;
  current_round: number; // This will be the latest round if ongoing, or total_rounds if completed
  total_rounds: number;
  model_data: ModelData[]; // Array of model data per round
  agent_data: AgentData[]; // Array of agent data, potentially multiple entries per agent per round
}


export const fetchScenarios = async (): Promise<Scenario[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/scenarios`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const scenarios = await response.json();
    return scenarios;
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const startSimulation = async (params: SimulationStartParams): Promise<SimulationStartResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulation/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || errorData.detail}`);
    }
    const simulationDetails = await response.json();
    return simulationDetails;
  } catch (error) {
    console.error("Failed to start simulation:", error);
    throw error;
  }
};

export const fetchSimulationData = async (simulationId: string): Promise<SimulationDataResponse> => {
  const url = `${API_BASE_URL}/simulation/data/${simulationId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || errorData.detail}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch data for simulation ${simulationId}:`, error);
    throw error;
  }
};

export const fetchSimulationStatus = async (simulationId: string): Promise<SimulationDataResponse> => {
    const url = `${API_BASE_URL}/simulation/status/${simulationId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || errorData.detail}`);
        }
        const status = await response.json();
        return status;
    } catch (error) {
        console.error(`Failed to fetch status for simulation ${simulationId}:`, error);
        throw error;
    }
};

// Interface for the Brief data
export interface BriefData {
  scenario_id: string;
  perspective: string;
  summary: {
    what_happened: string[];
    strategic_implications: string[];
    suggested_next_move: string;
  };
}

export const fetchSimulationBrief = async (simulationId: string, perspective: string): Promise<BriefData> => {
  const url = `${API_BASE_URL}/simulation/brief/${simulationId}?perspective=${perspective}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || errorData.detail}`);
    }
    const brief = await response.json();
    return brief;
  } catch (error) {
    console.error(`Failed to fetch brief for simulation ${simulationId} with perspective ${perspective}:`, error);
    throw error;
  }
};
