import { Drawer } from "antd";
import { X } from "lucide-react";
import React from "react";

export default function PointDetailsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): React.JSX.Element {
    return (
        <Drawer
            className="rounded-2xl"
            maskStyle={{ backgroundColor: "transparent" }}
            size={"large"}
            style={{ backgroundColor: "rgb(0 0 0 / 0.7)" }}
            placement={"bottom"}
            mask={{ blur: false }}
            closable={false}
            onClose={onClose}
            open={true}
            key={"drawer"}
        >
            {/* <div className="mx-auto h-[4px] w-24 rounded-2xl bg-white/50"></div> */}
            <div className="mt-5 flex flex-row items-center">
                <X className="cursor-pointer text-white" size={30} />
                <div className="ml-5 text-2xl font-bold text-cyan-400">
                    Prediction <span className="text-white">Details</span>
                </div>
            </div>
        </Drawer>
    );
}
