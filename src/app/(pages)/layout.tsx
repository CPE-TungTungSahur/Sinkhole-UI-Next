import Navbar from "@/components/Navbar";
import React from "react";

export default function PageLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
