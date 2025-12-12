import { NextResponse } from "next/server";
import { config } from "@/config/config";

const BACKEND_URL = `${config.api.backendUrl}/predict-point`;

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { lat, lon, date } = body;

        if (lat === undefined || lon === undefined || !date) {
            return NextResponse.json({ error: "lat, lon, date are required" }, { status: 400 });
        }

        // ส่งต่อไป backend FastAPI
        const res = await fetch(`${BACKEND_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lat,
                lon,
                date: date,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: "Backend error", detail: text }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error("API Route Error:", err);
        return NextResponse.json({ error: "Invalid request or backend unreachable" }, { status: 500 });
    }
}
