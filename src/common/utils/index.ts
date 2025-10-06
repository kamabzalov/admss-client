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

export const typeGuards = {
    isExist: <T>(value: T): value is NonNullable<T> => {
        return value !== undefined && value !== null;
    },
    isNumber: (value: unknown): value is number => {
        return typeof value === "number";
    },
    isString: (value: unknown): value is string => {
        return typeof value === "string";
    },
    isFunction: <F extends Function = Function>(value: unknown): value is F => {
        return typeof value === "function";
    },
    isArray: (value: unknown): value is Array<unknown> => {
        return Array.isArray(value);
    },
};
