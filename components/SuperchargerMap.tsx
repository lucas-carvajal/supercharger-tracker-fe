"use client";

import dynamic from "next/dynamic";
import type { SuperchargerMapItem } from "@/lib/api";

const MapInner = dynamic(() => import("./SuperchargerMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Loading map…
    </div>
  ),
});

interface SuperchargerMapProps {
  items: SuperchargerMapItem[];
}

export function SuperchargerMap({ items }: SuperchargerMapProps) {
  return (
    <div className="h-full w-full">
      <MapInner items={items} />
    </div>
  );
}
