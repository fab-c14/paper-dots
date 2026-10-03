import { cn } from "./utils";
import { PaperDotRating, type PaperDotRatingProps } from "../components/PaperDotRating";

export interface RatingProps extends PaperDotRatingProps {
  className?: string;
}

export function Rating({ className, ...props }: RatingProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 font-mono", className)}>
      <PaperDotRating {...props} />
    </div>
  );
}
