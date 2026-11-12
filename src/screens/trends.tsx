import * as React from "react";
import { NavBar, Screen } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { CafeIdentity } from "@/components/cafe-bits";
import { HourlyChart, chartWindow, quietHint } from "@/components/hourly-chart";
import { CAFES, CROWD_META, DAYS, DAY_NAMES, SEATING_LABEL, hourLabel, levelToCrowd, type Crowd } from "@/lib/data";
import { getCafe, liveStatus, useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { cn, haptic } from "@/lib/utils";

const TYPICAL_SEATS: Record<Crowd, string> = {
  quiet: "Plenty of seats, usually",
  moderate: "Some seats, usually",
  busy: "Seats are hard to find",
};
const CROWD_WORD: Record<Crowd, string> = { quiet: "Quiet", moderate: "Moderate crowd", busy: "Very busy" };

/** 04 Occupancy trends */
export function TrendsScreen({ cafeId }: { cafeId: string }) {
  const { state, select } = useStore();
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const now = new Date();
  const today = now.getDay();
  const hourNow = now.getHours();
  const [day, setDay] = React.useState(today);
  const live = liveStatus(cafe, state.reports[cafe.id], now);
  const isToday = day === today;
  const hours = chartWindow(cafe.open, cafe.close, hourNow);
  const nowInRange = isToday && live.open && hours.includes(hourNow);
  const [sel, setSel] = React.useState<number>(nowInRange ? hourNow : hours[Math.floor(hours.length / 2)]);

  const bars = hours.map((h) => ({
    hour: h,
    typical: cafe.typical[day][h],
    live: nowInRange && h === hourNow ? { crowd: live.crowd } : undefined,
  }));

  const selIsNow = nowInRange && sel === hourNow;
  const selCrowd = selIsNow ? live.crowd : levelToCrowd(cafe.typical[day][sel] ?? 0);

  // Monday-first order like the design
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <Screen nav={<NavBar title="Occupancy trends" onBack={() => nav.switchTab("explore")} />}>
      <div className="flex flex-col gap-4">
        <CafeIdentity cafe={cafe} />

        {/* Café switcher keeps Trends useful straight from the tab bar */}
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {CAFES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                haptic();
                select(c.id);
                nav.switchTab("trends", { name: "trends", cafeId: c.id });
              }}
              className={cn(
                "h-[30px] shrink-0 rounded-full border border-line px-3 text-[11px]",
                c.id === cafe.id ? "bg-brand-soft font-semibold text-brand" : "bg-white text-ink",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-[10px]">
          <p className="text-[16px] font-semibold text-ink">
            {DAY_NAMES[day]}
            {isToday ? ", today" : ""}
          </p>
          <div className="flex gap-[6px]" role="tablist" aria-label="Day of week">
            {order.map((d) => {
              const on = d === day;
              return (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    haptic();
                    setDay(d);
                    if (d !== today) setSel(hours[Math.floor(hours.length / 2)]);
                    else if (nowInRange || hours.includes(hourNow)) setSel(hourNow);
                  }}
                  className={cn(
                    "flex h-11 min-w-0 flex-1 items-center justify-center rounded-[12px] border text-[12px] transition-colors",
                    on ? "border-brand bg-brand font-semibold text-white" : "border-line bg-white text-subtle",
                  )}
                >
                  {DAYS[d]}
                </button>
              );
            })}
          </div>
        </div>

        <Card className="flex flex-col gap-[10px] p-4">
          <p className="text-[16px] font-semibold text-ink">Hourly occupancy</p>
          <HourlyChart size="lg" bars={bars} nowHour={nowInRange ? hourNow : undefined} selected={sel} onSelect={setSel} />
          <p className="text-[11px] leading-[1.4] text-muted">
            {quietHint(hours.map((h) => ({ hour: h, v: cafe.typical[day][h] })), isToday ? Math.max(hourNow, hours[0]) : hours[0])}
          </p>
        </Card>

        <div className="flex flex-col gap-[6px] rounded-[16px] bg-brand-soft p-4" aria-live="polite">
          <p className="text-[14px] font-semibold text-brand">
            {hourLabel(sel, true)} · {selIsNow ? "Current hour" : isToday ? (sel < hourNow ? "Earlier today" : "Later today") : `Typical ${DAY_NAMES[day]}`}
          </p>
          <p className="text-[12px] text-subtle">
            {selIsNow
              ? `${CROWD_WORD[selCrowd]} · ${SEATING_LABEL[live.seating]} available`.replace("No seats available", "No seats right now")
              : `${CROWD_WORD[selCrowd]} · ${TYPICAL_SEATS[selCrowd]}`}
          </p>
          {selIsNow && (
            <p className="text-[11px] text-muted" style={{ color: CROWD_META[selCrowd].text }}>
              {live.updatedLabel}
            </p>
          )}
        </div>
      </div>
    </Screen>
  );
}
