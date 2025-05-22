import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HeatmapPoint {
  id: string;
  label: string;
  risk: number; // 0 (Low) to 2 (High) for simplicity to map to 3 levels
  reward: number; // 0 (Low) to 2 (High)
  description?: string; // Optional description for tooltip or detail
}

interface RiskRewardHeatmapProps {
  data: HeatmapPoint[];
  // Defaulting to 3 levels: Low, Medium, High
  riskLevels?: string[]; 
  rewardLevels?: string[];
  title?: string;
  description?: string;
}

const DEFAULT_RISK_LEVELS = ['Low Risk', 'Medium Risk', 'High Risk'];
const DEFAULT_REWARD_LEVELS = ['Low Reward', 'Medium Reward', 'High Reward'];

// Color mapping based on risk/reward. (risk, reward)
// Higher reward is better, higher risk is worse.
// Reward is Y-axis (higher is better, so row 0 is High Reward)
// Risk is X-axis (lower is better, so col 0 is Low Risk)
const cellColors: { [key: string]: string } = {
  // High Reward
  '0,2': 'bg-green-500 hover:bg-green-600',   // Low Risk, High Reward (Best)
  '1,2': 'bg-yellow-500 hover:bg-yellow-600', // Medium Risk, High Reward
  '2,2': 'bg-orange-500 hover:bg-orange-600', // High Risk, High Reward
  // Medium Reward
  '0,1': 'bg-green-400 hover:bg-green-500',   // Low Risk, Medium Reward
  '1,1': 'bg-yellow-400 hover:bg-yellow-500', // Medium Risk, Medium Reward
  '2,1': 'bg-orange-400 hover:bg-orange-500', // High Risk, Medium Reward
  // Low Reward
  '0,0': 'bg-yellow-300 hover:bg-yellow-400', // Low Risk, Low Reward
  '1,0': 'bg-orange-300 hover:bg-orange-400', // Medium Risk, Low Reward
  '2,0': 'bg-red-500 hover:bg-red-600',     // High Risk, Low Reward (Worst)
};


const RiskRewardHeatmap = ({ 
  data, 
  riskLevels = DEFAULT_RISK_LEVELS, 
  rewardLevels = DEFAULT_REWARD_LEVELS,
  title = "Risk/Reward Heatmap",
  description = "Visualizing strategic options based on potential risk and reward."
}: RiskRewardHeatmapProps) => {
  const numRiskLevels = riskLevels.length;
  const numRewardLevels = rewardLevels.length;

  // Initialize grid
  const grid: (HeatmapPoint[] | null)[][] = Array(numRewardLevels)
    .fill(null)
    .map(() => Array(numRiskLevels).fill(null).map(() => []));

  // Populate grid
  data.forEach(point => {
    // Ensure risk/reward values are within bounds for array indexing
    const r = Math.max(0, Math.min(point.reward, numRewardLevels - 1));
    const c = Math.max(0, Math.min(point.risk, numRiskLevels - 1));
    // Reward is typically Y axis, high reward at top. So map reward to row index inversely.
    grid[numRewardLevels - 1 - r][c]?.push(point);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Y-axis label (Reward) */}
          <div className="flex items-center">
            <span className="transform -rotate-90 whitespace-nowrap text-sm font-medium text-muted-foreground mb-2">
              Magnitude of Reward →
            </span>
            <div className="grid gap-1 ml-4" style={{ gridTemplateRows: `repeat(${numRewardLevels}, minmax(0, 1fr))` }}>
                {rewardLevels.slice().reverse().map((levelLabel, rowIndex) => ( // Reverse to show High Reward at top
                    <div key={`reward-label-${rowIndex}`} className="flex items-center justify-center h-10 text-xs font-medium text-muted-foreground pr-2">
                         {levelLabel}
                    </div>
                ))}
            </div>
            {/* Heatmap Grid */}
            <div 
                className="grid border border-border" 
                style={{ 
                    gridTemplateColumns: `repeat(${numRiskLevels}, minmax(80px, 1fr))`,
                    gridTemplateRows: `repeat(${numRewardLevels}, minmax(80px, 1fr))` 
                }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cellItems, colIndex) => {
                  const colorKey = `${colIndex},${numRewardLevels - 1 - rowIndex}`; // (risk, reward)
                  const bgColor = cellColors[colorKey] || 'bg-gray-200 hover:bg-gray-300';
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "border border-border p-2 flex flex-col items-center justify-center text-xs text-white transition-colors duration-150",
                        bgColor
                      )}
                      title={cellItems && cellItems.length > 0 ? cellItems.map(p => p.label).join(', ') : 'Empty'}
                    >
                      {cellItems && cellItems.map(point => (
                        <div key={point.id} className="mb-1 p-1 bg-black/20 rounded text-center text-white text-[10px] leading-tight">
                          {point.label}
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* X-axis labels (Risk) */}
          <div className="flex mt-2 pl-12"> {/* Adjust pl for alignment with grid */}
            {riskLevels.map((level, index) => (
              <div
                key={index}
                className="flex-1 text-center text-xs font-medium text-muted-foreground"
                style={{ minWidth: '80px' }} // Match column width
              >
                {level}
              </div>
            ))}
          </div>
           <div className="mt-1 text-sm font-medium text-muted-foreground">Likelihood of Risk →</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskRewardHeatmap;
