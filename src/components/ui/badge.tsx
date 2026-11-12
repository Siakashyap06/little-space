import { cn } from "@/lib/utils";
import { CROWD_META, type Crowd } from "@/lib/data";

export function Dot({ color, size = 6 }: { color: string; size?: number }) {
  return <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: color }} />;
}

/** "Occupancy badge" from Figma: soft pill + status dot + Semi Bold 12. */
export function OccupancyBadge({ crowd, closed, className }: { crowd: Crowd; closed?: boolean; className?: string }) {
  const m = closed ? { soft: "#ecebe5", text: "#6e776f", dot: "#9aa198", label: "Closed" } : CROWD_META[crowd];
  return (
    <span
      className={cn("inline-flex items-center gap-[6px] rounded-full px-[10px] py-[6px] text-[12px] font-semibold leading-[1.4]", className)}
      style={{ background: m.soft, color: m.text }}
    >
      <Dot color={m.dot} />
      {m.label}
    </span>
  );
}
