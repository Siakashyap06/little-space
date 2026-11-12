import { cn } from "@/lib/utils";
import { hoursLine, type Cafe } from "@/lib/data";

export function CafePhoto({ cafe, className, eager }: { cafe: Cafe; className?: string; eager?: boolean }) {
  return (
    <img
      src={cafe.photo}
      alt={`${cafe.name} interior`}
      loading={eager ? "eager" : "lazy"}
      draggable={false}
      className={cn("shrink-0 select-none rounded-[16px] bg-map-block object-cover", className)}
    />
  );
}

/** "Café identity and photo" row: 94×86 photo, name 25/Semi Bold, address, hours · amenity. */
export function CafeIdentity({ cafe }: { cafe: Cafe }) {
  return (
    <div className="flex items-center gap-[14px]">
      <CafePhoto cafe={cafe} eager className="h-[86px] w-[94px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[25px] font-semibold tracking-[-0.6px] text-ink">{cafe.name}</p>
        <p className="text-[12px] leading-[1.4] text-muted">
          {cafe.address} · {cafe.neighborhood}
        </p>
        <p className="text-[12px] leading-[1.4] text-brand">
          {hoursLine(cafe)} · {cafe.amenities[0]}
        </p>
      </div>
    </div>
  );
}
