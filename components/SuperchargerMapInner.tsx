"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type MapLibreGL from "maplibre-gl";
import type { SuperchargerMapItem, SuperchargerStatus } from "@/lib/api";
import { STATUS_CONFIG } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Map, useMap, MapPopup, MapControls } from "@/components/ui/map";
import { StatusBadge } from "@/components/StatusBadge";

const SOURCE_ID = "superchargers";
const POINT_LAYER = "supercharger-points";

interface SelectedPoint {
  properties: SuperchargerMapItem;
  coordinates: [number, number];
}

interface SuperchargerMapInnerProps {
  items: SuperchargerMapItem[];
}

function toGeoJSON(
  items: SuperchargerMapItem[],
): GeoJSON.FeatureCollection<GeoJSON.Point, SuperchargerMapItem> {
  return {
    type: "FeatureCollection",
    features: items.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.longitude, item.latitude],
      },
      properties: item,
    })),
  };
}

function PointSource({
  geojson,
  onPointClick,
}: {
  geojson: GeoJSON.FeatureCollection<GeoJSON.Point, SuperchargerMapItem>;
  onPointClick: (
    properties: SuperchargerMapItem,
    coordinates: [number, number],
  ) => void;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) return;

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: geojson,
    });

    map.addLayer({
      id: POINT_LAYER,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-color": [
          "match",
          ["get", "status"],
          "PRELIMINARY",
          STATUS_CONFIG.PRELIMINARY.hex,
          "DESIGN",
          STATUS_CONFIG.DESIGN.hex,
          "CONSTRUCTION",
          STATUS_CONFIG.CONSTRUCTION.hex,
          STATUS_CONFIG.UNKNOWN.hex,
        ],
        "circle-radius": 6,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    const handlePointClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      },
    ) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const coords = (
        feature.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number];
      while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
        coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
      }
      onPointClick(
        feature.properties as unknown as SuperchargerMapItem,
        coords,
      );
    };

    const pointerIn = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const pointerOut = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", POINT_LAYER, handlePointClick);
    map.on("mouseenter", POINT_LAYER, pointerIn);
    map.on("mouseleave", POINT_LAYER, pointerOut);

    return () => {
      map.off("click", POINT_LAYER, handlePointClick);
      map.off("mouseenter", POINT_LAYER, pointerIn);
      map.off("mouseleave", POINT_LAYER, pointerOut);
      try {
        if (map.getLayer(POINT_LAYER)) map.removeLayer(POINT_LAYER);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map) return;
    const source = map.getSource(SOURCE_ID) as MapLibreGL.GeoJSONSource;
    if (source) source.setData(geojson);
  }, [isLoaded, map, geojson]);

  return null;
}

function MapFocus({
  item,
}: {
  item: SuperchargerMapItem | null;
}) {
  const { map, isLoaded } = useMap();
  const lastFocusedId = useRef<string | null>(null);

  useEffect(() => {
    if (!item || !isLoaded || !map) return;
    if (lastFocusedId.current === item.id) return;

    lastFocusedId.current = item.id;
    map.easeTo({
      center: [item.longitude, item.latitude],
      zoom: Math.max(map.getZoom(), 9),
      duration: 900,
    });
  }, [item, isLoaded, map]);

  return null;
}

const LEGEND_ITEMS: {
  status: SuperchargerStatus;
  dot: string;
  label: string;
}[] = [
  { status: "PRELIMINARY", dot: "bg-sky-400", label: "Preliminary Planning" },
  { status: "DESIGN", dot: "bg-emerald-400", label: "In Design" },
  { status: "CONSTRUCTION", dot: "bg-orange-500", label: "Under Construction" },
];

export default function SuperchargerMapInner({
  items,
}: SuperchargerMapInnerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<SelectedPoint | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<SuperchargerStatus>>(
    () => new Set(),
  );
  const selectedChargerId = searchParams.get("charger");
  // Deep-link focus shows all statuses so the target charger is never hidden.
  const effectiveFilters = selectedChargerId ? null : activeFilters;

  const filteredItems = useMemo(() => {
    if (!effectiveFilters || effectiveFilters.size === 0) return items;
    return items.filter((i) => effectiveFilters.has(i.status));
  }, [items, effectiveFilters]);
  const geojson = useMemo(() => toGeoJSON(filteredItems), [filteredItems]);
  const selectedCharger = useMemo(
    () => items.find((item) => item.id === selectedChargerId) ?? null,
    [items, selectedChargerId],
  );
  const activeSelected = selectedCharger
    ? {
        properties: selectedCharger,
        coordinates: [selectedCharger.longitude, selectedCharger.latitude] as [
          number,
          number,
        ],
      }
    : selected;

  const handlePointClick = useCallback(
    (properties: SuperchargerMapItem, coordinates: [number, number]) => {
      setSelected({ properties, coordinates });
    },
    [],
  );

  function toggleFilter(status: SuperchargerStatus) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
    setSelected(null);
  }

  function handlePopupClose() {
    if (selectedChargerId) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("charger");
      const nextUrl = params.toString() ? `/map?${params}` : "/map";
      router.replace(nextUrl);
      return;
    }

    setSelected(null);
  }

  const hasActiveFilters = activeFilters.size > 0;

  return (
    <Map center={[0, 20]} zoom={2} className="h-full w-full">
      <PointSource geojson={geojson} onPointClick={handlePointClick} />
      <MapFocus item={selectedCharger} />
      <MapControls position="bottom-right" showZoom showCompass />
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-1.5 rounded-xl border border-white/15 bg-background/90 px-4 py-3 text-xs backdrop-blur-xl">
        {LEGEND_ITEMS.map(({ status, dot, label }) => {
          const isActive = activeFilters.has(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleFilter(status)}
              aria-pressed={isActive}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/10",
                hasActiveFilters && !isActive && "opacity-40",
                isActive && "bg-white/10",
              )}
            >
              <span className={cn("size-3 rounded-full", dot)} />
              <span className="text-muted-foreground">{label}</span>
            </button>
          );
        })}
      </div>
      {activeSelected && (
        <MapPopup
          longitude={activeSelected.coordinates[0]}
          latitude={activeSelected.coordinates[1]}
          onClose={handlePopupClose}
          className="overflow-hidden rounded-xl border border-white/15 bg-background/95 p-0 shadow-2xl backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={() =>
              router.push(`/charger/${activeSelected.properties.id}`)
            }
            className="flex w-full cursor-pointer flex-col gap-2 px-4 py-3 text-left outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <h3 className="text-sm font-semibold text-foreground">
              {activeSelected.properties.title}
            </h3>
            <StatusBadge status={activeSelected.properties.status} />
            <span className="mt-1 text-xs text-muted-foreground">
              Click for details
            </span>
          </button>
        </MapPopup>
      )}
    </Map>
  );
}
