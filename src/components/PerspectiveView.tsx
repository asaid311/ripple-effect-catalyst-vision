
import { Perspective } from "@/types/simulation";

interface PerspectiveViewProps {
  perspective: Perspective;
  children: React.ReactNode;
  showFor: Perspective[];
}

/**
 * Component that conditionally renders content based on the current perspective
 */
const PerspectiveView = ({ perspective, children, showFor }: PerspectiveViewProps) => {
  // Only render content if current perspective is in the showFor array
  if (!showFor.includes(perspective)) {
    return null;
  }

  return <>{children}</>;
};

export default PerspectiveView;
