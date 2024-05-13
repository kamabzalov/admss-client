import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { LS_APP_USER } from "common/constants/localStorage";
import { QueryParams } from "common/models/query-params";
import { AuthUser } from "http/services/auth.service";
import { getInventoryList } from "http/services/inventory-service";
import { useState, useEffect } from "react";
import { getKeyValue } from "services/local-storage.service";
import { DropdownProps } from "primereact/dropdown";
import { Inventory } from "common/models/inventory";
import Inventories from "dashboard/inventory";

const FIELD: keyof Inventory = "name";

interface InventorySearchProps extends DropdownProps {
    onRowClick?: (inventoryName: string) => void;
}

export const InventorySearch = ({
    name,
    value,
    onRowClick,
    onChange,
    ...props
}: InventorySearchProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [options, setOptions] = useState<Inventory[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    const handleInventoryInputChange = (searchValue: string): void => {
        const params: QueryParams = {
            qry: `${searchValue}.${FIELD}`,
        };
        user &&
            getInventoryList(user.useruid, params).then((response) => {
                if (response instanceof Array && response?.length) {
                    setOptions(response);
                } else {
                    setOptions([]);
                }
            });
    };

    const handleOnRowClick = (inventoryName: string) => {
        onRowClick && onRowClick(inventoryName);
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
                onInputChange={handleInventoryInputChange}
                value={value}
                onChange={onChange}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                {...props}
            />
            <Dialog
                header={<div className='uppercase'>Choose an Inventory</div>}
                visible={dialogVisible}
                style={{ width: "75vw" }}
                maximizable
                modal
                onHide={() => setDialogVisible(false)}
            >
                <Inventories onRowClick={handleOnRowClick} />
            </Dialog>
        </>
    );
};
