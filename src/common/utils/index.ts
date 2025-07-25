import { EXCLUDED_PAYLOAD_KEYS } from "common/constants/excluded-payload-keys";

interface FilterPayloadOptions<T> {
    excludeKeys?: (keyof T)[];
    includeKeys?: (keyof T)[];
}

export const clearEmptyValues = <T>(payload: T, includeKeys?: (keyof T)[]): T => {
    return Object.fromEntries(
        Object.entries(payload!).filter(
            ([key, value]) => includeKeys?.includes(key as keyof T) || value !== ""
        )
    ) as T;
};

export const filterPostPayload = <T>(payload: T, options?: FilterPayloadOptions<T>): T => {
    const { excludeKeys = [], includeKeys } = options || {};
    const excludedKeys = [...EXCLUDED_PAYLOAD_KEYS, ...excludeKeys];
    const clearedPayload = clearEmptyValues(payload, includeKeys);
    return Object.fromEntries(
        Object.entries(clearedPayload as Record<string, string | number>).filter(
            ([key]) => !excludedKeys.includes(key as keyof T)
        )
    ) as T;
};
