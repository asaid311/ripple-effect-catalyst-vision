
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scenario } from "@/types/simulation";
import { useNavigate } from "react-router-dom";

interface ScenarioCardProps {
  scenario: Scenario;
}

const ScenarioCard = ({ scenario }: ScenarioCardProps) => {
  const navigate = useNavigate();
  
  const statusColors = {
    "Strategic Gain": "bg-green-500/20 text-green-400",
    "Rising Tension": "bg-yellow-500/20 text-yellow-400",
    "Ecosystem Shock": "bg-red-500/20 text-red-400",
  };

  const handleSelectScenario = () => {
    navigate(`/simulation/${scenario.id}`);
  };

  return (
    <Card className="scenario-card overflow-hidden h-[320px] flex flex-col relative cursor-pointer group" onClick={handleSelectScenario}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
      
      <div 
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${scenario.imageSrc})` }}
      >
        <div className="p-6 h-full flex flex-col justify-end relative z-20">
          <Badge 
            variant="outline" 
            className={`mb-2 self-start ${statusColors[scenario.status]}`}
          >
            {scenario.status}
          </Badge>
          
          <h3 className="text-xl font-bold mb-1">{scenario.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{scenario.description}</p>
          
          <div className="mt-auto">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-primary/80 hover:bg-primary transition-all duration-300 group-hover:translate-y-0 translate-y-2"
            >
              Simulate Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScenarioCard;
