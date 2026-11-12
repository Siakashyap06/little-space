import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[20px] border border-line bg-white", className)} {...props} />;
}

export function Divider({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px w-full bg-line", className)} />;
}
