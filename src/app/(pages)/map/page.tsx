"use client";

import Image from "next/image";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";
import { config } from "@/config/config";
import axios, { AxiosResponse } from "axios";
import PointDetailsDrawer from "@/components/PointDetailsDrawer";
import { useLoading } from "@/contexts/LoadingContext";
import { getAllSelfSurwayPoint, getSelfSurwayPoint, setSelfSurwayPoint } from "@/utils/SelfSurwayPointStorage";
import { createMapAreaCircle } from "@/utils/createMapAreaCircle";
import { Dropdown, MenuProps, Spin, theme } from "antd";
import { RiskColor } from "@/enums/RiskColor";
import { getRiskColor, riskBreakPoint } from "@/utils/getRiskColor";

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
        point_source: string;
    };
}

export interface IGeoJSONResponse {
    file: string;
    geojson: {
        type: "FeatureCollection";
        features: IGeoJSONFeature[];
    };
}

export interface ISelfSurwayResponse {
    status: string;
    feature: {
        type: string;
        geometry: {
            type: string;
            coordinates: [number, number]; // [longitude, latitude]
        };
        properties: {
            lat: number;
            lon: number;
            date: string;
            risk: number;
        };
    };
}

export default function MapPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [geoJsonData, setGeoJsonData] = useState<IGeoJSONResponse | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<IGeoJSONFeature | null>(null);
    const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState<boolean>(false);
    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
    const [interestCoordinates, setInterestCoordinates] = useState<{ lon: number; lat: number } | null>(null);
    const [isOpenInterestCoordinatesContextMenu, setIsOpenInterestCoordinatesContextMenu] = useState<boolean>(false);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const [reFetchTrigger, setReFetchTrigger] = useState<number>(0);
    const selfSurwayControllerRef = useRef<AbortController | null>(null);

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

        // Add right-click/holdscreen event listener to get lat/lon from user click
        map.current.on("contextmenu", (e) => {
            const { lng, lat } = e.lngLat;
            setInterestCoordinates({ lon: lng, lat: lat });
            setIsOpenInterestCoordinatesContextMenu(true);
            // handleSelfSurway({ lat: lat, lon: lng });
            console.log("Clicked coordinates:", { lng, lat });
        });
        map.current.on("click", (e) => {
            setIsOpenInterestCoordinatesContextMenu(false);
        });
        let pressTimer: NodeJS.Timeout;
        map.current.on("touchstart", (e) => {
            setIsOpenInterestCoordinatesContextMenu(false);
            pressTimer = setTimeout(() => {
                const { lng, lat } = e.lngLat;
                setInterestCoordinates({ lon: lng, lat: lat });
                setIsOpenInterestCoordinatesContextMenu(true);
                console.log("Clicked coordinates:", { lng, lat });
            }, 1000); // 1.0s
        });
        map.current.on("touchend", () => {
            clearTimeout(pressTimer);
        });
        map.current.on("touchmove", () => {
            clearTimeout(pressTimer); // cancle timeout when drag screen
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

        // Filter features with risk >= 0.1
        const filteredFeatures = geoJsonData.geojson.features.filter((feature) => feature.properties.risk >= riskBreakPoint.medium || feature.properties.point_source === "localstorage");

        // Create GeoJSON FeatureCollection for circles
        const circlesGeoJSON = {
            type: "FeatureCollection" as const,
            features: filteredFeatures.map((feature) => ({
                type: "Feature" as const,
                geometry: {
                    type: "Polygon" as const,
                    coordinates: [createMapAreaCircle(feature.geometry.coordinates, 0.2)],
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

            // middle point selector
            if (feature.properties.point_source === "localstorage") {
                el.style.backgroundColor = "hsl(189 94% 43%)";
            } else if (risk > riskBreakPoint.high) {
                // Should be greater than 0.716 but this is for testing
                el.style.backgroundColor = "hsl(0 84% 60%)";
            } else if (risk > riskBreakPoint.medium) {
                // Should be between 0.5 and 0.716 but this is for testing
                el.style.backgroundColor = "hsl(25 95% 53%)";
            }

            // border & shadow selector
            if (risk > riskBreakPoint.high) {
                el.style.borderColor = "hsl(0 84% 70%)";
                el.style.boxShadow = "0 0 20px hsl(0 84% 60% / 0.6)";
            } else if (risk > riskBreakPoint.medium) {
                el.style.borderColor = "hsl(25 95% 63%)";
                el.style.boxShadow = "0 0 20px hsl(25 95% 53% / 0.6)";
            } else {
                el.style.borderColor = "hsl(189 94% 53%)";
                el.style.boxShadow = "0 0 20px hsl(189 94% 43% / 0.6)";
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

                const mapGeoJsonPointServer: IGeoJSONResponse = {
                    ...response.data,
                    geojson: {
                        ...response.data.geojson,
                        features: response.data.geojson.features.map((feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                point_source: "server",
                            },
                        })),
                    },
                };

                const getSelfSurwayPointLocalData = getAllSelfSurwayPoint();
                const mapGeoJsonSelfSurwayPointLocalData: IGeoJSONFeature[] = getSelfSurwayPointLocalData.map((p) => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [p.lon, p.lat], // [longitude, latitude]
                    },
                    properties: {
                        risk: p.risk,
                        line: "",
                        color: "",
                        point_type: "",
                        point_source: "localstorage",
                    },
                }));

                setGeoJsonData({
                    ...mapGeoJsonPointServer,
                    geojson: {
                        type: "FeatureCollection",
                        features: [...mapGeoJsonSelfSurwayPointLocalData, ...mapGeoJsonPointServer.geojson.features],
                    },
                });
            } catch (error) {
                console.error("Error fetching predicted points:", error);
            } finally {
                stopLoading();
            }
        })();
    }, [startLoading, stopLoading, reFetchTrigger]);

    function handleFeatureClick(feature: IGeoJSONFeature): void {
        console.log("Marker clicked:", feature.geometry.coordinates.join(", "));
        setSelectedFeature(feature);
        setIsOpenDetailsDrawer(true);
    }

    async function handleSelfSurway({ lat, lon }: { lat: number; lon: number }): Promise<void> {
        selfSurwayControllerRef.current = new AbortController();
        try {
            startLoading();
            const response: AxiosResponse<ISelfSurwayResponse> = await axios.post(
                "/api/dev/predict-random-point",
                {
                    lat: lat,
                    lon: lon,
                    date: new Date().toLocaleDateString("pt-PT").split("/").reverse().join("-"), // YYYY-MM-DD
                },
                {
                    headers: { "Content-Type": "application/json" },
                    signal: selfSurwayControllerRef.current.signal,
                }
            );

            setSelfSurwayPoint({
                lat: response.data.feature.properties.lat,
                lon: response.data.feature.properties.lon,
                risk: response.data.feature.properties.risk,
            });
            setReFetchTrigger(Math.random());
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
            } else {
                console.dir("Error fetching surway points:", error);
            }
        } finally {
            stopLoading();
            setIsOpenInterestCoordinatesContextMenu(false);
        }
    }

    useEffect(() => {
        if (!isOpenInterestCoordinatesContextMenu) unlockMap();
        else lockMap();
    }, [isOpenInterestCoordinatesContextMenu]);

    function lockMap() {
        map.current?.dragPan.disable();
        map.current?.scrollZoom.disable();
    }

    function unlockMap() {
        map.current?.dragPan.enable();
        map.current?.scrollZoom.enable();
    }

    function popMenu(): React.ReactNode {
        return (
            <div className="h-[150px] w-56 rounded-lg bg-[#0000]/70 px-4 pb-4 pt-2 backdrop-blur-sm">
                {!isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="text-center font-bold text-white">Predict Location</div>
                        <div className="mt-3 flex flex-row gap-x-3">
                            <div className="flex flex-col">
                                <div className="text-sm font-bold text-white">Latitude</div>
                                <div className="mt-1 text-sm font-bold text-white">Longitude</div>
                            </div>
                            <div className="w-fit">
                                <div className="h-full w-[2px] rounded-lg bg-white"></div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-wrap text-sm font-bold text-cyan-400">{interestCoordinates?.lat.toFixed(5)}</div>
                                <div className="mt-1 text-sm font-bold text-cyan-400">{interestCoordinates?.lon.toFixed(5)}</div>
                            </div>
                        </div>
                        <div
                            className="hover text-md mt-5 w-full cursor-pointer rounded-md bg-cyan-400 py-1 text-center font-bold text-white shadow-[0_0_10px_#06b6d4] duration-300 hover:bg-cyan-600 active:scale-95"
                            onClick={() => (interestCoordinates ? handleSelfSurway({ lat: interestCoordinates.lat, lon: interestCoordinates.lon }) : null)}
                        >
                            Predict
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center">
                        <div className="flex grow flex-col justify-center">
                            <Spin size="large" styles={{ indicator: { color: "#22d3ee" } }} />
                            <div className="mt-4 text-xs text-white">Loading. Please wait...</div>
                        </div>
                        <div
                            className="hover text-md mt-2 w-full cursor-pointer rounded-md bg-slate-400/20 py-1 text-center font-bold text-white duration-300 hover:bg-white/70 hover:text-black active:scale-95"
                            onClick={() => selfSurwayControllerRef.current?.abort()}
                        >
                            Cancel
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="relative w-full overflow-y-hidden bg-gradient-to-br from-[#2e344b] via-[#2e344b]/80 to-[#2e344b]">
                <Dropdown
                    popupRender={popMenu}
                    trigger={["contextMenu"]}
                    open={isOpenInterestCoordinatesContextMenu}
                    className="absolute"
                    onOpenChange={(isOpen, { source }) => console.log(isOpen, source)}
                >
                    <div ref={mapContainer} className="inset-0 min-h-screen"></div>
                </Dropdown>
                {/* Legend */}
                <div className="bg-card/90 border-border absolute bottom-8 left-8 z-50 rounded-lg bg-[#0000]/50 p-4 backdrop-blur-sm md:bottom-[25rem]">
                    <h3 className="mb-3 text-sm font-bold text-white">Risk Levels</h3>
                    <div className="flex items-center gap-2">
                        <div className="border-danger h-4 w-4 rounded-full bg-[#ef4443] shadow-[0_0_20px_#ef4443]" />
                        <span className="text-sm text-white">High Risk</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="border-warning h-4 w-4 rounded-full bg-[#f97414] shadow-[0_0_20px_#f97414]" />
                        <span className="text-sm text-white">Medium Risk</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="border-warning h-4 w-4 rounded-full bg-[#06b6d4] shadow-[0_0_20px_#06b6d4]" />
                        <span className="text-sm text-white">Self Surway</span>
                    </div>

                    <h3 className="mt-5 text-sm font-bold text-white">Last Update</h3>
                    <div className="flex flex-row items-center">
                        <div></div>
                        <div className="text-sm font-normal text-white">
                            {geoJsonData
                                ? new Date(geoJsonData.file.replace(".json", "").split("_")[0] + "T" + geoJsonData.file.replace(".json", "").split("_")[1].replace("-", ":") + ":00").toLocaleString(
                                      "th-TH",
                                      { timeZone: "Asia/Bangkok" }
                                  )
                                : "Loading..."}
                        </div>
                    </div>
                </div>

                <PointDetailsDrawer isOpen={isOpenDetailsDrawer} onClose={() => setIsOpenDetailsDrawer(false)} selectedFeature={selectedFeature} />
            </div>
        </>
    );
}
