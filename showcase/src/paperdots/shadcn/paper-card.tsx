import * as React from "react";
import { cn } from "./utils";
import type { RisographPalette, DotGeometry } from "../types";
import { DEFAULT_PALETTE } from "../palettes";
import { PaperDotCard } from "../components/PaperDotCard";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  withKineticBorder?: boolean;
  inkColor?: string;
  width?: number;
  height?: number;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      palette = DEFAULT_PALETTE,
      dotShape = "square",
      withKineticBorder = false,
      inkColor,
      width = 320,
      height = 200,
      children,
      ...props
    },
    ref
  ) => {
    if (withKineticBorder) {
      return (
        <PaperDotCard
          palette={palette}
          dotShape={dotShape}
          inkColor={inkColor}
          width={width}
          height={height}
          className={className}
        >
          {children}
        </PaperDotCard>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border bg-white text-[#1C1D1F] shadow-xs font-mono transition-shadow hover:shadow-md",
          className
        )}
        style={{
          backgroundColor: palette.cardBg || "#FFFFFF",
          borderColor: palette.border || "rgba(0,0,0,0.1)",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-mono text-lg font-bold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-mono opacity-70", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
