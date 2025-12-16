"use client";

import { useRouter } from "next/navigation";
import { ChevronUp, Github, Loader, LoaderCircle, Users } from "lucide-react";
import { useState } from "react";
import { Spin } from "antd";

export default function HomePage() {
    const [isSliding, setIsSliding] = useState(false);
    const router = useRouter();

    const handleSlideUp = () => {
        setIsSliding(true);
        setTimeout(() => {
            router.push("/map");
        }, 1000);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2e344b] via-[#2e344b]/80 to-[#2e344b]">
            <div
                className={`fixed inset-0 z-30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-transform duration-700 ease-in-out ${
                    isSliding ? "-translate-y-full" : "translate-y-0"
                }`}
            >
                <div className="relative flex h-full flex-col items-center justify-center px-4">
                    <div className="absolute right-5 top-5 flex flex-col gap-y-1">
                        <Github
                            size={50}
                            className="cursor-pointer rounded-xl px-3 py-2 text-white duration-300 hover:bg-white/20 hover:text-cyan-400"
                            onClick={() => window.open("https://github.com/CPE-TungTungSahur/Sinkhole-UI-Next", "_blank")}
                        />
                        <Users size={50} className="cursor-pointer rounded-xl px-3 py-2 text-white duration-300 hover:bg-white/20 hover:text-cyan-400" onClick={() => router.push("/members")} />
                    </div>
                    <h1 className="animate__animated animate__fadeIn animate__fast mb-6 cursor-pointer text-center text-5xl font-bold text-white md:text-7xl">
                        Sinkhole <span className="text-cyan-400">Prediction</span>
                    </h1>
                    <p className="animate__animated animate__fadeIn animate__slow mb-8 px-5 text-lg text-gray-300 md:text-xl">
                        Advanced AI-powered system to predict and monitor sinkhole risks in real-time
                    </p>
                    <div
                        onClick={handleSlideUp}
                        className="group relative mb-12 cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-700 hover:scale-105 hover:shadow-cyan-500/50"
                    >
                        <span className="relative z-10">Explore Map</span>
                        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center text-white">
                <Spin size="large" styles={{ indicator: { color: "white", scale: "200%" } }} />
                {/* <LoaderCircle size={75} className="animate-spin" /> */}
                <div className="mt-10 text-lg font-bold">Initializing. Please wait...</div>
            </div>
        </div>
    );
}
