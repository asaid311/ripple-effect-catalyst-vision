
import { useState } from "react";
import { scenarios } from "@/data/scenarios";
import ScenarioCard from "@/components/ScenarioCard";
import { Perspective, ScenarioStatus } from "@/types/simulation";

interface ScenarioControlRoomProps {
  perspective: Perspective;
}

const ScenarioControlRoom = ({ perspective }: ScenarioControlRoomProps) => {
  const [filter, setFilter] = useState<ScenarioStatus | "All">("All");
  
  const filteredScenarios = filter === "All" 
    ? scenarios 
    : scenarios.filter(scenario => scenario.status === filter);

  return (
    <div className="container py-24">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Scenario Control Room</h1>
        <p className="text-xl text-muted-foreground">
          Simulate the high-stakes consequences of altering Business Credit Agreements 
          in a volatile ecosystem of competitive bureaus.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => setFilter("All")}
            className={`px-4 py-2 rounded-md transition-all ${filter === "All" ? "bg-secondary text-white" : "text-muted-foreground hover:text-white"}`}
          >
            All Scenarios
          </button>
          <button 
            onClick={() => setFilter("Strategic Gain")}
            className={`px-4 py-2 rounded-md transition-all ${filter === "Strategic Gain" ? "bg-green-500/20 text-green-400" : "text-muted-foreground hover:text-white"}`}
          >
            Strategic Gain
          </button>
          <button 
            onClick={() => setFilter("Rising Tension")}
            className={`px-4 py-2 rounded-md transition-all ${filter === "Rising Tension" ? "bg-yellow-500/20 text-yellow-400" : "text-muted-foreground hover:text-white"}`}
          >
            Rising Tension
          </button>
          <button 
            onClick={() => setFilter("Ecosystem Shock")}
            className={`px-4 py-2 rounded-md transition-all ${filter === "Ecosystem Shock" ? "bg-red-500/20 text-red-400" : "text-muted-foreground hover:text-white"}`}
          >
            Ecosystem Shock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Viewing scenarios from {perspective} perspective</p>
      </div>
    </div>
  );
};

export default ScenarioControlRoom;
