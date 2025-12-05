"use client";

import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
    const [isSliding, setIsSliding] = useState(false);
    const router = useRouter();

    const handleSlideUp = () => {
        setIsSliding(true);
        setTimeout(() => {
            router.push("/map");
        }, 700);
    };

    return (
        <div
            className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-transform duration-700 ease-in-out ${
                isSliding ? "-translate-y-full" : "translate-y-0"
            }`}
        >
            <div className="flex h-full flex-col items-center justify-center px-4">
                {" "}
                <div className="max-w-4xl text-center">
                    <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
                        Sinkhole <span className="text-cyan-400">Prediction</span>
                    </h1>
                    <p className="mb-8 text-lg text-gray-300 md:text-xl">
                        Advanced AI-powered system to predict and monitor sinkhole risks in real-time
                    </p>

                    <button
                        onClick={handleSlideUp}
                        className="group relative mb-12 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/50"
                    >
                        <span className="relative z-10">Explore Map</span>
                        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                </div>
            </div>
        </div>
    );
}
