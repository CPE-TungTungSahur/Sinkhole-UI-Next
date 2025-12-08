import LoadingBar from "@/components/LoadingBar";
import Navbar from "@/components/Navbar";
import { LoadingProvider } from "@/contexts/LoadingContext";
import React from "react";

export default function PageLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <LoadingProvider>
            <div className="">
                <LoadingBar />
                <Navbar />
                {children}
            </div>
        </LoadingProvider>
    );
}
