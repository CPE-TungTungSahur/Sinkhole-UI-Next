import { Drawer } from "antd";
import { X } from "lucide-react";
import React from "react";
import { IGeoJSONFeature, PointFeatureResponse } from "@/app/(pages)/map/page";
interface PointDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    feature: IGeoJSONFeature | null;
    pointFeatureData: PointFeatureResponse | null;
    isFeatureLoading: boolean;
}

export default function PointDetailsDrawer({ isOpen, onClose, feature, pointFeatureData, isFeatureLoading }: PointDetailsDrawerProps): React.JSX.Element {
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
            {/* <div className="mx-auto h-[4px] w-24 rounded-2xl bg-white/50"></div> */}
            <div className="mt-5 flex flex-row items-center">
                <X className="cursor-pointer text-white" size={30} onClick={() => onClose()} />
                <div className="ml-5 text-2xl font-bold text-cyan-400">
                    Prediction <span className="text-white">Details</span>
                </div>
                {/*  เขียนตรงนี้จ้า  */}
                {isFeatureLoading ? (
                    <div className="ml-auto mr-4 text-white">Loading...</div> // ใส่หน้าโหลด
                ) : pointFeatureData && feature ? ( // ตรวจสอบว่ามีข้อมูลไหม
                    <div className="ml-auto mr-4 text-white">
                        <div>Latitude: {pointFeatureData.point.lat.toFixed(10)}</div>
                        <div>Longitude: {pointFeatureData.point.lon.toFixed(10)}</div>
                    </div>
                ) : (
                    <div className="ml-auto mr-4 text-white">No data available</div>
                )}
                {/*  เขียนตรงนี้จ้า  */}
            </div>
        </Drawer>
    );
}
