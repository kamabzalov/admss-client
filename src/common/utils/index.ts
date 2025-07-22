import { EXCLUDED_PAYLOAD_KEYS } from "common/constants/excluded-payload-keys";

export const filterPostPayload = <T>(payload: T, extraExcludedKeys: string[] = []): T => {
    const defaultExcludedKeys = EXCLUDED_PAYLOAD_KEYS;
    const excludedKeys = [...defaultExcludedKeys, ...extraExcludedKeys];
    return Object.fromEntries(
        Object.entries(payload as Record<string, string | number>).filter(
            ([key]) => !excludedKeys.includes(key)
        )
    ) as T;
};
