import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";
import { getContactsProspectList, getContactsSalesmanList } from "http/services/contacts-service";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { useParams } from "react-router-dom";

export const ContactsProspecting = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().contactStore;
    const { contactExtData, changeContactExtData } = store;
    const [salespersonsList, setSalespersonsList] = useState<unknown[]>([]);
    const [anotherVehicle, setAnotherVehicle] = useState<boolean>(false);
    const [prospectList, setProspectList] = useState<any>([]);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            getContactsSalesmanList(authUser.useruid).then((response) => {
                response && setSalespersonsList(response);
            });
            id &&
                getContactsProspectList(id).then((response) => {
                    setProspectList(response);
                });
        }
    }, [id]);

    useEffect(() => {
        setAnotherVehicle(!!contactExtData.PROSPECT2_ID?.length);
    }, [contactExtData.PROSPECT2_ID]);

    return (
        <div className='grid contacts-prospecting row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='username'
                        optionValue='useruid'
                        filter
                        value={contactExtData.SALESMAN_ID}
                        options={salespersonsList}
                        onChange={({ target: { value } }) =>
                            changeContactExtData("SALESMAN_ID", value)
                        }
                        placeholder='Attending Salesman'
                        className='w-full contacts-prospecting__dropdown'
                    />
                    <label className='float-label'>Attending Salesman</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <DateInput
                        placeholder='Contact till...'
                        date={contactExtData.created}
                        onChange={() => changeContactExtData("created", "")}
                        className='contacts-prospecting__date-input w-full'
                    />
                    <label className='float-label'>Contact till</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='notes'
                        optionValue='notes'
                        options={prospectList}
                        filter
                        editable
                        value={contactExtData.PROSPECT1_ID}
                        onChange={({ target: { value } }) => {
                            changeContactExtData("PROSPECT1_ID", value);
                        }}
                        placeholder='Choose a Vehicle'
                        className='w-full contacts-prospecting__dropdown'
                    />
                    <label className='float-label'>Choose a Vehicle</label>
                </span>
            </div>
            {anotherVehicle ? (
                <div className='col-6'>
                    <span className='p-float-label'>
                        <Dropdown
                            optionLabel='notes'
                            optionValue='notes'
                            options={prospectList}
                            filter
                            editable
                            value={contactExtData.PROSPECT2_ID}
                            onChange={({ target: { value } }) => {
                                changeContactExtData("PROSPECT2_ID", value);
                            }}
                            placeholder='Choose a Vehicle'
                            className='w-full contacts-prospecting__dropdown'
                        />
                        <label className='float-label'>Choose a Vehicle</label>
                    </span>
                </div>
            ) : (
                <div className='col-6'>
                    <Button
                        type='button'
                        className='contacts__button w-full'
                        outlined
                        onClick={() => setAnotherVehicle(true)}
                    >
                        <i className='pi pi-plus mr-2 text-xs pt-1' />
                        Add another Vehicle
                    </Button>
                </div>
            )}
            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        placeholder='Prospecting Notes'
                        value={contactExtData.Notes}
                        onChange={({ target: { value } }) => changeContactExtData("Notes", value)}
                        className='w-full contacts-prospecting__text-area'
                    />
                    <label className='float-label'>Prospecting Notes</label>
                </span>
            </div>
            <div className='col-12 flex justify-content-end '>
                <Button type='button' className='px-4 font-bold' outlined>
                    Schedule Call Back
                </Button>
            </div>
        </div>
    );
});

