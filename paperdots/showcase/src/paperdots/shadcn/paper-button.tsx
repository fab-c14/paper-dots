import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";
import { PaperDotButton } from "../components/PaperDotButton";
import type { RisographPalette, DotGeometry, ButtonAnimationType } from "../types";
import { DEFAULT_PALETTE } from "../palettes";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-mono font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#0078BF] text-white shadow-xs hover:bg-[#0078BF]/90 active:scale-97",
        secondary:
          "bg-[#F5EFE6] text-[#212121] border border-black/10 hover:bg-[#EADBCA] active:scale-97",
        destructive:
          "bg-[#C5221F] text-white shadow-xs hover:bg-[#C5221F]/90 active:scale-97",
        outline:
          "border border-black/15 bg-white text-black shadow-xs hover:bg-black/5 active:scale-97",
        ghost: "hover:bg-black/5 text-black",
        link: "text-[#0078BF] underline-offset-4 hover:underline",
        "paper-kinetic": "p-0 bg-transparent border-none shadow-none",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  burstIntensity?: 'none' | 'gentle' | 'confetti';
  animationType?: ButtonAnimationType;
  inkColor?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      palette = DEFAULT_PALETTE,
      dotShape = "square",
      burstIntensity = "gentle",
      animationType = "hydraulic-pop",
      inkColor,
      onClick,
      ...props
    },
    ref
  ) => {
    // If variant is "paper-kinetic", render the full tactile Canvas PaperDotButton
    if (variant === "paper-kinetic") {
      const labelText = typeof children === "string" ? children : "Action";
      const w = size === "sm" ? 140 : size === "lg" ? 200 : 160;
      const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;

      return (
        <PaperDotButton
          label={labelText}
          palette={palette}
          dotShape={dotShape}
          burstIntensity={burstIntensity}
          animationType={animationType}
          inkColor={inkColor}
          width={w}
          height={h}
          onClick={onClick as () => void}
          className={className}
        />
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
