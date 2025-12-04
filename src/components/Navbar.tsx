"use client";

import { usePathname } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Navbar(): React.JSX.Element {
    const pathname = usePathname();

    type TDes = {
        name: string;
        path: string;
    };

    const desMapping: TDes[] = [
        {
            name: "map",
            path: "/map",
        },
        {
            name: "Home",
            path: "/",
        },
    ];
    const [des, setDes] = useState<TDes>();

    useEffect(() => {
        const splitPath: string[] = pathname.split("/");
        if (splitPath.length === 0) {
            setDes(desMapping.filter((d) => d.name === splitPath[splitPath.length - 1])[0]);
        } else {
            console.log("asdsa");
            setDes(desMapping.filter((d) => d.name === "Home")[0]);
        }
    }, [pathname]);

    return (
        <>
            <div className="border-border bg-card/80 fixed left-0 top-0 z-50 w-full bg-[#0000]/50 shadow-lg backdrop-blur-lg">
                <div className="container mx-auto w-full">
                    <div className="flex flex-row items-center justify-between px-10 py-4">
                        <div className="text-2xl font-bold text-white">Sinkhole</div>
                        <Link
                            href={des?.path ? "" : ""}
                            className="bg-card flex cursor-pointer flex-row items-center rounded-lg px-1 py-2 pr-3 text-center font-semibold text-white duration-150 hover:bg-[white] hover:text-black active:scale-[.98] active:bg-[white]/50"
                        >
                            <ChevronLeft className="mr-2" />
                            <span>{des?.name}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
