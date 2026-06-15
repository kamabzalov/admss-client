import { ReactElement, useState } from "react";
import {
    AdvancedSearchDialog,
    SEARCH_FIELD_TYPE,
    SEARCH_FORM_TYPE,
    SearchField,
} from "dashboard/common/dialog/search";
import { createStringifySearchQuery, isObjectValuesEmpty } from "common/helpers";
import { DatatableQueries } from "common/models/datatable-queries";
import { QueryParams } from "common/models/query-params";
import { AdvancedSearch } from "dashboard/contacts/common/data-table";

interface ContactsAdvancedSearchProps {
    visible: boolean;
    onHide: () => void;
    lazyState: DatatableQueries;
    onSearch: (params: QueryParams, total?: boolean) => Promise<void>;
}

export default function ContactsAdvancedSearch({
    visible,
    onHide,
    lazyState,
    onSearch,
}: ContactsAdvancedSearchProps): ReactElement {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [advancedSearch, setAdvancedSearch] = useState<AdvancedSearch>({} as AdvancedSearch);

    const handleSetAdvancedSearch = (key: keyof AdvancedSearch, value: string | number) => {
        setAdvancedSearch((prevSearch) => {
            const newSearch = { ...prevSearch, [key]: value };
            setButtonDisabled(isObjectValuesEmpty(newSearch));
            return newSearch;
        });
    };

    const handleAdvancedSearch = () => {
        const searchQuery = Object.entries(advancedSearch)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${value}.${key}`)
            .join("+");

        onSearch({ qry: searchQuery }, true);
        onHide();
    };

    const handleClearAdvancedSearchField = async (key: keyof AdvancedSearch) => {
        setButtonDisabled(true);
        setAdvancedSearch((prev) => {
            const updatedSearch = { ...prev };
            delete updatedSearch[key];
            return updatedSearch;
        });

        try {
            const updatedSearch = { ...advancedSearch };
            delete updatedSearch[key];

            const isAdvancedSearchEmpty = isObjectValuesEmpty(updatedSearch);
            const params: QueryParams = {
                ...(lazyState.sortOrder === 1 && { type: "asc" }),
                ...(lazyState.sortOrder === -1 && { type: "desc" }),
                ...(!isAdvancedSearchEmpty && { qry: createStringifySearchQuery(updatedSearch) }),
                skip: lazyState.first,
                top: lazyState.rows,
            };
            await onSearch(params);
        } finally {
            setButtonDisabled(false);
        }
    };

    const handleHide = () => {
        setButtonDisabled(true);
        onHide();
    };

    const searchFields: SearchField<AdvancedSearch>[] = [
        {
            key: "username",
            label: "Contact name",
            value: advancedSearch?.username,
            type: SEARCH_FIELD_TYPE.TEXT,
        },
        {
            key: "type",
            label: "Contact type",
            value: advancedSearch?.type?.toString(),
            type: SEARCH_FIELD_TYPE.DROPDOWN,
        },
        {
            key: "phone1",
            label: "Work phone",
            value: advancedSearch.phone1,
            type: SEARCH_FIELD_TYPE.NUMBER,
        },
        {
            key: "phone2",
            label: "Home phone",
            value: advancedSearch.phone2,
            type: SEARCH_FIELD_TYPE.NUMBER,
        },
    ];

    return (
        <AdvancedSearchDialog<AdvancedSearch>
            visible={visible}
            buttonDisabled={buttonDisabled}
            onHide={handleHide}
            action={handleAdvancedSearch}
            onSearchClear={handleClearAdvancedSearchField}
            onInputChange={handleSetAdvancedSearch}
            fields={searchFields}
            searchForm={SEARCH_FORM_TYPE.CONTACTS}
        />
    );
}
