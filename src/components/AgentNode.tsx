
import { useId } from "react";
import { SimulationAgent } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface AgentNodeProps {
  agent: SimulationAgent;
  selected: boolean;
  onClick: () => void;
}

const AgentNode = ({ agent, selected, onClick }: AgentNodeProps) => {
  const id = useId();
  
  // Determine color based on agent type
  const getAgentColor = () => {
    switch (agent.type) {
      case "Experian":
        return "bg-primary text-primary-foreground border-primary";
      case "Equifax":
        return "bg-green-700/70 text-white border-green-600";
      case "TransUnion":
        return "bg-blue-700/70 text-white border-blue-600";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  return (
    <div 
      className={cn(
        "absolute cursor-pointer transition-all duration-300",
        "transform -translate-x-1/2 -translate-y-1/2",
        selected ? "scale-110 z-10" : "hover:scale-105"
      )}
      style={{ left: `${agent.position.x}%`, top: `${agent.position.y}%` }}
      onClick={onClick}
    >
      <div 
        className={cn(
          "rounded-full w-14 h-14 flex items-center justify-center border-2",
          "shadow-lg transition-all duration-500",
          getAgentColor(),
          selected && "ring-4 ring-white/30 animate-pulse"
        )}
      >
        <div className={cn(
          "text-sm font-semibold",
          "transition-all duration-300",
          selected && "scale-110"
        )}>
          {agent.type.substring(0, 2)}
        </div>
      </div>
      
      <div className={cn(
        "absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap",
        "px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium shadow-md",
        "transition-all duration-300",
        selected ? "opacity-100" : "opacity-70"
      )}>
        {agent.name} ({agent.role})
      </div>
      
      {selected && (
        <div 
          className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap animate-fade-in"
          style={{ width: "150px" }}
        >
          <div className="px-2 py-1 bg-card/90 backdrop-blur-sm rounded text-xs shadow-md text-center">
            {agent.shortTermGoal}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentNode;
