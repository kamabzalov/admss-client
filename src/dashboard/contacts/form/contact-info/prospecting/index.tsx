import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { ReactElement } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

export const ContactsProspecting = observer((): ReactElement => {
    return (
        <div className='grid contacts-prospecting row-gap-2'>
            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Attending Salesman'
                    className='w-full contacts-prospecting__dropdown'
                />
            </div>

            <div className='col-6'>
                <DateInput
                    placeholder='Contact till...'
                    className='contacts-prospecting__date-input w-full'
                />
            </div>

            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Choose a Vehicle'
                    className='w-full contacts-prospecting__dropdown'
                />
            </div>
            <div className='col-6'>
                <Button className='w-full'>
                    <i className='icon adms-add-item-round mr-2' />
                    Add another Vehicle
                </Button>
            </div>

            <div className='col-12'>
                <InputTextarea
                    placeholder='Prospecting Notes'
                    className='w-full contacts-prospecting__text-area'
                />
            </div>
            <div className='col-12'>
                <Button className='px-4'>Schedule Call Back</Button>
            </div>
        </div>
    );
});
