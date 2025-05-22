
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Use ApiScenario from the service, which matches backend structure
import { Scenario as ApiScenario } from "@/services/simulationApi"; 
import { cn } from "@/lib/utils";


interface ScenarioCardProps {
  scenario: ApiScenario; // Use the type from simulationApi.ts
  onStartSimulation: (scenario: ApiScenario) => void;
  isSimulationActive: boolean; // To disable button if another simulation is active
}

const ScenarioCard = ({ scenario, onStartSimulation, isSimulationActive }: ScenarioCardProps) => {
  
  // Example status colors - adapt if your ApiScenario has a 'status' or similar field
  // const statusColors: { [key: string]: string } = {
  //   "default": "bg-gray-500/20 text-gray-400", 
  //   // Add more based on potential scenario categories if available
  // };
  // const scenarioCategory = scenario.category || "default"; // Assuming a category field

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent card click from triggering if the button itself is clicked
    // and the button is not disabled
    if ((e.target as HTMLElement).closest('button') && !isSimulationActive) {
      return;
    }
    if (isSimulationActive) {
        alert("Another simulation is already active. Please reset it from the Control Room if you wish to start a new one.");
        return;
    }
    onStartSimulation(scenario);
  };
  
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    if (isSimulationActive) {
      alert("Another simulation is already active. Please reset it from the Control Room if you wish to start a new one.");
      return;
    }
    onStartSimulation(scenario);
  };

  return (
    <Card 
        className={cn(
            "scenario-card overflow-hidden h-[320px] flex flex-col relative group",
            isSimulationActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg transition-shadow"
        )}
        onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
      
      <div 
        className="h-full w-full bg-cover bg-center"
        // Use scenario.image_url from the API response
        style={{ backgroundImage: `url(${scenario.image_url || '/placeholder.svg'})` }}
      >
        <div className="p-6 h-full flex flex-col justify-end relative z-20">
          {/* Example Badge - adapt if scenario has a displayable category/status */}
          {/* <Badge 
            variant="outline" 
            className={`mb-2 self-start ${statusColors[scenarioCategory]}`}
          >
            {scenarioCategory}
          </Badge> */}
          
          {/* Use scenario.name and scenario.description from API */}
          <h3 className="text-xl font-bold mb-1 text-white">{scenario.name}</h3>
          <p className="text-sm text-gray-300 mb-4 line-clamp-3">{scenario.description}</p>
          
          <div className="mt-auto">
            <Button 
              variant="default" 
              size="sm" 
              className={cn(
                "w-full bg-primary/80 hover:bg-primary transition-all duration-300",
                !isSimulationActive && "group-hover:translate-y-0 translate-y-2" // Only apply hover effect if not disabled
              )}
              onClick={handleButtonClick}
              disabled={isSimulationActive}
              aria-label={`Simulate ${scenario.name}`}
            >
              {isSimulationActive ? "Simulation Active" : "Simulate Now"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScenarioCard;
