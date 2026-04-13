"use client";

import type { SuperchargerStatus } from "@/lib/api";
import { STATUS_CONFIG } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

interface ChargerDetailMapProps {
  latitude: number;
  longitude: number;
  status: SuperchargerStatus;
}

export function ChargerDetailMap({
  latitude,
  longitude,
  status,
}: ChargerDetailMapProps) {
  const { dot } = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;

  return (
    <Map
      center={[longitude, latitude]}
      zoom={11}
      interactive={false}
      className="h-full w-full"
    >
      <MapMarker longitude={longitude} latitude={latitude} anchor="center">
        <MarkerContent>
          <span
            className={cn(
              "relative block size-5 rounded-full border-[3px] border-white shadow-[0_0_0_8px_rgba(255,255,255,0.12)]",
              dot,
            )}
          />
        </MarkerContent>
      </MapMarker>
    </Map>
  );
}
