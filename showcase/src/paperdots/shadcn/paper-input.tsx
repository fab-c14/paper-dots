import * as React from "react";
import { cn } from "./utils";
import { PaperDotInput } from "../components/PaperDotInput";
import type { RisographPalette, DotGeometry } from "../types";
import { DEFAULT_PALETTE } from "../palettes";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  withKineticBorder?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      palette = DEFAULT_PALETTE,
      dotShape = "square",
      withKineticBorder = false,
      value,
      onChange,
      placeholder,
      ...props
    },
    ref
  ) => {
    if (withKineticBorder) {
      return (
        <PaperDotInput
          value={String(value || "")}
          onChange={(val) => {
            if (onChange) {
              const event = {
                target: { value: val },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(event);
            }
          }}
          placeholder={placeholder}
          palette={palette}
          dotShape={dotShape}
          className={className}
        />
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2 text-xs font-mono shadow-xs transition-colors placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078BF] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          backgroundColor: palette.cardBg || "#FFFFFF",
          borderColor: palette.border || "rgba(0,0,0,0.15)",
          color: palette.dark,
        }}
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
