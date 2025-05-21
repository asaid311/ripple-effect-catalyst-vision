
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Scenario, Perspective } from "@/types/simulation";
import AgentMap from "./AgentMap";
import MoveCard from "./MoveCard";
import PerspectiveView from "./PerspectiveView";

interface SimulationDashboardProps {
  scenario: Scenario;
  perspective?: Perspective;
}

const SimulationDashboard = ({ scenario, perspective = "CRO" }: SimulationDashboardProps) => {
  const [currentMoveId, setCurrentMoveId] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [currentPerspective, setCurrentPerspective] = useState<Perspective>(perspective);
  
  // Set default selected move to the first one if none selected
  const selectedMoveIndex = currentMoveId 
    ? scenario.moves.findIndex(m => m.id === currentMoveId)
    : 0;
  
  const handleExecuteMove = () => {
    if (!currentMoveId) return;
    
    setRound(prev => prev + 1);
    // In a real implementation, this would update the scenario state based on the move
  };
  
  const getStatusColor = () => {
    switch (scenario.status) {
      case "Strategic Gain":
        return "text-green-400";
      case "Rising Tension":
        return "text-yellow-400";
      case "Ecosystem Shock":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };
  
  const getStatusEmoji = () => {
    switch (scenario.status) {
      case "Strategic Gain": return "🟢";
      case "Rising Tension": return "🟡";
      case "Ecosystem Shock": return "🔴";
      default: return "";
    }
  };
  
  return (
    <div className="container py-24 max-w-7xl">
      <Card className="mb-8 animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Scenario</div>
              <CardTitle>{scenario.title}</CardTitle>
            </div>
            <div className="flex items-center">
              <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor()} bg-card border border-border animate-pulse`}>
                {getStatusEmoji()} {scenario.status}
              </div>
              <div className="ml-4 px-3 py-1.5 rounded-full text-sm font-medium bg-card border border-border">
                Round {round}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{scenario.backgroundContext}</p>
          
          <PerspectiveView perspective={currentPerspective} showFor={["CRO"]}>
            <div className="mt-4 px-4 py-3 bg-primary/5 rounded-md border border-primary/10">
              <p className="text-sm font-medium text-primary">CRO Perspective: </p>
              <p className="text-sm">Focus on revenue implications and competitive positioning against other bureaus.</p>
            </div>
          </PerspectiveView>
          
          <PerspectiveView perspective={currentPerspective} showFor={["Regulator"]}>
            <div className="mt-4 px-4 py-3 bg-yellow-500/5 rounded-md border border-yellow-500/10">
              <p className="text-sm font-medium text-yellow-500">Regulator Perspective: </p>
              <p className="text-sm">Consider systemic risk implications and consumer protection concerns.</p>
            </div>
          </PerspectiveView>
          
          <PerspectiveView perspective={currentPerspective} showFor={["Investor"]}>
            <div className="mt-4 px-4 py-3 bg-green-500/5 rounded-md border border-green-500/10">
              <p className="text-sm font-medium text-green-500">Investor Perspective: </p>
              <p className="text-sm">Evaluate long-term market position and competitive advantage implications.</p>
            </div>
          </PerspectiveView>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AgentMap scenario={scenario} />
          
          <div className="mt-6">
            <Card className="transition-all hover:shadow-md duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bureau Response Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Execute a move to see how the bureau ecosystem responds to your strategic decision.
                </p>
                
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    disabled={!currentMoveId}
                    onClick={handleExecuteMove}
                    className="px-8 transform transition-transform duration-200 hover:scale-105"
                  >
                    Execute Move
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="animate-fade-in">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Available Strategic Moves</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="moves" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="moves" className="flex-1">Moves</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="moves" className="space-y-4">
                  {scenario.moves.slice(0, 3).map((move) => (
                    <MoveCard
                      key={move.id}
                      move={move}
                      isActive={move.id === currentMoveId}
                      onSelect={() => setCurrentMoveId(move.id)}
                      perspective={currentPerspective}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="text-center py-8 text-muted-foreground">
                    No moves executed yet.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimulationDashboard;
