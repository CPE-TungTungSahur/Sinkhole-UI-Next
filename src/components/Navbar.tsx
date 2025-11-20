"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Navbar(): React.JSX.Element {
    const pathname = usePathname();
    const [des, setDes] = useState<{
        name: string;
        path: string;
    }>();

    useEffect(() => {
        console.log();
        setDes({
            name: pathname === "/" ? "Map" : "Home",
            path: pathname === "/" ? "/map" : "/",
        });
    }, [pathname]);
    return (
        <>
            <div className="border-border fixed left-0 top-0 z-50 w-full border-b bg-[#0f1629]/80 backdrop-blur-lg">
                <div className="container mx-auto w-full">
                    <div className="flex flex-row items-center justify-between px-10 py-4">
                        <div className="text-2xl font-bold text-white">Sinkhole</div>
                        <div className="w-20 cursor-pointer rounded-lg border-[1px] border-[#12cef0] bg-transparent px-3 py-2 text-center text-white shadow-lg duration-150 hover:bg-[#12cef0]">
                            {des?.name}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
