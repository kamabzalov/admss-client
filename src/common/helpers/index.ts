import { FilterOptions } from "dashboard/common/filter";

export const isObjectValuesEmpty = (obj: Record<string, string | number>) =>
    Object.values(obj).every((value) =>
        typeof value === "string" ? !value.trim().length : !value
    );

export const filterParams = (
    obj: Record<string, string | number>
): Record<string, string | number> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) =>
            typeof value === "string"
                ? value.trim().length > 0
                : value !== null && value !== undefined
        )
    );
};

export const createStringifySearchQuery = (obj: Record<string, string | number>): string => {
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
    return filterArray
        .map(({ column, value }, index) => {
            if (value.includes("-")) {
                const [wordFrom, wordTo] = value.split("-");
                return `${index > 0 ? "+" : ""}${wordFrom}.${wordTo}.${column}`;
            }
            return `${value.trim()}.${column}`;
        })
        .join("+");
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

export const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    let formatted = "";

    switch (true) {
        case digits.length === 11 && digits.startsWith("1"):
            formatted = `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
            break;
        case digits.length === 10:
            formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
            break;
        case digits.length > 6:
            formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
            break;
        case digits.length > 3:
            formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}`;
            break;
        case digits.length > 0:
            formatted = digits.slice(0, 3);
            break;
    }

    return formatted;
};

interface FormatCurrencyOptions {
    digitsAfterDecimal?: number;
}

export const formatCurrency = (
    value: string | number,
    options: FormatCurrencyOptions = {}
): string => {
    const { digitsAfterDecimal = 2 } = options;

    if (typeof value === "string") {
        value = Number(value);
    }

    const formattedValue = value
        .toFixed(digitsAfterDecimal)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

    return `$ ${formattedValue}`;
};

export const centsToDollars = (cents: number): number => {
    const dollars = cents * 100;

    return Number(dollars.toFixed(2));
};

export const setCursorToStart = (element: HTMLInputElement | null) => {
    if (element) {
        setTimeout(() => element.setSelectionRange(0, 0), 0);
    }
};
