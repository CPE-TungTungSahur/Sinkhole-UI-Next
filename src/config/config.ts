export const config = {
    api: {
        boxMap: {
            token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        },
        backendUrl: process.env.FASTAPI_URL || "http://localhost:8000",
    },
};
