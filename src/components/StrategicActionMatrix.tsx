import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define Impact and Probability/Effort levels for typing and iteration
// For simplicity, using 0 (Low), 1 (Medium), 2 (High) to map to 3 levels
export type Level = 0 | 1 | 2; 

export const IMPACT_LABELS: Record<Level, string> = { 0: 'Low Impact', 1: 'Medium Impact', 2: 'High Impact' };
export const PROBABILITY_LABELS: Record<Level, string> = { 0: 'Low Probability', 1: 'Medium Probability', 2: 'High Probability' };
// Alternative for X-axis: Effort
// export const EFFORT_LABELS: Record<Level, string> = { 0: 'High Effort', 1: 'Medium Effort', 2: 'Low Effort' };


export interface MatrixAction {
  id: string;
  label: string;
  impact: Level; 
  probability: Level; // or effort: Level
  description?: string;
}

interface StrategicActionMatrixProps {
  actions: MatrixAction[];
  impactLevels?: Record<Level, string>;
  probabilityLevels?: Record<Level, string>; // Or effortLevels
  title?: string;
  description?: string;
  // Quadrant names can be passed as props for customization if needed
  quadrantNames?: { // (Probability, Impact)
    '2,2': string; // High Prob, High Impact
    '0,2': string; // Low Prob, High Impact
    '2,0': string; // High Prob, Low Impact
    '0,0': string; // Low Prob, Low Impact
    // Add more for 3x3 if using Medium levels distinctly for quadrants
    '1,2'?: string; // Med Prob, High Impact
    '2,1'?: string; // High Prob, Med Impact
    // etc.
  };
}

const DEFAULT_QUADRANT_NAMES_PROB_IMPACT = {
  '2,2': '⭐ Quick Wins / High Value', // High Prob, High Impact
  '0,2': '💡 Major Projects / Strategic',   // Low Prob, High Impact
  '2,0': '🔧 Fill-ins / Minor Tasks',      // High Prob, Low Impact
  '0,0': '🗑️ Thankless Tasks / Reconsider',// Low Prob, Low Impact
  // For a 3x3, more specific names might be needed
  '1,2': 'Major Opportunities', // Med Prob, High Impact
  '2,1': 'Likely Improvements', // High Prob, Med Impact
  '0,1': 'Potential Longshots', // Low Prob, Med Impact
  '1,0': 'Incremental Gains',   // Med Prob, Low Impact
  '1,1': 'Consider & Prioritize',// Med Prob, Med Impact
};


const StrategicActionMatrix = ({
  actions,
  impactLevels = IMPACT_LABELS,
  probabilityLevels = PROBABILITY_LABELS,
  title = "Strategic Action Matrix",
  description = "Plotting potential actions by impact and probability.",
  quadrantNames = DEFAULT_QUADRANT_NAMES_PROB_IMPACT,
}: StrategicActionMatrixProps) => {
  const numImpactLevels = Object.keys(impactLevels).length; // Should be 3
  const numProbabilityLevels = Object.keys(probabilityLevels).length; // Should be 3

  // Initialize grid
  const grid: MatrixAction[][][] = Array(numImpactLevels)
    .fill(null)
    .map(() => Array(numProbabilityLevels).fill(null).map(() => []));

  // Populate grid
  actions.forEach(action => {
    // Ensure impact/probability values are valid Levels
    const r = Math.max(0, Math.min(action.impact, numImpactLevels - 1)) as Level;
    const c = Math.max(0, Math.min(action.probability, numProbabilityLevels - 1)) as Level;
    // Impact is Y-axis (High impact at top). Probability is X-axis (High probability to the right).
    grid[numImpactLevels - 1 - r][c].push(action);
  });

  // Quadrant background colors - can be customized
  // (Prob_Index, Impact_Index) from bottom-left (0,0) to top-right (2,2)
  // Impact Index for color mapping (numImpactLevels - 1 - rowIndex)
  // Prob Index for color mapping (colIndex)
  const quadrantColors: { [key: string]: string } = {
    '2,2': 'bg-green-100 border-green-300',   // High Prob, High Impact
    '0,2': 'bg-blue-100 border-blue-300',    // Low Prob, High Impact
    '2,0': 'bg-yellow-100 border-yellow-300',  // High Prob, Low Impact
    '0,0': 'bg-red-100 border-red-300',      // Low Prob, Low Impact
    '1,2': 'bg-green-50 border-green-200',   // Med Prob, High Impact
    '2,1': 'bg-yellow-50 border-yellow-200', // High Prob, Med Impact
    '0,1': 'bg-blue-50 border-blue-200',     // Low Prob, Med Impact
    '1,0': 'bg-orange-50 border-orange-200', // Med Prob, Low Impact
    '1,1': 'bg-gray-100 border-gray-300',    // Med Prob, Med Impact
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex">
          {/* Y-Axis Labels (Impact) */}
          <div className="flex flex-col justify-around items-center pr-2 py-4 min-w-[50px]">
            <span className="transform -rotate-90 whitespace-nowrap text-sm font-medium text-muted-foreground mb-2">
                Impact →
            </span>
            {Object.values(impactLevels).slice().reverse().map((label, index) => (
              <div key={index} className="h-full flex items-center justify-center text-xs text-muted-foreground transform -rotate-90 origin-center whitespace-nowrap my-2">
                {label}
              </div>
            ))}
             <div className="h-8"></div> {/* Spacer for X-axis quadrant names */}
          </div>

          {/* Grid and X-Axis Quadrant Names */}
          <div className="flex-grow">
            <div
              className="grid border-t border-l border-border"
              style={{
                gridTemplateColumns: `repeat(${numProbabilityLevels}, minmax(150px, 1fr))`,
                gridTemplateRows: `repeat(${numImpactLevels}, minmax(120px, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cellActions, colIndex) => {
                  // Determine quadrant key: (Prob_Index from 0-2, Impact_Index from 0-2)
                  // colIndex corresponds to probability index (0=Low, 1=Med, 2=High)
                  // rowIndex means (numImpactLevels - 1 - rowIndex) for impact index (0=Low, 1=Med, 2=High)
                  const probIdx = colIndex as Level;
                  const impactIdx = (numImpactLevels - 1 - rowIndex) as Level;
                  const quadrantKey = `${probIdx},${impactIdx}`;
                  const quadrantName = quadrantNames[quadrantKey as keyof typeof quadrantNames] || "";
                  const bgColor = quadrantColors[quadrantKey] || 'bg-gray-50';

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn("border-b border-r border-border p-2 flex flex-col", bgColor)}
                      title={quadrantName}
                    >
                      <div className="text-center text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">{quadrantName}</div>
                      <div className="flex-grow space-y-1 overflow-y-auto">
                        {cellActions.length > 0 ? cellActions.map(action => (
                          <div
                            key={action.id}
                            className="p-1.5 bg-card text-card-foreground rounded shadow-sm text-[11px] leading-tight cursor-default hover:shadow-md"
                            title={action.description}
                          >
                            {action.label}
                          </div>
                        )) : (
                            <div className="text-xs text-gray-400 text-center italic h-full flex items-center justify-center">Empty</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* X-Axis Labels (Probability/Effort) */}
            <div className="flex pt-1 border-l border-r border-b border-border">
              {Object.values(probabilityLevels).map((label, index) => (
                <div
                  key={index}
                  className="flex-1 text-center text-xs font-medium text-muted-foreground py-1"
                  style={{minWidth: '150px'}}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-1 text-center text-sm font-medium text-muted-foreground">Probability / Ease of Implementation →</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategicActionMatrix;
