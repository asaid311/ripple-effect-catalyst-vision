
import { useState } from "react";
import Header from "@/components/Header";
import ScenarioControlRoom from "@/components/ScenarioControlRoom";
import { Perspective } from "@/types/simulation";

const Index = () => {
  const [perspective, setPerspective] = useState<Perspective>("CRO");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header perspective={perspective} setPerspective={setPerspective} />
      <ScenarioControlRoom perspective={perspective} />
    </div>
  );
};

export default Index;
