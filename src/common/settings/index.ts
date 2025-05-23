interface AppSettings {
    ROWS_PER_PAGE: Array<number>;
    TOAST_LIFETIME: number;
    DEFAULT_FILTER_THRESHOLD: number;
}

const { ROWS_PER_PAGE, TOAST_LIFETIME, DEFAULT_FILTER_THRESHOLD }: AppSettings = {
    ROWS_PER_PAGE: [20, 50, 100, 1000],
    TOAST_LIFETIME: 3000,
    DEFAULT_FILTER_THRESHOLD: 15,
};

export { ROWS_PER_PAGE, TOAST_LIFETIME, DEFAULT_FILTER_THRESHOLD };
