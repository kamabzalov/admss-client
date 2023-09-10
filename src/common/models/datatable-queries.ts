export interface DatatableQueries {
    [key: string]: any;
}

export const initialDataTableQueries: DatatableQueries = {
    first: 0,
    rows: 10,
    page: 1,
    column: "",
    sortField: "",
    sortOrder: null,
};
