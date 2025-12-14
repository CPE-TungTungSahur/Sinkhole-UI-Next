"use client";

import { IGeoJSONFeature } from "@/app/(pages)/map/page";
import { useLoading } from "@/contexts/LoadingContext";
import { Drawer, Spin } from "antd";
import axios, { AxiosResponse } from "axios";
import { Loader, LoaderCircle, Wifi, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler } from "chart.js";
import { Line, Radar } from "react-chartjs-2";
import { getRiskColor } from "@/utils/getRiskColor";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface IFeature {
    timestamp: string;
    S2_NDVI_median: number;
    S2_NDVI_stdDev: number;
    L8_NDVI: number;
    MODIS_NDVI: number;
    S2_NDWI_median: number;
    S2_NDWI_stdDev: number;
    L8_NDWI: number;
    L8_LST: number;
    MODIS_LST_Day: number;
    MODIS_LST_Night: number;
    VH: number;
    VV: number;
    VV_VH_diff: number;
    VV_VH_ratio: number;
}
interface IPointFeatures {
    point: {
        lat: number;
        lon: number;
    };
    features: IFeature[];
    columns: string[];
}

export default function PointDetailsDrawer({ isOpen, onClose, selectedFeature }: { isOpen: boolean; onClose: () => void; selectedFeature: IGeoJSONFeature | null }): React.JSX.Element {
    const [pointFeatures, setPointFeatures] = useState<IPointFeatures | null>(null);
    const [features, setFeatures] = useState<IFeature[]>([]);
    const { startLoading, stopLoading, isLoading } = useLoading();

    useEffect(() => {
        if (!isOpen) return;

        const controller = new AbortController();
        (async () => {
            try {
                startLoading();
                const getPointFeature: AxiosResponse<IPointFeatures> = await axios.post(
                    "/api/dev/point-features",
                    {
                        lat: selectedFeature?.geometry.coordinates[1],
                        lon: selectedFeature?.geometry.coordinates[0],
                        end_date: new Date().toLocaleDateString("pt-PT").split("/").reverse().join("-"), // YYYY-MM-DD
                        months: 12,
                    },
                    { signal: controller.signal }
                );

                setPointFeatures(getPointFeature.data);
                setFeatures(getPointFeature.data.features);
                console.log(getPointFeature);
            } catch (e) {
                if (axios.isCancel(e)) {
                    console.log("Request canceled:", e.message);
                } else {
                    console.error("Request failed:", e);
                }
            } finally {
                stopLoading();
            }
        })();

        return () => {
            controller.abort();
        };
    }, [selectedFeature, isOpen]);

    return (
        <Drawer
            className="rounded-2xl"
            styles={{ mask: { backgroundColor: "transparent" } }}
            size={"large"}
            style={{ backgroundColor: "rgb(0 0 0 / 0.7)" }}
            placement={"bottom"}
            mask={{ blur: false }}
            closable={false}
            onClose={onClose}
            open={isOpen}
            key={"drawer"}
        >
            <div className="fixed flex w-full flex-row items-center">
                <X className="cursor-pointer text-white" size={30} onClick={() => onClose()} />
                <div className="ml-5 text-2xl font-bold text-cyan-400">
                    Prediction <span className="text-white">Details</span>
                </div>
            </div>
            {!isLoading ? (
                <div className="mt-16 flex h-full w-full flex-col">
                    <div className="mx-auto w-fit">
                        <div className="grid grid-cols-1 justify-between md:grid-cols-2">
                            <div className="flex flex-col py-3 text-center md:border-r-2 md:pr-10 md:text-end">
                                <div className="text-2xl font-bold text-white">Risk</div>
                                <div className="mt-3 text-4xl font-bold" style={{ color: getRiskColor(selectedFeature?.properties.risk!) }}>
                                    {String(Number(selectedFeature?.properties.risk.toFixed(4)) * 100).slice(0, 5)} <span className="text-lg text-white">%</span>
                                </div>
                            </div>
                            <div className="flex flex-col py-3 text-center md:border-l-2 md:pl-10 md:text-start">
                                <div className="text-2xl font-bold text-white">Coordinates</div>
                                <div className="mt-3 flex flex-row items-center">
                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold text-white">Latitude</div>
                                        <div className="text-sm font-bold text-white">Longitude</div>
                                    </div>
                                    <div className="mx-3 h-4/5 w-[2px] rounded-md bg-white"></div>
                                    <div className="flex flex-col">
                                        <div className="text-lg font-bold text-white" style={{ color: getRiskColor(selectedFeature?.properties.risk!) }}>
                                            {selectedFeature?.geometry.coordinates[1].toFixed(5)}
                                        </div>
                                        <div className="text-lg font-bold text-white" style={{ color: getRiskColor(selectedFeature?.properties.risk!) }}>
                                            {selectedFeature?.geometry.coordinates[0].toFixed(5)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto my-10 w-72 rounded-md bg-white py-[1px] md:w-2/5"></div>

                    <Line
                        className="mx-auto mt-5 h-full w-full"
                        data={{
                            labels: features.map((f: IFeature) => f.timestamp),
                            datasets:
                                pointFeatures?.columns.map((column, i) => {
                                    const colors = [
                                        "rgba(75, 192, 192, 1)",
                                        "rgba(255, 99, 132, 1)",
                                        "rgba(54, 162, 235, 1)",
                                        "rgba(255, 206, 86, 1)",
                                        "rgba(153, 102, 255, 1)",
                                        "rgba(255, 159, 64, 1)",
                                    ];
                                    const color = colors[i % colors.length];
                                    return {
                                        label: column,
                                        data: features.map((f: IFeature) => (f as any)[column]),
                                        borderColor: color,
                                        backgroundColor: color.replace("1)", "0.5)"),
                                        tension: 0.4,
                                    };
                                }) || [],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            color: "#fff",
                            plugins: {
                                legend: {
                                    position: "right",
                                    labels: {
                                        color: "#fff",
                                    },
                                },
                                // title: {
                                //     color: "white",
                                //     display: true,
                                //     text: "Feature Data Over Time",
                                // },
                            },
                            scales: {
                                x: {
                                    ticks: { color: "#fff" },
                                },
                                y: {
                                    ticks: { color: "#fff" },
                                },
                            },
                        }}
                    />

                    {/* just spacer idk why lol */}
                    <div className="mt-16 py-1"></div>
                </div>
            ) : (
                <div className="flex h-full flex-col items-center justify-center">
                    <Spin size="large" styles={{ indicator: { color: "white", scale: "230%" } }} />
                    {/* <Wifi className="animate-ping text-white" size={60} /> */}
                    <div className="text-md mt-14 font-bold text-white">Gathering Data. Please wait...</div>
                </div>
            )}
        </Drawer>
    );
}
