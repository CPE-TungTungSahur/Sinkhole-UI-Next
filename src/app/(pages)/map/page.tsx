"use client";

import Image from "next/image";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { config } from "@/config/config";
import axios, { AxiosResponse } from "axios";
import PointDetailsDrawer from "@/components/PointDetailsDrawer";
import { useLoading } from "@/contexts/LoadingContext";

export interface IGeoJSONFeature {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    properties: {
        risk: number;
        line: string;
        color: string;
        point_type: string;
    };
}

export interface IGeoJSONResponse {
    file: string;
    geojson: {
        type: "FeatureCollection";
        features: IGeoJSONFeature[];
    };
}

function getRiskColor(prob: number) {
    if (prob > 0.25) return "#ef4444"; // High
    if (prob > 0.1) return "#f97316"; // Medium
    return "#06b6d4"; // low
}

export default function MapPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [geoJsonData, setGeoJsonData] = useState<IGeoJSONResponse | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<IGeoJSONFeature | null>(null);
    const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState<boolean>(false);
    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
    const { startLoading, stopLoading } = useLoading();

    // Initialize map only once
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = config.api.boxMap.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/imjustnon/cmi6dr20a007101s37mixcehz",
            center: [100.5018, 13.7563], // Bangkok
            zoom: 13,
            pitch: 50,
            bearing: 17.6,
            antialias: true,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "right");

        map.current.on("load", () => {
            setIsMapLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update markers when geoJsonData changes
    useEffect(() => {
        if (!map.current || !isMapLoaded || !geoJsonData) return;

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

            return ret;
        };

        // Filter features with risk >= 0.1
        const filteredFeatures = geoJsonData.geojson.features.filter((feature) => feature.properties.risk >= 0.1);

        // Create GeoJSON FeatureCollection for circles
        const circlesGeoJSON = {
            type: "FeatureCollection" as const,
            features: filteredFeatures.map((feature) => ({
                type: "Feature" as const,
                geometry: {
                    type: "Polygon" as const,
                    coordinates: [createCircle(feature.geometry.coordinates, 0.1)],
                },
                properties: {
                    risk: feature.properties.risk,
                    color: getRiskColor(feature.properties.risk),
                },
            })),
        };

        // Clean up existing layers and sources
        if (map.current!.getLayer("circle-borders")) {
            map.current!.removeLayer("circle-borders");
        }
        if (map.current!.getLayer("circle-fills")) {
            map.current!.removeLayer("circle-fills");
        }
        if (map.current!.getSource("circles")) {
            map.current!.removeSource("circles");
        }

        // Add circles source and layers
        if (filteredFeatures.length > 0) {
            map.current!.addSource("circles", {
                type: "geojson",
                data: circlesGeoJSON as any,
            });

            // Add fill layer
            map.current!.addLayer({
                id: "circle-fills",
                type: "fill",
                source: "circles",
                paint: {
                    "fill-color": ["get", "color"],
                    "fill-opacity": 0.2,
                },
            });

            // Add border layer
            map.current!.addLayer({
                id: "circle-borders",
                type: "line",
                source: "circles",
                paint: {
                    "line-color": ["get", "color"],
                    "line-width": 2,
                    "line-opacity": 0.8,
                },
            });
        }

        // Clean up existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add markers for each predicted sinkhole location
        filteredFeatures.forEach((feature: IGeoJSONFeature) => {
            const el = document.createElement("div");
            el.className = "sinkhole-marker";
            el.style.width = "24px";
            el.style.height = "24px";
            el.style.borderRadius = "50%";
            el.style.cursor = "pointer";
            el.style.border = "3px solid";

            const risk = feature.properties.risk;

            if (risk > 0.25) {
                // Should be greater than 0.716 but this is for testing
                el.style.backgroundColor = "hsl(0 84% 60%)";
                el.style.borderColor = "hsl(0 84% 70%)";
                el.style.boxShadow = "0 0 20px hsl(0 84% 60% / 0.6)";
            } else if (risk > 0.1) {
                // Should be between 0.5 and 0.716 but this is for testing
                el.style.backgroundColor = "hsl(25 95% 53%)";
                el.style.borderColor = "hsl(25 95% 63%)";
                el.style.boxShadow = "0 0 20px hsl(25 95% 53% / 0.6)";
            }

            const marker = new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map.current!);

            el.addEventListener("click", (e) => {
                e.stopPropagation();
                handleFeatureClick(feature);
            });

            markersRef.current.push(marker);
        });
    }, [geoJsonData, isMapLoaded]);

    useEffect(() => {
        (async () => {
            try {
                startLoading();
                const response: AxiosResponse<IGeoJSONResponse> = await axios.post(
                    "/api/dev/predicted-point",
                    {},
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                console.log("GeoJSON Response:", response.data);
                setGeoJsonData(response.data);
            } catch (error) {
                console.error("Error fetching predicted points:", error);
            } finally {
                stopLoading();
            }
        })();
    }, [startLoading, stopLoading]);

    function handleFeatureClick(feature: IGeoJSONFeature): void {
        console.log("Marker clicked:", feature.properties.line);
        setSelectedFeature(feature);
        setIsOpenDetailsDrawer(true);
    }

    return (
        <>
            <div className="relative w-full bg-gradient-to-br from-[#2e344b] via-[#2e344b]/80 to-[#2e344b]">
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
                </div>
                <PointDetailsDrawer isOpen={isOpenDetailsDrawer} onClose={() => setIsOpenDetailsDrawer(false)} />
            </div>
        </>
    );
}
