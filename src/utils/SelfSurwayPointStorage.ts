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
    const getAllPointParsed: ISelfSurwayPoint[] = JSON.parse(getAllPoint);

    localStorage.setItem(
        "selfSurwayPoint",
        JSON.stringify([
            ...getAllPointParsed,
            {
                lat: lat,
                lon: lon,
                risk: risk,
                create_at: new Date().toISOString(),
                expire_at: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // set time for next 2 hour
            },
        ])
    );

    const getAllPoint2: string = localStorage.getItem("selfSurwayPoint") as string;
    const getAllPointParsed2: ISelfSurwayPoint[] = JSON.parse(getAllPoint);
    console.log(getAllPointParsed2);

    return;
}

export function getSelfSurwayPoint({ lat, lon }: { lat: number; lon: number }): ISelfSurwayPoint[] {
    initSelfSurwayPoint();
    expireCheckSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;

    const getAllPointParsed: ISelfSurwayPoint[] = JSON.parse(getAllPoint);
    const result: ISelfSurwayPoint[] = getAllPointParsed.filter((p) => p.lat == lat && p.lon == lon);
    return result;
}

export function getAllSelfSurwayPoint() {
    initSelfSurwayPoint();
    expireCheckSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;

    const getAllPointParsed: ISelfSurwayPoint[] = JSON.parse(getAllPoint);
    return getAllPointParsed;
}

export function expireCheckSelfSurwayPoint(): void {
    initSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;
    const getAllPointParsed: ISelfSurwayPoint[] = JSON.parse(getAllPoint);

    const filterExpireOut = getAllPointParsed.filter((p) => new Date(p.expire_at as string).getTime() >= new Date().getTime()); // get only unexpire
    localStorage.setItem("selfSurwayPoint", JSON.stringify(filterExpireOut)); // set only unexpire
}

export function deleteSelfSurwayPoint({ lat, lon }: { lat: number; lon: number }): void {
    initSelfSurwayPoint();

    const getAllPoint: string = localStorage.getItem("selfSurwayPoint") as string;
    const getAllPointParsed: ISelfSurwayPoint[] = JSON.parse(getAllPoint);

    const filterOnlyUnselectPoint = getAllPointParsed.filter((p) => p.lat !== lat && p.lon !== lon); // get only unexpire
    localStorage.setItem("selfSurwayPoint", JSON.stringify(filterOnlyUnselectPoint)); // set only unexpire
}

export function initSelfSurwayPoint(): void {
    const getAllPoint: string | null = localStorage.getItem("selfSurwayPoint");
    console.log(getAllPoint);
    if (!getAllPoint) localStorage.setItem("selfSurwayPoint", JSON.stringify([]));
}
