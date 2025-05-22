
// No changes needed to useState as perspective is now from context
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Perspective } from "@/types/simulation"; // This type might be a string union: 'CRO' | 'Regulator' | 'Investor'
import { useSimulation } from "@/App"; // Import the context hook

// HeaderProps no longer needs perspective and setPerspective, as they come from context
interface HeaderProps {
  // Add any other props Header might need, if any
}

const Header = ({/* Remove perspective, setPerspective from props */}: HeaderProps) => {
  const { currentPerspective, setCurrentPerspective } = useSimulation(); // Use context
  
  // Ensure this list matches the valid perspectives for your application
  const perspectives: Perspective[] = ["CRO", "Regulator", "Investor"];

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
                {/* Display currentPerspective from context */}
                <span className="font-medium">{currentPerspective}</span> 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {perspectives.map((p) => (
                <DropdownMenuItem 
                  key={p}
                  // Highlight based on currentPerspective from context
                  className={currentPerspective === p ? "bg-primary/20" : ""} 
                  // Update perspective using setCurrentPerspective from context
                  onClick={() => setCurrentPerspective(p)} 
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
