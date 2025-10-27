export const ALL_FIELDS = "allFields" as const;

export type RETURNED_FIELD_TYPE<T> = keyof T | typeof ALL_FIELDS;
