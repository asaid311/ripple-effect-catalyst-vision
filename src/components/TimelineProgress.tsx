
import { cn } from "@/lib/utils";

interface TimelineProgressProps {
  currentRound: number;
  totalRounds: number;
}

const TimelineProgress = ({ currentRound, totalRounds }: TimelineProgressProps) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Round Progress</span>
        <span className="text-xs text-muted-foreground">
          {currentRound} of {totalRounds}
        </span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-muted"></div>
        <div className="relative flex justify-between">
          {Array.from({ length: totalRounds }).map((_, index) => {
            const isPast = index < currentRound - 1;
            const isCurrent = index === currentRound - 1;
            const isFuture = index > currentRound - 1;
            
            return (
              <div key={index} className="relative flex flex-col items-center">
                <div className={cn(
                  "w-4 h-4 rounded-full z-10 transition-all duration-300",
                  isPast && "bg-primary",
                  isCurrent && "bg-primary ring-4 ring-primary/30",
                  isFuture && "bg-muted"
                )}></div>
                <div className={cn(
                  "mt-2 text-xs",
                  isPast && "text-primary",
                  isCurrent && "text-primary font-medium",
                  isFuture && "text-muted-foreground"
                )}>
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineProgress;
