import * as React from "react";
import { LocateFixed } from "lucide-react";
import { CAFES, CROWD_META, USER_LOCATION, type Cafe, type Crowd } from "@/lib/data";
import { cn, haptic } from "@/lib/utils";

/* Lower East Side map, rebuilt from the Figma "Lower East Side editable map" frame.
   Design space is 402px wide; it scales to the device width and can be dragged. */

const W = 402;
const ROWS = 13; // extends past the 508px Figma frame so taller phones stay filled
const STREETS = ["E Houston St", "Stanton St", "Rivington St", "Delancey St", "Broome St", "Grand St", "Hester St", "Canal St", "Division St", "E Broadway"];
const AVENUES = [
  { name: "Orchard St", x: 102, y: 249.6, w: 19.8, h: 52.2 },
  { name: "Ludlow St", x: 167, y: 253.6, w: 19.2, h: 48.3 },
  { name: "Essex St", x: 232, y: 259.5, w: 18.3, h: 42.4 },
  { name: "Norfolk St", x: 297, y: 252.6, w: 19.4, h: 49.3 },
];
export const MAP_H = -12 + 76 * ROWS;

function Block({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute flex items-center justify-center" style={{ left, top, width: 61.63, height: 68.12 }}>
      <div className="relative h-[60px] w-[52px] rotate-[10deg]">
        <div className="absolute left-1 top-[37px] h-5 w-[19px] bg-map-block" />
        <div className="absolute left-7 top-[27px] h-[30px] w-[21px] bg-map-block" />
        <div className="absolute left-7 top-[3px] h-[19px] w-[21px] bg-map-block" />
        <div className="absolute left-1 top-[3px] h-[29px] w-[19px] bg-map-block" />
      </div>
    </div>
  );
}

const MapBase = React.memo(function MapBase() {
  const blocks: { left: number; top: number }[] = [];
  for (let k = 0; k < ROWS; k++) {
    for (let c = 0; c < 8; c++) blocks.push({ left: 379.58 - 9 * k - 65 * c, top: -12 + 76 * k });
  }
  return (
    <div className="absolute inset-0 bg-map-bg" aria-hidden>
      {/* parks */}
      <div className="absolute flex items-center justify-center" style={{ left: 324.93, top: 12, width: 53.4, height: 64.76 }}>
        <div className="h-[58px] w-11 rotate-[10deg] bg-map-park" />
      </div>
      <div className="absolute flex items-center justify-center" style={{ left: -48.52, top: 30, width: 101.18, height: 468.59 }}>
        <div className="h-[470px] w-7 rotate-[9deg] bg-map-park" />
      </div>
      {blocks.map((b, i) => (
        <Block key={i} {...b} />
      ))}
      {/* cross streets */}
      {STREETS.map((name, k) => (
        <div key={name} className="absolute flex items-center justify-center" style={{ left: -23.47, top: 15 + 78 * k, width: 446.64, height: 97.84 }}>
          <div className="relative h-5 w-[450px] rotate-[10deg]">
            <div className="absolute left-0 top-0 w-[450px] bg-map-road" style={{ height: k % 3 === 0 ? 20 : 12 }} />
            <p className="absolute top-px whitespace-nowrap text-[10px] text-muted" style={{ left: k % 2 === 0 ? 228 : 91 }}>
              {name}
            </p>
          </div>
        </div>
      ))}
      {AVENUES.map((a) => (
        <div key={a.name} className="absolute flex items-center justify-center" style={{ left: a.x, top: a.y, width: a.w, height: a.h }}>
          <p className="-rotate-[81deg] whitespace-nowrap text-[10px] text-muted">{a.name}</p>
        </div>
      ))}
      <p className="absolute left-[117px] top-[319px] whitespace-nowrap text-[12px] tracking-[1.4px] text-map-label">LOWER EAST SIDE</p>
      <div className="absolute flex items-center justify-center" style={{ left: 192.09, top: 77, width: 82.66, height: 25.07 }}>
        <p className="rotate-[10deg] whitespace-nowrap text-[9px] text-map-label">Katz’s Delicatessen</p>
      </div>
    </div>
  );
});

const CLOSED = { label: "Closed", long: "Closed", text: "#6e776f", dot: "#9aa198", soft: "#ecebe5" };

