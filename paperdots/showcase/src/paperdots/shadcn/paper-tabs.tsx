import * as React from "react";
import { cn } from "./utils";
import type { RisographPalette, DotGeometry } from "../types";
import { DEFAULT_PALETTE } from "../palettes";
import { TactileAudio } from "../audio";

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
  palette: RisographPalette;
  dotShape: DotGeometry;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  palette = DEFAULT_PALETTE,
  dotShape = "square",
  className,
  children,
  ...props
}: TabsProps) {
  const [value, setValue] = React.useState<string>(
    controlledValue || defaultValue || ""
  );

  const currentValue = controlledValue !== undefined ? controlledValue : value;

  const handleValueChange = (newVal: string) => {
    TactileAudio.playClick(650);
    if (controlledValue === undefined) {
      setValue(newVal);
    }
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        palette,
        dotShape,
      }}
    >
      <div className={cn("flex flex-col gap-3 font-mono", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center rounded-xl bg-black/5 p-1 text-black/60",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, children, ...props }, ref) => {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-mono font-bold transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        isActive
          ? "bg-white text-black shadow-xs"
          : "hover:bg-white/40 text-black/70",
        className
      )}
      {...props}
    >
      {isActive && (
        <span
          className="mr-1.5 inline-block text-[10px]"
          style={{ color: ctx?.palette.primary }}
        >
          {ctx?.dotShape === "square" ? "■" : ctx?.dotShape === "diamond" ? "◆" : "●"}
        </span>
      )}
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    if (ctx?.value !== value) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border p-4 shadow-2xs font-mono text-xs focus-visible:outline-none",
          className
        )}
        style={{
          backgroundColor: ctx?.palette.cardBg || "#FFFFFF",
          borderColor: ctx?.palette.border || "rgba(0,0,0,0.1)",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";
