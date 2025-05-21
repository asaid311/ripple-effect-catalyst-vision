
// Types for the simulation

export type AgentRole = 'CRO' | 'Risk Officer';

export type AgentType = 'Experian' | 'Equifax' | 'TransUnion';

export type AgentRelationship = {
  trust: number; // 0-100
  influence: number; // 0-100
};

export type SimulationAgent = {
  id: string;
  name: string;
  type: AgentType;
  role: AgentRole;
  shortTermGoal: string;
  longTermGoal: string;
  position: { x: number; y: number }; // For visualization
};

export type RelationshipMatrix = {
  [agentId: string]: {
    [targetId: string]: AgentRelationship;
  };
};

export type MoveType = 'Collaborate' | 'Compete' | 'Regulate' | 'Innovate' | 'Consolidate';

export type Move = {
  id: string;
  title: string;
  description: string;
  type: MoveType;
  impacts: {
    [agentId: string]: {
      trust: number; // -100 to +100 change
      influence: number; // -100 to +100 change
    };
  };
};

export type ScenarioStatus = 'Strategic Gain' | 'Rising Tension' | 'Ecosystem Shock';

export type Scenario = {
  id: string;
  title: string;
  description: string;
  backgroundContext: string;
  agents: SimulationAgent[];
  initialRelationships: RelationshipMatrix;
  moves: Move[];
  currentMoveIndex: number;
  status: ScenarioStatus;
  imageSrc: string;
};

export type Perspective = 'Regulator' | 'CRO' | 'Investor';
