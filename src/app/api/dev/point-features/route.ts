import { config } from "@/config/config";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const req = ((await request.json()) as { lat: number; lon: number; end_date: string; months: number }) ?? null;

    try {
        const response = await axios.get(`${config.api.backendUrl}/point-features`, {
            params: {
                lat: req.lat,
                lon: req.lon,
                end_date: req.end_date,
                months: req.months,
            },
        });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Unexpected server error", details: String(error) }, { status: 500 });
    }
}
