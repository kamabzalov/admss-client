import { ReactElement, useState } from "react";
import {
    AdvancedSearchDialog,
    SEARCH_FORM_TYPE,
    SearchField,
    SEARCH_FIELD_TYPE,
} from "dashboard/common/dialog/search";
import { AccountInfo } from "common/models/accounts";
import { getAccountsList } from "http/services/accounts.service";
import { QueryParams } from "common/models/query-params";
import { useStore } from "store/hooks";
import { DatatableQueries } from "common/models/datatable-queries";
import "./index.css";

interface AdvancedSearch {
    [key: string]: string | number;
    accountInfo: string;
    VIN: string;
    StockNo: string;
    date: string;
}

enum SEARCH_FORM_FIELDS {
    ACCOUNT = "Account#",
    DATE = "Date",
}

enum SEARCH_FORM_QUERY {
    ACCOUNT = "accountnumber",
    DATE = "dateeffective",
}

interface AccountsAdvancedSearchProps {
    visible: boolean;
    onClose: () => void;
    onAccountsUpdate: (accounts: AccountInfo[]) => void;
    lazyState: DatatableQueries;
}

export default function AccountsAdvancedSearch({
    visible,
    onClose,
    onAccountsUpdate,
    lazyState,
}: AccountsAdvancedSearchProps): ReactElement {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [advancedSearch, setAdvancedSearch] = useState<Record<string, string | number>>({});
    const userStore = useStore().userStore;
    const { authUser } = userStore;

    const handleSetAdvancedSearch = (key: keyof AdvancedSearch, value: string | number) => {
        setAdvancedSearch((prevSearch) => {
            const newSearch = { ...prevSearch, [key]: value };
            const isAnyValueEmpty = Object.values(newSearch).every(
                (searchValue) => searchValue === ""
            );
            setButtonDisabled(isAnyValueEmpty);
            return newSearch;
        });
    };

    const handleAdvancedSearch = () => {
        const searchQuery = Object.entries(advancedSearch)
            .filter(([_, searchValue]) => searchValue)
            .map(([key, searchValue]) => {
                let keyName: string = key;
                switch (key) {
                    case SEARCH_FORM_FIELDS.ACCOUNT:
                        keyName = SEARCH_FORM_QUERY.ACCOUNT;
                        break;

                    case SEARCH_FORM_FIELDS.DATE:
                        keyName = SEARCH_FORM_QUERY.DATE;
                        if (typeof searchValue === "string" && searchValue.includes("-")) {
                            const [startDate, endDate] = searchValue.split("-");
                            return `${startDate}.${endDate}.${keyName}`;
                        }
                        searchValue = new Date(searchValue).getTime();
                        break;
                }
                return `${searchValue}.${keyName}`;
            })
            .join("+");

        const params: QueryParams = {
            top: lazyState.first,
            skip: lazyState.skip,
            qry: searchQuery,
        };

        if (authUser) {
            getAccountsList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    onAccountsUpdate(response);
                } else {
                    onAccountsUpdate([]);
                }
            });
        }

        onClose();
    };

    const handleClearAdvancedSearchField = (key: keyof AdvancedSearch) => {
        setAdvancedSearch((prevSearch) => {
            const updatedSearch = { ...prevSearch };
            delete updatedSearch[key];
            return updatedSearch;
        });
    };

    const searchFields = [
        {
            key: SEARCH_FORM_FIELDS.ACCOUNT,
            label: SEARCH_FORM_FIELDS.ACCOUNT,
            value: advancedSearch?.[SEARCH_FORM_FIELDS.ACCOUNT],
            type: SEARCH_FIELD_TYPE.TEXT,
        },
        {
            key: SEARCH_FORM_FIELDS.DATE,
            label: SEARCH_FORM_FIELDS.DATE,
            value: advancedSearch?.[SEARCH_FORM_FIELDS.DATE],
            type: SEARCH_FIELD_TYPE.DATE_RANGE,
        },
    ];

    return (
        <AdvancedSearchDialog<AdvancedSearch>
            visible={visible}
            buttonDisabled={buttonDisabled}
            onHide={() => {
                setButtonDisabled(true);
                onClose();
            }}
            action={handleAdvancedSearch}
            onSearchClear={handleClearAdvancedSearchField}
            onInputChange={handleSetAdvancedSearch}
            className='accounts-advanced-search'
            fields={searchFields as SearchField<AdvancedSearch>[]}
            searchForm={SEARCH_FORM_TYPE.ACCOUNTS}
        />
    );
}
