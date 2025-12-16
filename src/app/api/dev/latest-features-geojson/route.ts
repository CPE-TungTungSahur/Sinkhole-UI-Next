import { NextResponse } from "next/server";
import { config } from "@/config/config";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");

        if (!lat || !lon) {
            return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
        }

        const res = await fetch(
            `${config.api.backendUrl}/point-features-from-scan?` +
                new URLSearchParams({
                    lat,
                    lon,
                }).toString(),
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: "Backend error", detail: text }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error("latest-features-from-scan error:", err);
        return NextResponse.json({ error: "Backend unreachable or invalid request" }, { status: 500 });
    }
}
