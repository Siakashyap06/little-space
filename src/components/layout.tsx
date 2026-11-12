import * as React from "react";
import { ChartNoAxesColumn, ChevronLeft, Coffee, Map as MapIcon, X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { cn, haptic } from "@/lib/utils";
import { useStore } from "@/lib/store";

export type Tab = "explore" | "trends" | "rewards";

/** Points balance pill shown in every navigation bar. */
export function PointsPill() {
  const { state } = useStore();
  return (
    <div
      className="flex h-8 shrink-0 items-center gap-[5px] rounded-full bg-brand-soft px-[10px] text-[12px] font-semibold text-brand-deep"
      aria-label={`${state.points} points`}
    >
      <Coffee className="size-[14px]" strokeWidth={2} />
      <span key={state.points} className="inline-block tabular-nums animate-pop">
        {state.points} pts
      </span>
    </div>
  );
}

/** 48px navigation bar: 44px control · title (Semi Bold 15) · points pill. */
export function NavBar({
  title,
  onBack,
  close = false,
}: {
  title: string;
  onBack?: () => void;
  close?: boolean;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-5">
      {onBack ? (
        <IconButton label={close ? "Close" : "Back"} onClick={onBack}>
          {close ? <X strokeWidth={2} /> : <ChevronLeft strokeWidth={2} />}
        </IconButton>
      ) : (
        <div className="size-11" />
      )}
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{title}</h1>
      <PointsPill />
    </header>
  );
}

const TABS: { id: Tab; label: string; Icon: typeof MapIcon }[] = [
  { id: "explore", label: "Explore", Icon: MapIcon },
  { id: "trends", label: "Trends", Icon: ChartNoAxesColumn },
  { id: "rewards", label: "Rewards", Icon: Coffee },
];

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="relative z-30 flex shrink-0 items-start border-t border-line bg-canvas px-[30px] pt-3"
      style={{ paddingBottom: "max(26px, var(--safe-bottom))" }}
      aria-label="Main"
    >
      {TABS.map(({ id, label, Icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => {
              haptic();
              onChange(id);
            }}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center gap-1 text-[10px] transition-opacity active:opacity-60",
              on ? "font-semibold text-brand" : "text-muted",
            )}
          >
            <Icon className="size-[21px]" strokeWidth={on ? 2 : 1.75} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

/** Bottom-anchored primary action, 12px above the tab bar (Figma y = 724). */
export function BottomAction({ children }: { children: React.ReactNode }) {
  return <div className="shrink-0 bg-gradient-to-t from-canvas from-70% to-canvas/0 px-5 pb-3 pt-3">{children}</div>;
}

/** Standard screen: safe top + nav bar + scrollable body + optional bottom action. */
export function Screen({
  nav,
  children,
  action,
  className,
  bodyClassName,
}: {
  nav?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div style={{ height: "var(--safe-top)" }} className="shrink-0" />
      {nav}
      <div className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4", bodyClassName)}>
        {children}
      </div>
      {action && <BottomAction>{action}</BottomAction>}
    </div>
  );
}

/** iOS status bar, only drawn inside the desktop device preview frame. */
export function StatusBar() {
  const [time, setTime] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  const hh = time.getHours();
  const label = `${hh % 12 === 0 ? 12 : hh % 12}:${String(time.getMinutes()).padStart(2, "0")}`;
  return (
    <div className="device-only pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[62px] items-center justify-between px-[38px] pt-[6px] text-ink">
      <span className="w-[54px] text-center text-[17px] font-semibold tracking-[-0.3px]">{label}</span>
      <div className="absolute left-1/2 top-[11px] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-[7px]">
        <svg width="19" height="12" viewBox="0 0 19 12" aria-hidden>
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" fill="currentColor" />
          <rect x="5" y="5" width="3.2" height="7" rx="1" fill="currentColor" />
          <rect x="10" y="2.5" width="3.2" height="9.5" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3.2" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden>
          <path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 0 0 8.5.6 10.4 10.4 0 0 0 1.1 3.6l1.2 1.2A8.7 8.7 0 0 1 8.5 2.3Zm0 3.4c1.5 0 2.8.6 3.8 1.5l1.2-1.2a7 7 0 0 0-10 0l1.2 1.2c1-.9 2.3-1.5 3.8-1.5Zm0 3.4c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.7c.4-.4.9-.6 1.5-.6Z" fill="currentColor" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
          <rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".35" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".4" />
        </svg>
      </div>
    </div>
  );
}
