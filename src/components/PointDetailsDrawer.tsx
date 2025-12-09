import { IGeoJSONFeature } from "@/app/(pages)/map/page";
import { useLoading } from "@/contexts/LoadingContext";
import { Drawer } from "antd";
import axios, { AxiosResponse } from "axios";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

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
            <div className="mt-5 flex flex-row items-center">
                <X className="cursor-pointer text-white" size={30} onClick={() => onClose()} />
                <div className="ml-5 text-2xl font-bold text-cyan-400">
                    Prediction <span className="text-white">Details</span>
                </div>
                asd
            </div>
        </Drawer>
    );
}