function Marker({ cafe, crowd, closed, selected, onClick }: { cafe: Cafe; crowd: Crowd; closed: boolean; selected: boolean; onClick: () => void }) {
  const m = closed ? CLOSED : CROWD_META[crowd];
  const label = selected ? `${cafe.short} · ${m.label}` : m.label;
  // keep long selected labels inside the map's right edge
  const estW = 30 + label.length * 6.3;
  const shift = Math.min(0, W - 8 - (cafe.pos.x + estW));
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        haptic();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={`${cafe.name}, ${m.label}`}
      aria-pressed={selected}
      className={cn(
        "absolute flex h-[34px] -translate-x-0 items-center gap-[5px] whitespace-nowrap rounded-full px-[11px] text-[11px] font-semibold shadow-marker transition-[transform,background-color] duration-200 active:scale-95",
        selected ? "z-20 scale-[1.04] border-2 border-brand bg-moderate-soft" : "z-10 border border-line bg-white",
      )}
      style={{ left: cafe.pos.x + shift, top: cafe.pos.y, color: m.text, background: selected ? m.soft : undefined }}
    >
      <span className="size-[6px] rounded-full" style={{ background: m.dot }} />
      {label}
    </button>
  );
}

function YouAreHere() {
  return (
    <div className="pointer-events-none absolute" style={{ left: USER_LOCATION.x - 21, top: USER_LOCATION.y - 21 }} aria-label="Your location">
      <span className="absolute inset-0 size-[42px] rounded-full bg-[#252e29]/[0.08]" />
      <span className="absolute inset-0 size-[42px] animate-ping-slow rounded-full bg-brand/20" />
      <span className="absolute left-[14px] top-[14px] size-[14px] rounded-full border-[2.5px] border-white bg-[#3f5e48] shadow" />
    </div>
  );
}

export type MapHandle = { recenter: () => void; focus: (c: Cafe) => void };

type Props = {
  statusOf: (c: Cafe) => { crowd: Crowd; open: boolean };
  selectedId?: string;
  onSelect: (c: Cafe) => void;
  onBackgroundTap?: () => void;
  visibleIds?: Set<string>;
  /** where to keep the focused point, as fraction of the viewport height */
  focusY?: number;
  className?: string;
  children?: React.ReactNode;
};

export const LesMap = React.forwardRef<MapHandle, Props>(function LesMap(
  { statusOf, selectedId, onSelect, onBackgroundTap, visibleIds, focusY = 0.42, className, children },
  ref,
) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: W, h: 508 });
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [animating, setAnimating] = React.useState(false);
  const drag = React.useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  React.useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const scale = size.w / W;
  const clamp = React.useCallback(
    (p: { x: number; y: number }) => {
      const maxX = 40;
      const minX = size.w - W * scale - 40;
      const maxY = 40;
      const minY = Math.min(0, size.h - MAP_H * scale);
      return { x: Math.min(maxX, Math.max(minX, p.x)), y: Math.min(maxY, Math.max(minY, p.y)) };
    },
    [size, scale],
  );

  const centerOn = React.useCallback(
    (pt: { x: number; y: number }) => {
      setAnimating(true);
      setPan(clamp({ x: 0, y: size.h * focusY - pt.y * scale }));
      window.setTimeout(() => setAnimating(false), 420);
    },
    [clamp, size.h, focusY, scale],
  );

  React.useImperativeHandle(ref, () => ({
    recenter: () => centerOn(USER_LOCATION),
    focus: (c) => centerOn({ x: c.pos.x + 50, y: c.pos.y + 17 }),
  }));

  // keep the selected café in view when the viewport changes size
  const sel = CAFES.find((c) => c.id === selectedId);
  React.useEffect(() => {
    if (sel) centerOn({ x: sel.pos.x + 50, y: sel.pos.y + 17 });
    else setPan((p) => clamp(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.h, size.w, selectedId]);

  return (
    <div
      ref={wrap}
      className={cn("relative touch-none overflow-hidden bg-map-bg", className)}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
        if (d.moved) setPan(clamp({ x: d.px + dx, y: d.py + dy }));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (d && !d.moved) onBackgroundTap?.();
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <div
        className={cn("absolute left-0 top-0 origin-top-left", animating && "transition-transform duration-[400ms] ease-out")}
        style={{ width: W, height: MAP_H, transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      >
        <MapBase />
        <YouAreHere />
        {CAFES.filter((c) => !visibleIds || visibleIds.has(c.id)).map((c) => (
          <Marker key={c.id} cafe={c} crowd={statusOf(c).crowd} closed={!statusOf(c).open} selected={c.id === selectedId} onClick={() => onSelect(c)} />
        ))}
      </div>
      {children}
    </div>
  );
});

export function RecenterButton({ onClick, className, style }: { onClick: () => void; className?: string; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      aria-label="Recenter map on your location"
      onClick={(e) => {
        e.stopPropagation();
        haptic();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      style={style}
      className={cn("absolute z-20 flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink active:scale-95", className)}
    >
      <LocateFixed className="size-[21px]" strokeWidth={1.75} />
    </button>
  );
}
