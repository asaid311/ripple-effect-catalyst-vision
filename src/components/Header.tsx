
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Perspective } from "@/types/simulation";

interface HeaderProps {
  perspective: Perspective;
  setPerspective: (perspective: Perspective) => void;
}

const Header = ({ perspective, setPerspective }: HeaderProps) => {
  const perspectives: Perspective[] = ["Regulator", "CRO", "Investor"];

  return (
    <header className="fixed top-0 left-0 right-0 z-10 py-4 px-6 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-primary font-bold text-xl">CATALYST</div>
          <span className="text-sm text-muted-foreground">by Experian</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-sm text-muted-foreground">
            Strategic Foresight Platform
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-primary/30">
                <span className="mr-2">Perspective:</span>
                <span className="font-medium">{perspective}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {perspectives.map((p) => (
                <DropdownMenuItem 
                  key={p}
                  className={perspective === p ? "bg-primary/20" : ""}
                  onClick={() => setPerspective(p)}
                >
                  {p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
