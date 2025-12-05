"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";

export default function LandingDrawer(): React.JSX.Element {
    const [isHidden, setIsHidden] = useState(false);
    const [isSliding, setIsSliding] = useState(false);
    const router = useRouter();

    const handleSlideUp = () => {
        setIsSliding(true);
        setTimeout(() => {
            setIsHidden(true);
            router.push("/map");
        }, 700);
    };

    if (isHidden) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-transform duration-700 ease-in-out ${
                isSliding ? "-translate-y-full" : "translate-y-0"
            }`}
        >
            {/* Content Container */}
            <div className="flex h-full flex-col items-center justify-center px-4">
                {/* Main Content */}
                <div className="max-w-4xl text-center">
                    <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
                        Sinkhole <span className="text-cyan-400">Prediction</span>
                    </h1>
                    <p className="mb-8 text-lg text-gray-300 md:text-xl">
                        Advanced AI-powered system to predict and monitor sinkhole risks in real-time
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={handleSlideUp}
                        className="group relative mb-12 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/50"
                    >
                        <span className="relative z-10">Explore Map</span>
                        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>

                    {/* Features Grid */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-slate-800/50 p-6 backdrop-blur">
                            <div className="mb-3 text-3xl">🗺️</div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Interactive Map</h3>
                            <p className="text-sm text-gray-400">Real-time visualization of sinkhole predictions</p>
                        </div>
                        <div className="rounded-lg bg-slate-800/50 p-6 backdrop-blur">
                            <div className="mb-3 text-3xl">⚠️</div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Risk Assessment</h3>
                            <p className="text-sm text-gray-400">AI-powered analysis of high-risk areas</p>
                        </div>
                        <div className="rounded-lg bg-slate-800/50 p-6 backdrop-blur">
                            <div className="mb-3 text-3xl">📊</div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Data Analytics</h3>
                            <p className="text-sm text-gray-400">Comprehensive insights and predictions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Swipe Up Indicator */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
                onClick={handleSlideUp}
            >
                <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="text-sm">Swipe up to explore</span>
                    <ChevronUp className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}
