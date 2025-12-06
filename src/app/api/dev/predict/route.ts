import { NextResponse } from "next/server";

export async function GET() {
    try {
        const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

        const response = await fetch(`${FASTAPI_URL}/latest-map`);

        if (!response.ok) {
            return NextResponse.json({ error: "FastAPI server error" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Unexpected server error", details: String(error) }, { status: 500 });
    }
}
