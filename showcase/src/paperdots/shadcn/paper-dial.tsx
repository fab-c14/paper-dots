import { cn } from "./utils";
import { PaperDotDial, type PaperDotDialProps } from "../components/PaperDotDial";

export interface DialProps extends PaperDotDialProps {
  className?: string;
}

export function Dial({ className, ...props }: DialProps) {
  return (
    <div className={cn("inline-flex flex-col items-center gap-1 font-mono", className)}>
      <PaperDotDial {...props} />
    </div>
  );
}
