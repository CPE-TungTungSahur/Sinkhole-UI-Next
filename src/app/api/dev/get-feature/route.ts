import { NextResponse } from "next/server";
import { config } from "@/config/config";

const BACKEND_URL = `${config.api.backendUrl}`;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const end_date = searchParams.get("end_date");
    const months = searchParams.get("months") ?? "12";

    if (!lat || !lon || !end_date) {
        return NextResponse.json({ error: "lat, lon, end_date are required" }, { status: 400 });
    }

    const url = `${BACKEND_URL}/point-features` + `?lat=${lat}&lon=${lon}&end_date=${end_date}&months=${months}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            cache: "no-store", // ✅ สำคัญ: ไม่ cache
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: "Backend error", detail: text }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Cannot connect to backend" }, { status: 500 });
    }
}
