
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SimulationDashboard from "@/components/SimulationDashboard";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/data/scenarios";
import { Perspective } from "@/types/simulation";

const SimulationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [perspective, setPerspective] = useState<Perspective>("CRO");
  
  const scenario = scenarios.find(s => s.id === id);
  
  useEffect(() => {
    // If scenario not found, redirect to home
    if (!scenario) {
      navigate("/");
    }
  }, [scenario, navigate]);
  
  if (!scenario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header perspective={perspective} setPerspective={setPerspective} />
      
      <div className="pt-16">
        <div className="container py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-2"
          >
            ← Back to Control Room
          </Button>
        </div>
        
        <SimulationDashboard scenario={scenario} />
      </div>
    </div>
  );
};

export default SimulationPage;
