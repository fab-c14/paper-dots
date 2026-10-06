import * as React from "react";
import { cn } from "./utils";
import { PaperDotSlider } from "../components/PaperDotSlider";
import type { RisographPalette, DotGeometry } from "../types";
import { DEFAULT_PALETTE } from "../palettes";

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  inkColor?: string;
  width?: number;
  label?: string;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue = [50],
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      palette = DEFAULT_PALETTE,
      dotShape = "square",
      inkColor,
      width = 240,
      label,
      className,
    },
    ref
  ) => {
    const currentVal = value ? value[0] : defaultValue[0];

    return (
      <div ref={ref} className={cn("inline-flex flex-col", className)}>
        <PaperDotSlider
          value={currentVal}
          min={min}
          max={max}
          step={step}
          onChange={(newVal) => {
            if (onValueChange) onValueChange([newVal]);
          }}
          palette={palette}
          dotShape={dotShape}
          inkColor={inkColor}
          width={width}
          label={label}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
