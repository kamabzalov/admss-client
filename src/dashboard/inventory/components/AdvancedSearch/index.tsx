import { ReactElement, useState } from "react";
import {
    AdvancedSearchDialog,
    SEARCH_FORM_TYPE,
    SearchField,
} from "dashboard/common/dialog/search";
import { SEARCH_FIELD_TYPE } from "dashboard/common/dialog/search";
import { createStringifySearchQuery, filterParams, isObjectValuesEmpty } from "common/helpers";
import { DatatableQueries } from "common/models/datatable-queries";
import { QueryParams } from "common/models/query-params";
import { Inventory } from "common/models/inventory";

interface SearchFields extends Pick<Inventory, "StockNo" | "Make" | "Model" | "VIN"> {}

interface AdvancedSearchProps<T> {
    visible: boolean;
    buttonDisabled: boolean;
    onHide: () => void;
    onApply: () => void;
    onSearchClear: (key: keyof T) => void;
    onInputChange: (key: keyof T, value: string) => void;
    fields: SearchField<T>[];
}

export default function AdvancedSearch<T>({
    visible,
    buttonDisabled,
    onHide,
    onApply,
    onSearchClear,
    onInputChange,
    fields,
}: AdvancedSearchProps<T>): ReactElement {
    return (
        <AdvancedSearchDialog<T>
            visible={visible}
            buttonDisabled={buttonDisabled}
            onHide={onHide}
            action={onApply}
            onSearchClear={onSearchClear}
            onInputChange={onInputChange}
            fields={fields}
            searchForm={SEARCH_FORM_TYPE.INVENTORY}
        />
    );
}

export function InventoryAdvancedSearch({
    visible,
    onClose,
    lazyState,
    setIsLoading,
    handleGetInventoryList,
}: {
    visible: boolean;
    onClose: () => void;
    lazyState: DatatableQueries;
    setIsLoading: (value: boolean) => void;
    handleGetInventoryList: (params: QueryParams, total?: boolean) => Promise<void>;
}): ReactElement {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [advancedSearch, setAdvancedSearch] = useState<
        Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN">
    >({});

    const handleSetAdvancedSearch = (
        key: keyof Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN">,
        value: string
    ) => {
        setIsLoading(true);
        setAdvancedSearch((prevSearch) => {
            const nextSearch = { ...prevSearch, [key]: value };

            if (key === "Make") {
                nextSearch.Model = "";
            }

            const hasEmpty = isObjectValuesEmpty(nextSearch);
            setButtonDisabled(hasEmpty);
            return nextSearch;
        });
        setIsLoading(false);
    };

    const handleApply = () => {
        setIsLoading(true);
        const searchParams = createStringifySearchQuery(advancedSearch as Record<string, string>);
        handleGetInventoryList(
            { ...filterParams({ top: lazyState.first }), qry: searchParams },
            true
        );
        onClose();
        setIsLoading(false);
    };

    const handleClearField = async (
        key: keyof Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN">
    ) => {
        setIsLoading(true);
        setButtonDisabled(true);
        setAdvancedSearch((prev) => {
            const updated = { ...prev } as Record<string, string>;
            delete updated[key as string];
            return updated;
        });

        try {
            setIsLoading(true);
            const updatedSearch = { ...(advancedSearch as Record<string, string>) };
            delete updatedSearch[key as string];
            const isEmpty = isObjectValuesEmpty(advancedSearch as Record<string, string>);
            const params: QueryParams = {
                ...(lazyState.sortOrder === 1 && { type: "asc" }),
                ...(lazyState.sortOrder === -1 && { type: "desc" }),
                ...(!isEmpty && { qry: createStringifySearchQuery(updatedSearch) }),
                skip: lazyState.first,
                top: lazyState.rows,
            };
            await handleGetInventoryList(params);
        } finally {
            setButtonDisabled(false);
        }
    };

    const fields: SearchField<SearchFields>[] = [
        { key: "StockNo", value: advancedSearch?.StockNo, type: SEARCH_FIELD_TYPE.TEXT },
        { key: "Make", value: advancedSearch?.Make, type: SEARCH_FIELD_TYPE.DROPDOWN },
        { key: "Model", value: advancedSearch?.Model, type: SEARCH_FIELD_TYPE.DROPDOWN },
        { key: "VIN", value: advancedSearch?.VIN, type: SEARCH_FIELD_TYPE.TEXT },
    ];

    return (
        <AdvancedSearch<SearchFields>
            visible={visible}
            buttonDisabled={buttonDisabled}
            onHide={() => {
                setButtonDisabled(true);
                onClose();
            }}
            onApply={handleApply}
            onSearchClear={handleClearField}
            onInputChange={handleSetAdvancedSearch}
            fields={fields}
        />
    );
}
