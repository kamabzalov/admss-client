import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { LS_APP_USER } from "common/constants/localStorage";
import { SalespersonsList } from "common/models/contact";
import { AuthUser } from "http/services/auth.service";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { useState, useEffect } from "react";
import { getKeyValue } from "services/local-storage.service";
import { DropdownProps } from "primereact/dropdown";
import { SalespersonsDataTable } from "./salespersons-table";

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
    const [user, setUser] = useState<AuthUser | null>(null);
    const [options, setOptions] = useState<SalespersonsList[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    const handleSalespersonInputChange = (searchValue: string): void => {
        if (!searchValue.trim()) {
            return;
        }
        user &&
            getContactsSalesmanList(user.useruid).then((response) => {
                if (response?.length) {
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
                maximizable
                modal
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
