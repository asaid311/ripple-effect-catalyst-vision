
import { SimulationAgent, AgentRelationship } from "@/types/simulation";

interface RelationshipLineProps {
  sourceAgent: SimulationAgent;
  targetAgent: SimulationAgent;
  relationship: AgentRelationship;
}

const RelationshipLine = ({ sourceAgent, targetAgent, relationship }: RelationshipLineProps) => {
  const sourceX = sourceAgent.position.x;
  const sourceY = sourceAgent.position.y;
  const targetX = targetAgent.position.x;
  const targetY = targetAgent.position.y;
  
  // Calculate stroke color based on trust level
  const getTrustColor = () => {
    if (relationship.trust >= 70) return "stroke-green-500";
    if (relationship.trust >= 40) return "stroke-yellow-500";
    return "stroke-red-500";
  };
  
  // Calculate stroke width based on influence level
  const getStrokeWidth = () => {
    return (relationship.influence / 25) + 1;
  };
  
  // Calculate stroke opacity based on trust and influence
  const getStrokeOpacity = () => {
    const base = 0.4;
    const trustFactor = relationship.trust / 100 * 0.3;
    const influenceFactor = relationship.influence / 100 * 0.3;
    return Math.min(0.9, base + trustFactor + influenceFactor);
  };

  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <line
        x1={`${sourceX}%`}
        y1={`${sourceY}%`}
        x2={`${targetX}%`}
        y2={`${targetY}%`}
        className={`${getTrustColor()} trust-line`}
        strokeWidth={getStrokeWidth()}
        strokeOpacity={getStrokeOpacity()}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default RelationshipLine;
