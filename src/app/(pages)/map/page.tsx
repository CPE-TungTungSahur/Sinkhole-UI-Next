"use client";

import Image from "next/image";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { config } from "@/config/config";
import axios, { AxiosResponse } from "axios";
import PointDetailsDrawer from "@/components/PointDetailsDrawer";

interface IGeoJsonFeature {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number];
    };
    properties: {
        risk: number;
        line: string;
        color: string;
        point_type: string;
        [key: string]: any;
    };
}

interface IGeoJsonCollection {
    type: "FeatureCollection";
    features: IGeoJsonFeature[];
}

function getRiskColor(prob: number) {
    if (prob > 0.25) return "#ef4444"; // High
    if (prob > 0.1) return "#f97316"; // Medium
    return "#06b6d4"; // low
}

export default function MapPage() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [geoJsonData, setGeoJsonData] = useState<IGeoJsonCollection | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState<boolean>(false);

    const colorExpression = [
        "case",
        [">", ["get", "risk"], 0.25],
        "hsl(0, 84%, 60%)", // สีแดงสด (High)
        [">", ["get", "risk"], 0.1],
        "hsl(25, 95%, 53%)", // สีส้มสด (Medium)
        "transparent", // ต่ำกว่า 0.1 ไม่แสดง (หรือใส่สีฟ้าตามต้องการ)
    ];

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = config.api.boxMap.token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            //style: "mapbox://styles/mapbox/streets-v12",
            style: "mapbox://styles/imjustnon/cmi6dr20a007101s37mixcehz",
            center: [100.5018, 13.7563], // Bangkok
            zoom: 13,
            pitch: 50,
            bearing: 17.6,
            antialias: true,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "right");

        map.current.on("load", async () => {
            setIsMapLoaded(true);
            map.current?.addSource("sinkholes", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
            });

            // Layer 1: Area Glow
            map.current?.addLayer({
                id: "sinkhole-area",
                type: "circle",
                source: "sinkholes",
                filter: [">", ["get", "risk"], 0.1],
                paint: {
                    "circle-color": colorExpression as any,
                    "circle-opacity": 0.1, // จางๆ พื้นหลัง
                    "circle-pitch-alignment": "map", // สำคัญ! ทำให้วงกลมแบนราบไปกับพื้นโลกเวลามุมกล้องเอียง
                    "circle-radius": [
                        "interpolate",
                        ["exponential", 2],
                        ["zoom"],
                        10,
                        2, // ที่ Zoom 10 ขนาดประมาณ 2px
                        22,
                        8192, // ที่ Zoom 22 ขนาดใหญ่มาก (จำลองระยะ 100-150 เมตร)
                    ],
                },
            });

            //Layer 2: Glowing effect
            map.current?.addLayer({
                id: "sinkhole-glow",
                type: "circle",
                source: "sinkholes",
                filter: [">", ["get", "risk"], 0.1],
                paint: {
                    "circle-color": colorExpression as any,
                    "circle-radius": 20, // รัศมีแสงเงา
                    "circle-blur": 1, // เบลอเยอะๆ ให้เหมือน Box-shadow
                    "circle-opacity": 0.8, // ความเข้มแสงเงา
                },
            });

            //Layer 3: Core point
            map.current?.addLayer({
                id: "sinkhole-core",
                type: "circle",
                source: "sinkholes",
                filter: [">", ["get", "risk"], 0.1],
                paint: {
                    // 1. สีพื้นหลัง (Background)
                    "circle-color": [
                        "case",
                        [">", ["get", "risk"], 0.25],
                        "hsl(0, 84%, 60%)", // แดง (L=60%)
                        "hsl(25, 95%, 53%)", // ส้ม (L=53%)
                    ] as any,
                    "circle-radius": 8, // ขนาดจุด
                    "circle-stroke-width": 3,
                    "circle-stroke-color": [
                        "case",
                        [">", ["get", "risk"], 0.25],
                        "hsl(0, 84%, 75%)", // แดงอ่อน (L=75%)
                        "hsl(25, 95%, 70%)", // ส้มอ่อน (L=70%)
                    ] as any,
                    "circle-stroke-opacity": 1,
                },
            });

            map.current?.on("click", "sinkhole-core", (e) => {
                // ตรวจสอบว่าคลิกโดน feature มั้ย
                if (e.features && e.features.length > 0) {
                    // ดึง properties (ข้อมูล risk, line, etc.) ออกมา
                    const properties = e.features[0].properties;
                    // ส่งข้อมูลไปเปิด Drawer
                    handlePointDetails(properties);
                }
            });
            map.current?.on("mouseenter", "sinkhole-core", () => {
                map.current!.getCanvas().style.cursor = "pointer";
            });
            map.current?.on("mouseleave", "sinkhole-core", () => {
                map.current!.getCanvas().style.cursor = "";
            });
            // Helper function to create circle GeoJSON
            /*const createCircle = (center: [number, number], radiusInKm: number, points = 64) => {
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
            predictedPoints.forEach((point, index) => {
                if (point.risk < 0.1) return;
                const circle = createCircle([point.lon, point.lat], 0.1);

                // Add source for this circle
                map.current!.addSource(`circle-${index}`, {
                    type: "geojson",
                    data: circle as any,
                });

                // Add fill layer
                map.current!.addLayer({
                    id: `circle-fill-${index}`,
                    type: "fill",
                    source: `circle-${index}`,
                    paint: {
                        "fill-color": getRiskColor(point.risk),
                        "fill-opacity": 0.2,
                    },
                });

                // Add border layer
                map.current!.addLayer({
                    id: `circle-border-${index}`,
                    type: "line",
                    source: `circle-${index}`,
                    paint: {
                        "line-color": getRiskColor(point.risk),
                        "line-width": 2,
                        "line-opacity": 0.8,
                    },
                });
            });

            // Add markers for each predicted sinkhole location
            predictedPoints.forEach((point: IPredictedPoint) => {
                if (point.risk < 0.1) return;
                const el = document.createElement("div");
                el.className = "sinkhole-marker";
                el.style.width = "24px";
                el.style.height = "24px";
                el.style.borderRadius = "50%";
                el.style.cursor = "pointer";
                el.style.border = "3px solid";

                if (point.risk > 0.25) {
                    // Should be greater than 0.716 but this is for testing
                    el.style.backgroundColor = "hsl(0 84% 60%)";
                    el.style.borderColor = "hsl(0 84% 70%)";
                    el.style.boxShadow = "0 0 20px hsl(0 84% 60% / 0.6)";
                } else if (point.risk > 0.1) {
                    // Should be between 0.5 and 0.716 but this is for testing
                    el.style.backgroundColor = "hsl(25 95% 53%)";
                    el.style.borderColor = "hsl(25 95% 63%)";
                    el.style.boxShadow = "0 0 20px hsl(25 95% 53% / 0.6)";
                }

                const marker = new mapboxgl.Marker(el).setLngLat([point.lon, point.lat]).addTo(map.current!);

                el.addEventListener("click", (e) => {
                    e.stopPropagation();
                    handlePointDetails(point);
                });
            });*/
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || !isMapLoaded || !geoJsonData) return;
        const source = map.current.getSource("sinkholes") as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(geoJsonData);
        }
    }, [geoJsonData, isMapLoaded]);

    useEffect(() => {
        (async () => {
            const getPredictedPoint: AxiosResponse<any> = await axios.post(
                "/api/dev/getdata",
                {},
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = getPredictedPoint.data.geojson || getPredictedPoint.data.data?.geojson;
            console.log(data);
            setGeoJsonData(data);
        })();
    }, []);

    function handlePointDetails(point: any): void {
        console.log("Marker clicked:", point.line);
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
