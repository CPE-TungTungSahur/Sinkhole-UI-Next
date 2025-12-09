"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

export default function LoadingBar(): React.JSX.Element | null {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoading } = useLoading();

    useEffect(() => {
        if (isLoading) {
            setLoading(true);
            setProgress(20);

            const timer1 = setTimeout(() => setProgress(40), 100);
            const timer2 = setTimeout(() => setProgress(60), 200);
            const timer3 = setTimeout(() => setProgress(80), 300);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        } else {
            setProgress(100);
            const completeTimer = setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);

            return () => {
                clearTimeout(completeTimer);
            };
        }
    }, [isLoading]);

    useEffect(() => {
        setLoading(true);
        setProgress(20);

        const timer1 = setTimeout(() => setProgress(40), 100);
        const timer2 = setTimeout(() => setProgress(60), 200);
        const timer3 = setTimeout(() => setProgress(80), 300);

        const completeTimer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
        }, 500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(completeTimer);
        };
    }, [pathname, searchParams]);

    if (!loading && progress === 0) return null;

    return (
        <div className="fixed left-0 top-0 z-40 w-full">
            <div className="h-1 shadow-lg backdrop-blur-2xl">
                <div className="h-1 bg-cyan-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
