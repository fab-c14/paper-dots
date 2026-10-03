import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";
import { PaperDotBadge } from "../components/PaperDotBadge";
import type { RisographPalette, DotGeometry } from "../types";
import { DEFAULT_PALETTE } from "../palettes";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0078BF] text-white shadow-xs hover:bg-[#0078BF]/80",
        secondary:
          "border-transparent bg-[#F5EFE6] text-[#212121] hover:bg-[#EADBCA]",
        destructive:
          "border-transparent bg-[#C5221F] text-white shadow-xs hover:bg-[#C5221F]/80",
        outline: "text-foreground border-black/20",
        "paper-kinetic": "p-0 border-none bg-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  palette?: RisographPalette;
  dotShape?: DotGeometry;
}

export function Badge({
  className,
  variant = "default",
  children,
  palette = DEFAULT_PALETTE,
  dotShape = "square",
  ...props
}: BadgeProps) {
  if (variant === "paper-kinetic") {
    const labelText = typeof children === "string" ? children : "Badge";
    return (
      <PaperDotBadge
        label={labelText}
        palette={palette}
        dotShape={dotShape}
        className={className}
      />
    );
  }

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { badgeVariants };
