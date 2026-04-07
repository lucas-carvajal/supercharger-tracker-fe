"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type MapLibreGL from "maplibre-gl";
import type { SuperchargerMapItem, SuperchargerStatus } from "@/lib/api";
import { STATUS_CONFIG } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Map, useMap, MapPopup, MapControls } from "@/components/ui/map";

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
          "IN_DEVELOPMENT",
          STATUS_CONFIG.IN_DEVELOPMENT.hex,
          "UNDER_CONSTRUCTION",
          STATUS_CONFIG.UNDER_CONSTRUCTION.hex,
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

const LEGEND_ITEMS: {
  status: SuperchargerStatus;
  dot: string;
  label: string;
}[] = [
  {
    status: "UNDER_CONSTRUCTION",
    dot: "bg-orange-500",
    label: "Under Construction",
  },
  { status: "IN_DEVELOPMENT", dot: "bg-emerald-400", label: "In Development" },
];

export default function SuperchargerMapInner({
  items,
}: SuperchargerMapInnerProps) {
  const [selected, setSelected] = useState<SelectedPoint | null>(null);
  const [activeFilter, setActiveFilter] = useState<SuperchargerStatus | null>(
    null,
  );

  const filteredItems = useMemo(
    () =>
      activeFilter ? items.filter((i) => i.status === activeFilter) : items,
    [items, activeFilter],
  );
  const geojson = useMemo(() => toGeoJSON(filteredItems), [filteredItems]);

  const handlePointClick = useCallback(
    (properties: SuperchargerMapItem, coordinates: [number, number]) => {
      setSelected({ properties, coordinates });
    },
    [],
  );

  function toggleFilter(status: SuperchargerStatus) {
    setActiveFilter((prev) => (prev === status ? null : status));
    setSelected(null);
  }

  return (
    <Map center={[0, 20]} zoom={2} className="h-full w-full rounded-2xl">
      <PointSource geojson={geojson} onPointClick={handlePointClick} />
      <MapControls position="bottom-right" showZoom showCompass />
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-1.5 rounded-xl border border-white/15 bg-background/90 px-4 py-3 text-xs backdrop-blur-xl">
        {LEGEND_ITEMS.map(({ status, dot, label }) => (
          <button
            key={status}
            type="button"
            onClick={() => toggleFilter(status)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/10",
              activeFilter && activeFilter !== status && "opacity-40",
            )}
          >
            <span className={cn("size-3 rounded-full", dot)} />
            <span className="text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <MapPopup
          longitude={selected.coordinates[0]}
          latitude={selected.coordinates[1]}
          onClose={() => setSelected(null)}
          className="rounded-xl border border-white/15 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {selected.properties.title}
            </h3>
            <StatusBadge status={selected.properties.status} />
          </div>
        </MapPopup>
      )}
    </Map>
  );
}

function StatusBadge({ status }: { status: SuperchargerStatus }) {
  const { label, dot, badge } = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
