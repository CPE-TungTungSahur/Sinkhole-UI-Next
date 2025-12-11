export interface ISelfSurwayPoint {
    lat: number;
    lon: number;
    risk: number;
    create_at?: string;
    expire_at?: string;
}

export function setSelfSurwayPoint({ lat, lon, risk }: ISelfSurwayPoint): void {
    initSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;

    localStorage.setItem(
        "selfSurwayPoint",
        JSON.stringify([
            ...getAllPoint,
            {
                lat: lat,
                lon: lon,
                risk: risk,
                create_at: new Date().toISOString(),
                expire_at: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // set time for next 2 hour
            },
        ])
    );
    return;
}

export function getSelfSurwayPoint({ lat, lon }: { lat: number; lon: number }): ISelfSurwayPoint[] {
    initSelfSurwayPoint();
    expireCheckSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;

    const getAllPointJson: ISelfSurwayPoint[] = JSON.parse(getAllPoint);
    const result: ISelfSurwayPoint[] = getAllPointJson.filter((p) => p.lat == lat && p.lon == lon);
    return result;
}

export function getAllSelfSurwayPoint() {
    initSelfSurwayPoint();
    expireCheckSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;

    const getAllPointJson: ISelfSurwayPoint[] = JSON.parse(getAllPoint);
    return getAllPointJson;
}

export function expireCheckSelfSurwayPoint(): void {
    initSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;
    const getAllPointJson: ISelfSurwayPoint[] = JSON.parse(getAllPoint);

    const filterExpireOut = getAllPointJson.filter((p) => new Date(p.expire_at as string).getTime() <= new Date().getTime()); // get only unexpire
    localStorage.setItem("selfSurwayPoint", JSON.stringify(filterExpireOut)); // set only unexpire
}

export function deleteSelfSurwayPoint({ lat, lon }: { lat: number; lon: number }): void {
    initSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;
    const getAllPointJson: ISelfSurwayPoint[] = JSON.parse(getAllPoint);

    const filterOnlyUnselectPoint = getAllPointJson.filter((p) => p.lat !== lat && p.lon !== lon); // get only unexpire
    localStorage.setItem("selfSurwayPoint", JSON.stringify(filterOnlyUnselectPoint)); // set only unexpire
}

export function initSelfSurwayPoint() {
    localStorage.setItem("selfSurwayPoint", JSON.stringify([]));
}
