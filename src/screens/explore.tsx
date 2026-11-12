import * as React from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { NavBar } from "@/components/layout";
import { LesMap, RecenterButton, type MapHandle } from "@/components/les-map";
import { Chip } from "@/components/ui/choice";
import { Dot, OccupancyBadge } from "@/components/ui/badge";
import { CafePhoto } from "@/components/cafe-bits";
import { CAFES, CROWD_META, SEATING_LABEL, hoursLine, isOpen, type Cafe } from "@/lib/data";
import { getCafe, liveStatus, useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function ExploreScreen() {
  const { state, select } = useStore();
  const nav = useNav();
  const map = React.useRef<MapHandle>(null);
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [nearby, setNearby] = React.useState(true);
  const [openNow, setOpenNow] = React.useState(false);
  const [showCard, setShowCard] = React.useState(true);
  const now = new Date();

  const status = React.useCallback((c: Cafe) => liveStatus(c, state.reports[c.id], now), [state.reports]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = React.useMemo(() => {
    const ids = CAFES.filter((c) => (!nearby || c.walkMin <= 10) && (!openNow || isOpen(c))).map((c) => c.id);
    return new Set(ids);
  }, [nearby, openNow]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = CAFES.filter((c) => visible.has(c.id) || q);
    const matched = q
      ? list.filter((c) => [c.name, c.address, c.neighborhood, ...c.amenities].join(" ").toLowerCase().includes(q))
      : list;
    return [...matched].sort((a, b) => a.walkMin - b.walkMin);
  }, [query, visible]);

  const selected = getCafe(state.selectedCafeId);
  const selVisible = visible.has(selected.id);
  const live = liveStatus(selected, state.reports[selected.id], now);

  const choose = (c: Cafe) => {
    select(c.id);
    setShowCard(true);
    setSearching(false);
    setQuery("");
    (document.activeElement as HTMLElement | null)?.blur();
    map.current?.focus(c);
  };

  return (
    <div className="relative flex h-full flex-col">
      <div style={{ height: "var(--safe-top)" }} className="shrink-0" />
      <NavBar title="Lower East Side" />

      {/* Content block (Figma y=126): title, search, filters, legend */}
      <div className="relative z-20 flex shrink-0 flex-col gap-3 px-5 pb-[6px] pt-4">
        <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.7px] text-ink">Find a little space.</h2>
        <div className="relative">
          <label className="flex h-[46px] items-center gap-[10px] rounded-[16px] border border-line bg-white px-[14px] focus-within:border-brand">
            <Search className="size-[18px] shrink-0 text-muted" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearching(true)}
              onBlur={() => window.setTimeout(() => setSearching(false), 150)}
              placeholder="Search cafés or an area"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.4] text-ink outline-none placeholder:text-[13px] placeholder:text-muted"
              aria-label="Search cafés or an area"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="-mr-2 flex size-8 items-center justify-center text-muted">
                <X className="size-4" />
              </button>
            )}
          </label>
          {searching && (
            <div className="absolute inset-x-0 top-[52px] z-40 max-h-[340px] overflow-y-auto rounded-[16px] border border-line bg-white py-1 shadow-card animate-fade-in">
              {results.length === 0 && <p className="px-4 py-4 text-[13px] text-muted">No cafés match “{query}”.</p>}
              {results.map((c) => {
                const s = liveStatus(c, state.reports[c.id], now);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(c)}
                    className="flex w-full items-center gap-3 px-3 py-[10px] text-left active:bg-canvas"
                  >
                    <CafePhoto cafe={c} className="size-11 rounded-[12px]" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] font-semibold text-ink">{c.name}</span>
                      <span className="truncate text-[12px] text-muted">
                        {c.address} · {c.walkMin} min walk
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: s.open ? CROWD_META[s.crowd].text : "#6e776f" }}>
                      <Dot color={s.open ? CROWD_META[s.crowd].dot : "#9aa198"} />
                      {s.open ? CROWD_META[s.crowd].label : "Closed"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Chip active={nearby} onClick={() => setNearby((v) => !v)}>
            Nearby
          </Chip>
          <Chip active={openNow} onClick={() => setOpenNow((v) => !v)}>
            Open Now
          </Chip>
        </div>
        <div className="flex gap-6" aria-label="Legend">
          {(["quiet", "moderate", "busy"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1 text-[10px] text-muted">
              <Dot color={CROWD_META[k].dot} size={5} />
              {CROWD_META[k].label}
            </span>
          ))}
        </div>
      </div>

      {/* Map fills the rest down to the tab bar */}
      <LesMap
        ref={map}
        className="min-h-0 flex-1"
        statusOf={status}
        selectedId={showCard && selVisible ? selected.id : undefined}
        visibleIds={visible}
        onSelect={choose}
        onBackgroundTap={() => setShowCard(false)}
        focusY={0.36}
      >
        {visible.size === 0 && (
          <div className="absolute inset-x-5 top-6 z-20 rounded-[16px] border border-line bg-white p-4 text-center text-[13px] text-muted shadow-card">
            No cafés match these filters right now.
          </div>
        )}
        <RecenterButton
          onClick={() => map.current?.recenter()}
          className="right-5"
          style={{ bottom: showCard && selVisible ? 136 : 16 }}
        />
        {showCard && selVisible && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => nav.push({ name: "preview", cafeId: selected.id })}
            className="absolute inset-x-5 bottom-3 z-20 flex flex-col gap-3 rounded-[20px] border border-line bg-white px-[14px] pb-4 pt-[14px] text-left shadow-card transition-transform active:scale-[0.99] animate-rise"
            aria-label={`Open ${selected.name}`}
          >
            <span className="flex w-full items-center gap-3">
              <CafePhoto cafe={selected} eager className="size-[62px]" />
              <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                <span className="truncate text-[18px] font-semibold leading-[1.4] text-ink">{selected.name}</span>
                <span className="flex items-center gap-2">
                  <OccupancyBadge crowd={live.crowd} closed={!live.open} />
                  {live.open && <span className="whitespace-nowrap text-[12px] text-ink">{SEATING_LABEL[live.seating]}</span>}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink" strokeWidth={2} />
            </span>
            <span className={cn("text-[10px] leading-[1.4] text-muted")}>
              {selected.walkMin} min walk · {hoursLine(selected)}
            </span>
          </button>
        )}
      </LesMap>
    </div>
  );
}
