import * as React from "react";
import { cn } from "./utils";
import { PaperDotToggle } from "../components/PaperDotToggle";
import type { RisographPalette, DotGeometry } from "../types";
import { DEFAULT_PALETTE } from "../palettes";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  inkColor?: string;
  label?: string;
}

export const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      className,
      palette = DEFAULT_PALETTE,
      dotShape = "square",
      inkColor,
      label,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        <PaperDotToggle
          checked={checked}
          onChange={(newVal) => {
            if (!disabled) onCheckedChange(newVal);
          }}
          palette={palette}
          dotShape={dotShape}
          inkColor={inkColor}
          label={label}
        />
      </div>
    );
  }
);
Switch.displayName = "Switch";
