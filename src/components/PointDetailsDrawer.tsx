"use client";

import { IGeoJSONFeature } from "@/app/(pages)/map/page";
import { useLoading } from "@/contexts/LoadingContext";
import { Drawer } from "antd";
import axios, { AxiosResponse } from "axios";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler } from "chart.js";
import { Line, Radar } from "react-chartjs-2";

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
    const { startLoading, stopLoading } = useLoading();

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
            className="rounded-2xl py-5"
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
            <div className="flex flex-row items-center">
                <X className="cursor-pointer text-white" size={30} onClick={() => onClose()} />
                <div className="ml-5 text-2xl font-bold text-cyan-400">
                    Prediction <span className="text-white">Details</span>
                </div>
            </div>

            <div className="flex h-full w-full flex-col">
                <Line
                    className="mx-auto h-full w-full"
                    data={{
                        labels: features.map((f: IFeature) => f.timestamp),
                        datasets:
                            pointFeatures?.columns.map((column, i) => {
                                const colors = ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"];
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
                        plugins: {
                            legend: { position: "right" },
                            title: {
                                display: true,
                                text: "Feature Data Over Time",
                            },
                        },
                    }}
                />

                {/* <div>asd</div> */}
            </div>
        </Drawer>
    );
}
