export const filterPostPayload = <T>(payload: T, extraExcludedKeys: string[] = []): T => {
    const defaultExcludedKeys = ["index", "created", "updated", "status"];
    const excludedKeys = [...defaultExcludedKeys, ...extraExcludedKeys];
    return Object.fromEntries(
        Object.entries(payload as Record<string, string | number>).filter(
            ([key]) => !excludedKeys.includes(key)
        )
    ) as T;
};
