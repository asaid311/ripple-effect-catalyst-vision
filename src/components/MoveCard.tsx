
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Move, Perspective } from "@/types/simulation";
import PerspectiveView from "./PerspectiveView";

interface MoveCardProps {
  move: Move;
  onSelect: () => void;
  isActive: boolean;
  perspective: Perspective;
}

const MoveCard = ({ move, onSelect, isActive, perspective = "CRO" }: MoveCardProps) => {
  const getMoveTypeColor = () => {
    switch (move.type) {
      case "Collaborate":
        return "text-green-400";
      case "Compete":
        return "text-red-400";
      case "Regulate":
        return "text-yellow-400";
      case "Innovate":
        return "text-blue-400";
      case "Consolidate":
        return "text-purple-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getPerspectiveInsight = () => {
    switch (perspective) {
      case "CRO":
        return "Revenue impact: potentially positive.";
      case "Regulator":
        return "Compliance implications need review.";
      case "Investor":
        return "Long-term growth indicator.";
      default:
        return "";
    }
  };

  return (
    <Card className={`w-full transition-all duration-300 ${
      isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100"
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-start">
          <span>{move.title}</span>
          <span className={`text-sm font-normal ${getMoveTypeColor()}`}>
            {move.type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>{move.description}</p>
        
        <div className="mt-4">
          <div className="text-xs font-medium mb-2">Projected Impact</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(move.impacts).map(([agentId, impact]) => {
              const trustChange = impact.trust;
              const trustColor = trustChange > 0 ? "text-green-400" : trustChange < 0 ? "text-red-400" : "text-muted-foreground";
              
              return (
                <div key={agentId} className="text-xs">
                  <span>{agentId.split('-')[0].toUpperCase()}-{agentId.split('-')[1]}: </span>
                  <span className={trustColor}>
                    {trustChange > 0 ? `+${trustChange}` : trustChange}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4 p-2 bg-secondary/30 rounded text-xs">
          <PerspectiveView perspective={perspective} showFor={["CRO"]}>
            <p className="font-medium text-primary">CRO Analysis:</p>
            <p>Focus on maximizing market share and revenue opportunities.</p>
          </PerspectiveView>
          
          <PerspectiveView perspective={perspective} showFor={["Regulator"]}>
            <p className="font-medium text-yellow-500">Regulatory Analysis:</p>
            <p>Consider potential compliance risks and consumer impact.</p>
          </PerspectiveView>
          
          <PerspectiveView perspective={perspective} showFor={["Investor"]}>
            <p className="font-medium text-green-500">Investor Analysis:</p>
            <p>Evaluate long-term strategic positioning and competitive advantages.</p>
          </PerspectiveView>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="pt-3">
        <Button 
          className="w-full transition-colors hover:bg-primary/90" 
          variant={isActive ? "default" : "outline"}
          onClick={onSelect}
          disabled={isActive}
        >
          {isActive ? "Selected" : "Select Move"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoveCard;
