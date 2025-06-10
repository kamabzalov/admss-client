import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { SalespersonsList } from "common/models/contact";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { useState } from "react";
import { DropdownProps } from "primereact/dropdown";
import { SalespersonsDataTable } from "./salespersons-table";
import { useStore } from "store/hooks";

const FIELD: keyof SalespersonsList = "username";

interface SalespersonSearchProps extends DropdownProps {
    onRowClick?: (username: string) => void;
    onChangeGetFullInfo?: (salesperson: SalespersonsList) => void;
    getFullInfo?: (salesperson: SalespersonsList) => void;
}

export const SalespersonSearch = ({
    name,
    value,
    onRowClick,
    onChange,
    getFullInfo,
    onChangeGetFullInfo,
    ...props
}: SalespersonSearchProps) => {
    const [options, setOptions] = useState<SalespersonsList[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const userStore = useStore().userStore;
    const { authUser } = userStore;

    const handleSalespersonInputChange = (searchValue: string): void => {
        if (!searchValue.trim()) {
            return;
        }
        getContactsSalesmanList(authUser!.useruid).then((response) => {
            if (response && Array.isArray(response)) {
                const filteredOptions = response.filter((item) =>
                    item.username.toLowerCase().includes(searchValue.toLowerCase())
                );
                setOptions(filteredOptions);
            } else {
                setOptions([]);
            }
        });
    };

    const handleOnRowClick = (username: string) => {
        onRowClick && onRowClick(username);
        setDialogVisible(false);
    };

    const handleGetFullInfo = (salesperson: SalespersonsList) => {
        getFullInfo && getFullInfo(salesperson);
        setDialogVisible(false);
    };

    return (
        <>
            <SearchInput
                name={name}
                title={name}
                optionValue={FIELD}
                optionLabel={FIELD}
                options={options}
                onInputChange={handleSalespersonInputChange}
                value={value}
                onChange={(event) => {
                    onChangeGetFullInfo && onChangeGetFullInfo(event.target.value);
                    onChange && onChange(event);
                }}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                {...props}
            />
            <Dialog
                header={<div className='uppercase'>Choose a Contact</div>}
                visible={dialogVisible}
                style={{ width: "75vw", height: "75vh" }}
                onHide={() => setDialogVisible(false)}
            >
                <SalespersonsDataTable
                    onRowClick={handleOnRowClick}
                    getFullInfo={handleGetFullInfo}
                />
            </Dialog>
        </>
    );
};
