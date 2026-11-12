import * as React from "react";
import { Armchair, ArrowRight, Search } from "lucide-react";
import { NavBar } from "@/components/layout";
import { LesMap } from "@/components/les-map";
import { Button } from "@/components/ui/button";
import { CafePhoto } from "@/components/cafe-bits";
import { CROWD_META, SEATING_LABEL, hoursLine, type Cafe } from "@/lib/data";
import { getCafe, liveStatus, useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";

/** 02 Café preview — expanded bottom sheet over the map. Drag the handle down to dismiss. */
export function PreviewScreen({ cafeId }: { cafeId: string }) {
  const { state, select } = useStore();
  const nav = useNav();
  const cafe = getCafe(cafeId);
  const live = liveStatus(cafe, state.reports[cafe.id]);
  const crowdText = live.crowd === "moderate" ? "#946321" : CROWD_META[live.crowd].text;
  const [dragY, setDragY] = React.useState(0);
  const start = React.useRef<number | null>(null);

  const statusOf = React.useCallback((c: Cafe) => liveStatus(c, state.reports[c.id]), [state.reports]);

  return (
    <div className="relative flex h-full flex-col">
      <div style={{ height: "var(--safe-top)" }} className="shrink-0" />
      <NavBar title="Explore cafés" onBack={nav.pop} />
      <div className="shrink-0 px-5 pt-4">
        <button
          type="button"
          onClick={nav.pop}
          className="flex h-[46px] w-full items-center gap-[10px] rounded-[16px] border border-line bg-white px-[14px] text-left"
        >
          <Search className="size-[18px] text-muted" strokeWidth={2} />
          <span className="text-[13px] leading-[1.4] text-muted">Search cafés or an area</span>
        </button>
      </div>

      <div className="relative mt-[14px] min-h-0 flex-1">
        <LesMap
          className="absolute inset-x-0 top-0 h-[300px]"
          statusOf={statusOf}
          selectedId={cafe.id}
          onSelect={(c) => {
            select(c.id);
            nav.replaceAfter("explore", { name: "preview", cafeId: c.id });
          }}
          focusY={0.28}
        />

        {/* Expanded café sheet (Figma y=366) */}
        <section
          className="absolute inset-x-0 bottom-0 top-[180px] z-20 flex flex-col rounded-t-[28px] bg-canvas shadow-sheet"
          style={{ transform: `translateY(${dragY}px)`, transition: start.current === null ? "transform .25s ease-out" : "none" }}
          aria-label={`${cafe.name} preview`}
        >
          <div
            className="flex shrink-0 touch-none justify-center pb-3 pt-[10px]"
            onPointerDown={(e) => {
              start.current = e.clientY;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => start.current !== null && setDragY(Math.max(0, e.clientY - start.current))}
            onPointerUp={() => {
              const d = dragY;
              start.current = null;
              if (d > 90) nav.pop();
              else setDragY(0);
            }}
          >
            <span className="h-1 w-9 rounded-[2px] bg-line" />
          </div>
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
            <CafePhoto cafe={cafe} eager className="h-[132px] w-full" />
            <div className="flex flex-col gap-[3px]">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[26px] font-semibold tracking-[-0.7px] text-ink">{cafe.name}</p>
                <p className="shrink-0 text-[11px] text-brand">{hoursLine(cafe)}</p>
              </div>
              <p className="text-[12px] leading-[1.4] text-muted">
                {cafe.address} · {cafe.neighborhood}
              </p>
            </div>
            <p className="text-[13px] font-medium text-brand">
              {cafe.walkMin} min walk · {cafe.miles} mi away
            </p>
            <div className="flex h-16 items-center gap-3 rounded-[16px] bg-white p-3">
              <p className="shrink-0 text-[16px] font-semibold" style={{ color: live.open ? crowdText : "#6e776f" }}>
                {live.open ? CROWD_META[live.crowd].long : "Closed now"}
              </p>
              <div className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[1.4]">
                <p className="text-[14px] font-semibold text-ink">{live.open ? SEATING_LABEL[live.seating] : hoursLine(cafe)}</p>
                <p className="text-[10px] text-muted">{live.open ? live.updatedLabel : "Check back when it opens"}</p>
              </div>
              <Armchair className="size-5 shrink-0 text-brand" strokeWidth={1.75} />
            </div>
            <Button onClick={() => nav.push({ name: "details", cafeId: cafe.id })}>
              <ArrowRight />
              View Details
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
