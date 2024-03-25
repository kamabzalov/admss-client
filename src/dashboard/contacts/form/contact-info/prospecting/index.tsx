import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";

export const ContactsProspecting = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contactExtData, changeContactExtData } = store;
    const [salesperson, setSalesperson] = useState<string>("");
    const [salespersonsList, setSalespersonsList] = useState<unknown[]>([]);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            getContactsSalesmanList(authUser.useruid).then((response) => {
                response && setSalespersonsList(response);
            });
        }
    }, []);

    return (
        <div className='grid contacts-prospecting row-gap-2'>
            <div className='col-6'>
                <Dropdown
                    optionLabel='username'
                    optionValue='useruid'
                    filter
                    //TODO: missing init value
                    value={salesperson}
                    options={salespersonsList}
                    onChange={({ target: { value } }) => setSalesperson(value)}
                    placeholder='Attending Salesman'
                    className='w-full contacts-prospecting__dropdown'
                />
            </div>

            <div className='col-6'>
                <DateInput
                    placeholder='Contact till...'
                    //TODO: missing value
                    className='contacts-prospecting__date-input w-full'
                />
            </div>

            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    //TODO: missing value
                    placeholder='Choose a Vehicle'
                    className='w-full contacts-prospecting__dropdown'
                />
            </div>
            <div className='col-6'>
                <Button className='w-full'>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another Vehicle
                </Button>
            </div>

            <div className='col-12'>
                <InputTextarea
                    placeholder='Prospecting Notes'
                    value={contactExtData?.Notes}
                    onChange={({ target: { value } }) => changeContactExtData("Notes", value)}
                    className='w-full contacts-prospecting__text-area'
                />
            </div>
            <div className='col-12 flex justify-content-end '>
                <Button className='px-4'>Schedule Call Back</Button>
            </div>
        </div>
    );
});
