import { config } from "@/config/config";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(`${config.api.backendUrl}/latest-geojson`);

        if (!response.ok) {
            return NextResponse.json({ error: "FastAPI server error" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Unexpected server error", details: String(error) }, { status: 500 });
    }
}
