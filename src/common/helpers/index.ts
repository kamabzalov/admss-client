import { FilterOptions } from "dashboard/common/filter";

export const isObjectEmpty = (obj: Record<string, string>) =>
    Object.values(obj).every((value) => !value.trim().length);

export const filterParams = (obj: Record<string, string>): Record<string, string> => {
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([_, value]) => typeof value === "string" && value.trim().length > 0
        )
    );
};

export const createStringifySearchQuery = (obj: Record<string, string>): string => {
    const filteredObj = filterParams(obj);

    if (Object.keys(filteredObj).length === 0) {
        return "";
    }

    return Object.entries(filteredObj)
        .map(([key, value], index) => {
            return `${index > 0 ? "+" : ""}${value}.${key}`;
        })
        .join("");
};

export const createStringifyFilterQuery = (filterArray: FilterOptions[]): string => {
    let qry: string = "";
    filterArray.forEach((option, index) => {
        const { column, value } = option;
        if (value.includes("-")) {
            const [wordFrom, wordTo] = value.split("-");
            return (qry += `${index > 0 ? "+" : ""}${wordFrom}.${wordTo}.${column}`);
        }
        qry += `${index > 0 ? "+" : ""}${value}.${column}`;
    });
    return qry;
};

export function debounce<T extends (...args: any[]) => any>(
    callee: T,
    timeoutMs: number
): (...args: Parameters<T>) => void {
    let lastCall: number | null = null;
    let lastCallTimer: NodeJS.Timeout | null = null;

    return function perform(...args: Parameters<T>): void {
        if (lastCall !== null && Date.now() - lastCall <= timeoutMs) {
            if (lastCallTimer) {
                clearTimeout(lastCallTimer);
            }
        }

        lastCall = Date.now();

        lastCallTimer = setTimeout(() => {
            callee(...args);
        }, timeoutMs);
    };
}
