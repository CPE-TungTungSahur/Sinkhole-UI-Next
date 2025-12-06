"use client";

import { usePathname } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { ChevronLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar(): React.JSX.Element {
    const router = useRouter();

    function handleNavigateHome() {
        router.push("/");
    }

    return (
        <>
            <div className="fixed z-50 mt-3 flex w-full flex-row justify-center">
                <div className="border-border bg-card/80 left-0 top-0 w-fit rounded-full bg-[#0000]/50 shadow-lg backdrop-blur-lg duration-300 xl:mx-60">
                    <div className="container mx-auto w-full">
                        <div className="grid grid-cols-1 items-center justify-between px-10 py-2 md:grid-cols-3">
                            <ChevronLeft
                                className="hidden cursor-pointer justify-items-start rounded-xl px-2 py-1 text-white duration-300 hover:bg-white/30 md:flex"
                                size={50}
                                onClick={() => handleNavigateHome()}
                            />
                            <div className="cursor-pointer justify-self-center py-2 text-2xl font-bold text-white" onClick={() => handleNavigateHome()}>
                                Sinkhole <span className="text-cyan-400">Prediction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
