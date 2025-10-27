import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { QueryParams } from "common/models/query-params";
import { useState } from "react";
import { DropdownChangeEvent, DropdownProps } from "primereact/dropdown";
import { useStore } from "store/hooks";
import { AccountInfo } from "common/models/accounts";
import { getAccountsList } from "http/services/accounts.service";
import { AccountsDataTable } from "dashboard/accounts";
import { ALL_FIELDS, RETURNED_FIELD_TYPE } from "common/constants/fields";

const FIELD: keyof AccountInfo = "name";

interface AccountSearchProps extends DropdownProps {
    onRowClick?: (accountName: string) => void;
    returnedField?: RETURNED_FIELD_TYPE<AccountInfo>;
    getFullInfo?: (account: AccountInfo) => void;
}

export const AccountSearch = ({
    name,
    value,
    onRowClick,
    onChange,
    returnedField,
    getFullInfo,
    ...props
}: AccountSearchProps) => {
    const [options, setOptions] = useState<AccountInfo[]>([]);
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    const handleAccountInputChange = async (searchValue: string) => {
        if (!searchValue.trim()) {
            return;
        }
        const field = returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD;
        const qry = `${searchValue}.${field}`;
        const params: QueryParams = {
            qry,
        };
        const response = await getAccountsList(authUser!.useruid, params);

        if (Array.isArray(response)) {
            setOptions(response);
        } else {
            setOptions([]);
        }
    };

    const handleOnRowClick = (accountName: string) => {
        onRowClick && onRowClick(accountName);
        setDialogVisible(false);
    };

    const handleGetFullInfo = (account: AccountInfo) => {
        getFullInfo && getFullInfo(account);
        setDialogVisible(false);
    };

    const handleOnChange = (event: DropdownChangeEvent) => {
        const selectedValue = event.value;

        if (returnedField === ALL_FIELDS) {
            const selectedAccount = options.find((account) => account[FIELD] === selectedValue);

            if (selectedAccount && getFullInfo) {
                getFullInfo(selectedAccount);
            }
        }

        if (onChange) {
            onChange(event);
        }
    };

    return (
        <>
            <SearchInput
                name={name}
                title={name}
                optionValue={returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD}
                optionLabel={FIELD}
                options={options}
                onInputChange={handleAccountInputChange}
                value={value}
                onChange={handleOnChange}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                {...props}
            />
            <Dialog
                header={<div className='uppercase'>Choose an Account</div>}
                visible={dialogVisible}
                style={{ width: "75vw", height: "75vh" }}
                maximizable
                modal
                onHide={() => setDialogVisible(false)}
            >
                <AccountsDataTable
                    onRowClick={handleOnRowClick}
                    returnedField={
                        returnedField === ALL_FIELDS
                            ? undefined
                            : (returnedField as keyof AccountInfo)
                    }
                    getFullInfo={handleGetFullInfo}
                />
            </Dialog>
        </>
    );
};
