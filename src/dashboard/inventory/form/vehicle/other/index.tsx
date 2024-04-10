import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import {
    ListData,
    getInventoryCategoryList,
    getInventoryGroupList,
    getInventoryLocations,
} from "http/services/inventory-service";
import { observer } from "mobx-react-lite";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { InventoryLocations } from "common/models/inventory";

export const VehicleOther = observer((): ReactElement => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const store = useStore().inventoryStore;
    const { inventory, changeInventory } = store;
    const [groupClassList, setGroupClassList] = useState<ListData[]>([]);
    const [categoryList, setCategoryList] = useState<ListData[]>([]);
    const [locationList, setLocationList] = useState<InventoryLocations[]>([]);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
        getInventoryGroupList().then((list) => {
            list && setGroupClassList(list);
        });
        getInventoryCategoryList().then((list) => {
            list && setCategoryList(list);
        });
    }, []);

    useEffect(() => {
        if (user) {
            getInventoryLocations(user.useruid).then((list) => {
                list && setLocationList(list);
            });
        }
    }, [user]);

    return (
        <div className='grid vehicle-other row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='locName'
                        optionValue='locationuid'
                        filter
                        options={locationList}
                        placeholder='Location name'
                        className='w-full vehicle-other__dropdown'
                    />

                    <label className='float-label'>Location name</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        options={groupClassList}
                        value={inventory?.GroupClass}
                        onChange={({ value }) => changeInventory({ key: "GroupClass", value })}
                        placeholder='Group class'
                        className='w-full vehicle-other__dropdown'
                    />
                    <label className='float-label'>Group class</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        options={categoryList}
                        value={inventory?.Category}
                        onChange={({ value }) => changeInventory({ key: "Category", value })}
                        placeholder='Category'
                        className='w-full vehicle-other__dropdown'
                    />
                    <label className='float-label'>Category</label>
                </span>
            </div>

            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        value={inventory?.Notes}
                        onChange={({ target: { value } }) =>
                            changeInventory({ key: "Notes", value })
                        }
                        className='w-full vehicle-other__text-area'
                    />
                    <label className='float-label'>Notes</label>
                </span>
            </div>
        </div>
    );
});
