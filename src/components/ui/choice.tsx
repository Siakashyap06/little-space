import * as React from "react";
import { Check } from "lucide-react";
import { cn, haptic } from "@/lib/utils";

/** Selection indicator: 23px ring, filled brand + check when selected. */
export function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[23px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
        checked ? "border-brand bg-brand" : "border-line bg-white",
      )}
    >
      {checked && <Check className="size-[15px] text-white" strokeWidth={2.5} />}
    </span>
  );
}

type ChoiceCardProps = {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  iconBox?: number;
  className?: string;
};

/** Crowd / seating choice rows from the Figma report flow. */
export function ChoiceCard({ selected, onSelect, icon, title, description, iconBox = 44, className }: ChoiceCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => {
        haptic();
        onSelect();
      }}
      className={cn(
        "flex w-full items-center gap-[14px] rounded-[16px] p-4 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]",
        selected ? "border-[1.5px] border-brand bg-brand-soft" : "border border-line bg-white",
        className,
      )}
    >
      <span
        className={cn("flex shrink-0 items-center justify-center rounded-[12px] text-brand [&_svg]:size-6", selected ? "bg-white" : "bg-canvas")}
        style={{ width: iconBox, height: iconBox }}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 leading-[1.4]">
        <span className={cn("text-[17px] font-semibold", selected ? "text-brand-deep" : "text-ink")}>{title}</span>
        {description && <span className="text-[12px] text-muted">{description}</span>}
      </span>
      <Radio checked={selected} />
    </button>
  );
}

/** Filter chips ("Nearby", "Open Now"). */
export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        haptic();
        onClick();
      }}
      className={cn(
        "relative flex h-[30px] items-center rounded-full border border-line px-3 text-[11px] transition-colors after:absolute after:-inset-y-2 after:inset-x-0 after:content-['']",
        active ? "bg-brand-soft font-semibold text-brand" : "bg-white text-ink",
      )}
    >
      {children}
    </button>
  );
}
