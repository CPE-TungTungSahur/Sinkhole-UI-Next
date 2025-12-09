import axios from "axios";
import { PointFeatureResponse } from "@/app/(pages)/map/page";

export async function getPointFeature(lat: number, lon: number, end_date: string, months: number = 12): Promise<PointFeatureResponse> {
    const res = await axios.get<PointFeatureResponse>("/api/point-features", {
        params: {
            lat,
            lon,
            end_date,
            months,
        },
    });

    return res.data;
}
