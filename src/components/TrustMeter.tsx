
import { Progress } from "@/components/ui/progress";

interface TrustMeterProps {
  trust: number;
  label?: string;
}

const TrustMeter = ({ trust, label }: TrustMeterProps) => {
  const getColor = () => {
    if (trust >= 70) return "bg-green-500";
    if (trust >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      {label && (
        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
          <span>{label}</span>
          <span>{trust}%</span>
        </div>
      )}
      <Progress 
        value={trust} 
        className="h-2" 
        indicatorClassName={getColor()} 
      />
    </div>
  );
};

export default TrustMeter;
