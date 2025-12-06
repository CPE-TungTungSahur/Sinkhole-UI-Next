"use client";

import Image from "next/image";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { config } from "@/config/config";

const sinkholePredictions = [
    { id: 1, coordinates: [100.5018, 13.7563], risk: "high", location: "Orlando, FL" },
    { id: 2, coordinates: [-82.458, 27.947], risk: "medium", location: "Tampa, FL" },
    { id: 3, coordinates: [-80.191, 25.761], risk: "high", location: "Miami, FL" },
    { id: 4, coordinates: [-81.655, 30.332], risk: "low", location: "Jacksonville, FL" },
    { id: 5, coordinates: [-84.988, 29.722], risk: "medium", location: "Tallahassee, FL" },
];

export default function MapPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        console.log(config.api.boxMap.token);
        mapboxgl.accessToken = config.api.boxMap.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/imjustnon/cmi6dr20a007101s37mixcehz",
            center: [100.5018, 13.7563], // Bangkok
            zoom: 17,
            pitch: 50,
            bearing: -17.6,
            antialias: true,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "right");

        map.current.on("load", () => {
            // Add 3D terrain
            map.current!.addSource("mapbox-dem", {
                type: "raster-dem",
                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                tileSize: 512,
                maxzoom: 14,
            });

            map.current!.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

            // Add sky layer for atmosphere
            map.current!.addLayer({
                id: "sky",
                type: "sky",
                paint: {
                    "sky-type": "atmosphere",
                    "sky-atmosphere-sun": [0.0, 0.0],
                    "sky-atmosphere-sun-intensity": 15,
                },
            });

            // Add 3D buildings layer - first add the source
            if (!map.current!.getSource("openmaptiles")) {
                map.current!.addSource("openmaptiles", {
                    type: "vector",
                    url: "https://api.maptiler.com/tiles/v3/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
                });
            }

            const layers = map.current!.getStyle().layers;
            const labelLayerId = layers?.find((layer) => layer.type === "symbol" && layer.layout?.["text-field"])?.id;

            map.current!.addLayer(
                {
                    id: "add-3d-buildings",
                    source: "openmaptiles",
                    "source-layer": "building",
                    filter: ["==", "extrude", "true"],
                    type: "fill-extrusion",
                    minzoom: 15,
                    paint: {
                        "fill-extrusion-color": "#4a5568",
                        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
                        "fill-extrusion-base": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["get", "min_height"],
                        ],
                        "fill-extrusion-opacity": 0.8,
                    },
                },
                labelLayerId
            );

            // Helper function to create circle GeoJSON
            const createCircle = (center: [number, number], radiusInKm: number, points = 64) => {
                const coords = {
                    latitude: center[1],
                    longitude: center[0],
                };

                const km = radiusInKm;
                const ret = [];
                const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
                const distanceY = km / 110.574;

                for (let i = 0; i < points; i++) {
                    const theta = (i / points) * (2 * Math.PI);
                    const x = distanceX * Math.cos(theta);
                    const y = distanceY * Math.sin(theta);
                    ret.push([coords.longitude + x, coords.latitude + y]);
                }
                ret.push(ret[0]);

                return {
                    type: "Feature" as const,
                    geometry: {
                        type: "Polygon" as const,
                        coordinates: [ret],
                    },
                };
            };

            // Add circle areas for each prediction
            sinkholePredictions.forEach((prediction, index) => {
                const circle = createCircle(prediction.coordinates as [number, number], 0.2);

                // Add source for this circle
                map.current!.addSource(`circle-${prediction.id}`, {
                    type: "geojson",
                    data: circle as any,
                });

                // Add fill layer
                map.current!.addLayer({
                    id: `circle-fill-${prediction.id}`,
                    type: "fill",
                    source: `circle-${prediction.id}`,
                    paint: {
                        "fill-color":
                            prediction.risk === "high"
                                ? "#ef4444"
                                : prediction.risk === "medium"
                                  ? "#f97316"
                                  : "#06b6d4",
                        "fill-opacity": 0.2,
                    },
                });

                // Add border layer
                map.current!.addLayer({
                    id: `circle-border-${prediction.id}`,
                    type: "line",
                    source: `circle-${prediction.id}`,
                    paint: {
                        "line-color":
                            prediction.risk === "high"
                                ? "#ef4444"
                                : prediction.risk === "medium"
                                  ? "#f97316"
                                  : "#06b6d4",
                        "line-width": 2,
                        "line-opacity": 0.8,
                    },
                });
            });

            // Add markers for each predicted sinkhole location
            sinkholePredictions.forEach((prediction) => {
                const el = document.createElement("div");
                el.className = "sinkhole-marker";
                el.style.width = "24px";
                el.style.height = "24px";
                el.style.borderRadius = "50%";
                el.style.cursor = "pointer";
                el.style.border = "3px solid";

                if (prediction.risk === "high") {
                    el.style.backgroundColor = "hsl(0 84% 60%)";
                    el.style.borderColor = "hsl(0 84% 70%)";
                    el.style.boxShadow = "0 0 20px hsl(0 84% 60% / 0.6)";
                } else if (prediction.risk === "medium") {
                    el.style.backgroundColor = "hsl(25 95% 53%)";
                    el.style.borderColor = "hsl(25 95% 63%)";
                    el.style.boxShadow = "0 0 20px hsl(25 95% 53% / 0.6)";
                } else {
                    el.style.backgroundColor = "hsl(189 94% 43%)";
                    el.style.borderColor = "hsl(189 94% 53%)";
                    el.style.boxShadow = "0 0 20px hsl(189 94% 43% / 0.6)";
                }

                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="padding: 8px; background: hsl(222 47% 11%); color: hsl(210 40% 98%);">
                        <h3 style="font-weight: bold; margin-bottom: 4px;">${prediction.location}</h3>
                        <p style="margin: 0; text-transform: capitalize;">Risk Level: <span style="color: ${
                            prediction.risk === "high"
                                ? "hsl(0 84% 60%)"
                                : prediction.risk === "medium"
                                  ? "hsl(25 95% 53%)"
                                  : "hsl(189 94% 43%)"
                        };">${prediction.risk}</span></p>
                    </div>
                `);

                const marker = new mapboxgl.Marker(el)
                    .setLngLat(prediction.coordinates as [number, number])
                    .setPopup(popup)
                    .addTo(map.current!);

                el.addEventListener("click", (e) => {
                    e.stopPropagation();
                    console.log("Marker clicked:", prediction.coordinates);
                });
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);
    return (
        <>
            <div className="relative w-full">
                <div ref={mapContainer} className="absolute inset-0 min-h-screen" />
                {/* Legend */}
                <div className="bg-card/90 border-border absolute bottom-8 left-8 space-y-2 rounded-lg bg-[#0000]/50 p-4 backdrop-blur-sm md:bottom-[25rem]">
                    <h3 className="mb-3 text-sm font-bold text-white">Risk Levels</h3>
                    <div className="flex items-center gap-2">
                        <div className="border-danger h-4 w-4 rounded-full bg-[#ef4443] shadow-[0_0_20px_#ef4443]" />
                        <span className="text-sm text-white">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="border-warning h-4 w-4 rounded-full bg-[#f97414] shadow-[0_0_20px_#f97414]" />
                        <span className="text-sm text-white">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="border-primary h-4 w-4 rounded-full bg-[#05b6d4] shadow-[0_0_20px_#05b6d4]" />
                        <span className="text-sm text-white">Low Risk</span>
                    </div>
                </div>
            </div>
        </>
    );
}
