
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Scenario, SimulationAgent } from "@/types/simulation";
import AgentNode from "./AgentNode";
import RelationshipLine from "./RelationshipLine";
import TrustMeter from "./TrustMeter";

interface AgentMapProps {
  scenario: Scenario;
}

const AgentMap = ({ scenario }: AgentMapProps) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    // Set default selection to Experian CRO
    const experianCRO = scenario.agents.find(a => a.type === "Experian" && a.role === "CRO");
    if (experianCRO) {
      setSelectedAgent(experianCRO.id);
    }
  }, [scenario]);

  const getSelectedAgentRelationships = () => {
    if (!selectedAgent) return [];
    
    const relationships = scenario.initialRelationships[selectedAgent] || {};
    return Object.entries(relationships).map(([targetId, relationship]) => {
      const targetAgent = scenario.agents.find(a => a.id === targetId);
      if (!targetAgent) return null;
      
      return {
        targetAgent,
        relationship
      };
    }).filter(Boolean);
  };

  return (
    <Card className="w-full overflow-hidden relative">
      <div className="p-4 border-b border-border bg-card/50">
        <h3 className="font-semibold">Bureau Ecosystem Map</h3>
      </div>
      
      <div className="relative w-full h-[400px] bg-gradient-to-br from-background to-secondary/30">
        {/* Render relationship lines */}
        {selectedAgent && scenario.agents.map(sourceAgent => {
          if (sourceAgent.id !== selectedAgent) return null;
          
          const relationships = scenario.initialRelationships[sourceAgent.id] || {};
          
          return Object.entries(relationships).map(([targetId, relationship]) => {
            const targetAgent = scenario.agents.find(a => a.id === targetId);
            if (!targetAgent) return null;
            
            return (
              <RelationshipLine
                key={`${sourceAgent.id}-${targetId}`}
                sourceAgent={sourceAgent}
                targetAgent={targetAgent}
                relationship={relationship}
              />
            );
          });
        })}
        
        {/* Render agent nodes */}
        {scenario.agents.map(agent => (
          <AgentNode
            key={agent.id}
            agent={agent}
            selected={agent.id === selectedAgent}
            onClick={() => setSelectedAgent(agent.id)}
          />
        ))}
      </div>
      
      {/* Relationship details panel */}
      {selectedAgent && (
        <div className="p-4 bg-card border-t border-border">
          <h4 className="text-sm font-medium mb-3">
            Trust Levels: {scenario.agents.find(a => a.id === selectedAgent)?.name}
          </h4>
          
          <div className="space-y-3">
            {getSelectedAgentRelationships().map((item) => item && (
              <TrustMeter 
                key={item.targetAgent.id}
                trust={item.relationship.trust}
                label={`${item.targetAgent.name} (${item.targetAgent.type})`}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AgentMap;
