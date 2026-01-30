import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { LS_APP_USER } from "common/constants/localStorage";
import { QueryParams } from "common/models/query-params";
import { AuthUser } from "common/models/user";
import { getInventoryList } from "http/services/inventory-service";
import { useState, useEffect } from "react";
import { getKeyValue } from "services/local-storage.service";
import { DropdownProps } from "primereact/dropdown";
import { Inventory } from "common/models/inventory";
import Inventories from "dashboard/inventory";
import { usePermissions } from "common/hooks";

const FIELD: keyof Inventory = "Make";

interface InventorySearchProps extends DropdownProps {
    onRowClick?: (inventoryName: string) => void;
    returnedField?: keyof Inventory;
    getFullInfo?: (inventory: Inventory) => void;
    originalPath?: string;
}

export const InventorySearch = ({
    name,
    value,
    onRowClick,
    onChange,
    returnedField,
    getFullInfo,
    originalPath,
    ...props
}: InventorySearchProps) => {
    const { inventoryPermissions } = usePermissions();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [options, setOptions] = useState<Inventory[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    const handleInventoryInputChange = (searchValue: string): void => {
        const qry = returnedField ? `${searchValue}.${returnedField}` : `${searchValue}.${FIELD}`;
        const params: QueryParams = {
            qry,
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
    const handleGetFullInfo = (inventory: Inventory) => {
        getFullInfo && getFullInfo(inventory);
        setDialogVisible(false);
    };

    const canSelectInventory = inventoryPermissions.canSelectInInputs();

    return (
        <>
            <SearchInput
                name={name}
                title={name}
                optionValue={returnedField || FIELD}
                optionLabel={returnedField || FIELD}
                options={options}
                onInputChange={handleInventoryInputChange}
                value={value}
                onChange={onChange}
                onIconClick={
                    canSelectInventory
                        ? () => {
                              setDialogVisible(true);
                          }
                        : undefined
                }
                disabled={!canSelectInventory}
                {...props}
            />
            {canSelectInventory && (
                <Dialog
                    header={<div className='uppercase'>Choose an Inventory</div>}
                    visible={dialogVisible}
                    style={{ width: "75vw" }}
                    maximizable
                    modal
                    onHide={() => setDialogVisible(false)}
                >
                    <Inventories
                        returnedField={returnedField}
                        getFullInfo={handleGetFullInfo}
                        onRowClick={handleOnRowClick}
                        originalPath={originalPath}
                    />
                </Dialog>
            )}
        </>
    );
};
