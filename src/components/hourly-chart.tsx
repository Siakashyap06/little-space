import { cn, haptic } from "@/lib/utils";
import { CROWD_META, hourLabel, type Crowd } from "@/lib/data";

export type Bar = { hour: number; typical: number; live?: { crowd: Crowd } };

const LIVE_LEVEL: Record<Crowd, number> = { quiet: 0.18, moderate: 0.39, busy: 0.63 };

/**
 * Qualitative hourly occupancy chart (Figma "Qualitative hourly occupancy chart").
 * size="sm" → café details preview (92px), size="lg" → trends screen (200px).
 */
export function HourlyChart({
  bars,
  nowHour,
  selected,
  onSelect,
  size = "sm",
}: {
  bars: Bar[];
  nowHour?: number;
  selected?: number;
  onSelect?: (h: number) => void;
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";
  const base = lg ? 160 : 59; // y of bar baseline
  const scale = lg ? 160 : 66;
  const guideBusy = lg ? 36 : 10;
  const guideQuiet = lg ? 122 : 40;
  const labelTop = lg ? 176 : 67;
  const highlightH = lg ? 164 : 63;

  return (
    <div className={cn("relative w-full", lg ? "h-[200px]" : "h-[92px]")}>
      {[
        ["Busy", guideBusy],
        ["Quiet", guideQuiet],
      ].map(([label, top]) => (
        <div key={label} className="absolute inset-x-0 flex h-[14px] items-center gap-[5px]" style={{ top: top as number }}>
          <span className="w-[60px] text-[10px] text-muted">{label}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
      ))}
      <div className="absolute bottom-0 left-[70px] right-0 top-0 flex justify-between">
        {bars.map((b) => {
          const isNow = b.hour === nowHour;
          const isSel = b.hour === selected;
          const h = Math.max(6, b.typical * scale);
          const liveH = b.live ? LIVE_LEVEL[b.live.crowd] * scale : 0;
          const liveColor = b.live ? CROWD_META[b.live.crowd].dot : undefined;
          return (
            <button
              type="button"
              key={b.hour}
              disabled={!onSelect}
              aria-label={`${hourLabel(b.hour, true)}${isNow ? ", now" : ""}`}
              aria-pressed={isSel}
              onClick={() => {
                haptic();
                onSelect?.(b.hour);
              }}
              className="relative h-full w-7 shrink-0 disabled:cursor-default"
            >
              {(isNow || isSel) && (
                <span
                  className={cn("absolute left-0 top-0 w-7 rounded-[6px] transition-colors", isNow ? "bg-moderate-soft" : "bg-brand-soft")}
                  style={{ height: highlightH }}
                />
              )}
              {isNow && b.live ? (
                <>
                  <span className="absolute left-[2px] w-[10px] rounded-b-[1px] rounded-t-[4px] bg-bar" style={{ top: base - h, height: h }} />
                  <span className="absolute left-[15px] w-[9px] rounded-[4px]" style={{ top: base - liveH, height: liveH, background: liveColor }} />
                </>
              ) : (
                <span
                  className={cn("absolute left-[2px] w-[19px] rounded-b-[1px] rounded-t-[4px] transition-colors", isSel && !isNow ? "bg-brand" : "bg-bar")}
                  style={{ top: base - h, height: h }}
                />
              )}
              {isNow && (
                <span className="absolute left-[2px] text-[9px] font-semibold text-moderate" style={{ top: lg ? 6 : 3 }}>
                  Now
                </span>
              )}
              <span
                className={cn(
                  "absolute left-[2px] whitespace-nowrap",
                  lg ? "text-[11px]" : "text-[10px]",
                  isNow ? "font-semibold text-moderate" : isSel ? "font-semibold text-brand" : "text-muted",
                )}
                style={{ top: labelTop }}
              >
                {hourLabel(b.hour)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 8 hours around "now" (4 before, 3 after), clamped to opening hours — like the 10 AM–5 PM design. */
export function chartWindow(open: number, close: number, now: number) {
  const len = Math.min(8, close - open);
  let start = Math.min(Math.max(now - 4, open), close - len);
  start = Math.max(open, start);
  return Array.from({ length: len }, (_, i) => start + i);
}

export function quietHint(values: { hour: number; v: number }[], from: number) {
  const after = values.filter((x) => x.hour >= from);
  const q = after.find((x, i) => x.v < 0.28 && after.slice(i).every((y) => y.v < 0.4));
  if (q) return `Usually quieter after ${hourLabel(Math.max(from, q.hour - 1), true)}.`;
  const min = [...values].sort((a, b) => a.v - b.v)[0];
  return min ? `Usually quietest around ${hourLabel(min.hour, true)}.` : "";
}
