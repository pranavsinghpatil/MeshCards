export const getApiUrl = (endpoint: string) => {
    const base = import.meta.env.VITE_API_URL || "";
    // If base exists, join with endpoint (handling slashes)
    // If base is empty, just return endpoint (relative path)
    if (base) {
        const cleanBase = base.replace(/\/$/, "");
        const cleanEndpoint = endpoint.replace(/^\//, "");
        return `${cleanBase}/${cleanEndpoint}`;
    }
    return endpoint;
};
