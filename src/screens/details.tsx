import { Plus } from "lucide-react";
import { NavBar, Screen } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, Divider } from "@/components/ui/card";
import { CafeIdentity } from "@/components/cafe-bits";
import { HourlyChart, chartWindow, quietHint } from "@/components/hourly-chart";
import { CROWD_META, DAY_NAMES, SEATING_LABEL, hourLabel } from "@/lib/data";
import { getCafe, liveStatus, useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";

export function DetailsScreen({ cafeId }: { cafeId: string }) {
  const { state } = useStore();
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const now = new Date();
  const live = liveStatus(cafe, state.reports[cafe.id], now);
  const day = now.getDay();
  const hour = now.getHours();
  const hours = chartWindow(cafe.open, cafe.close, hour);
  const bars = hours.map((h) => ({
    hour: h,
    typical: cafe.typical[day][h],
    live: h === hour && live.open ? { crowd: live.crowd } : undefined,
  }));
  const perk = cafe.rewards[0];
  const directions = `https://maps.apple.com/?daddr=${encodeURIComponent(`${cafe.address}, New York, NY`)}&dirflg=w`;

  return (
    <Screen
      nav={<NavBar title="Café details" onBack={nav.pop} />}
      bodyClassName="pt-3"
      action={
        <Button disabled={!live.open} onClick={() => nav.push({ name: "update-crowd", cafeId: cafe.id })} className="disabled:opacity-50">
          {live.open ? (
            <>
              <Plus />
              Share an Update · +10 pts
            </>
          ) : (
            `Closed · Opens at ${hourLabel(cafe.open, true)}`
          )}
        </Button>
      }
    >
      <div className="flex flex-col gap-[10px]">
        <CafeIdentity cafe={cafe} />

        <div className="flex h-11 items-center justify-between">
          <p className="text-[13px] font-medium text-[#5c665e]">
            {cafe.walkMin} min walk · {cafe.miles} mi
          </p>
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center rounded-full bg-brand-soft px-[14px] text-[13px] font-semibold text-brand active:opacity-70"
          >
            Get Directions ↗
          </a>
        </div>

        <Card className="flex flex-col gap-2 px-[14px] py-3">
          <p className="text-[10px] font-semibold tracking-[0.5px] text-muted">RIGHT NOW</p>
          <div className="flex min-h-7 items-center justify-between gap-2">
            <p className="text-[22px] font-semibold" style={{ color: live.open ? CROWD_META[live.crowd].text : "#6e776f" }}>
              {live.open ? CROWD_META[live.crowd].long : "Closed now"}
            </p>
            {live.open && <p className="shrink-0 text-[12px] font-medium text-ink">{SEATING_LABEL[live.seating]}</p>}
          </div>
          <Divider />
          <p className="text-[11px] leading-[1.4] text-muted">{live.updatedLabel}</p>
        </Card>

        <Card className="flex flex-col gap-[10px] p-4">
          <button
            type="button"
            onClick={() => nav.switchTab("trends", { name: "trends", cafeId: cafe.id })}
            className="flex items-center justify-between font-semibold"
          >
            <span className="text-[16px] text-ink">Typical {DAY_NAMES[day]}</span>
            <span className="text-[12px] text-brand">View Trends →</span>
          </button>
          <HourlyChart bars={bars} nowHour={live.open ? hour : undefined} />
          <p className="text-[11px] leading-[1.4] text-muted">
            {quietHint(hours.map((h) => ({ hour: h, v: cafe.typical[day][h] })), Math.max(hour, hours[0]))}
          </p>
        </Card>

        {perk && (
          <button
            type="button"
            onClick={() => nav.switchTab("rewards", { name: "rewards", cafeId: cafe.id })}
            className="flex h-[54px] items-center justify-between gap-3 rounded-[16px] bg-moderate-soft p-3 text-left active:opacity-80"
          >
            <span className="truncate text-[13px] font-semibold text-ink">{perk.short ?? perk.title}</span>
            <span className="shrink-0 text-[12px] font-medium text-brand">{perk.points} pts · View reward →</span>
          </button>
        )}
      </div>
    </Screen>
  );
}
