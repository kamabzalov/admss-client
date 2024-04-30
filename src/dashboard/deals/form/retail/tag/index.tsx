import { observer } from "mobx-react-lite";
import { ReactElement, useState } from "react";
import "./index.css";
import { BorderedCheckbox, DashboardRadio, DateInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";

const tagTopRadio = [
    { name: "titleonly", title: "Title Only", value: "0" },
    { name: "newplates", title: "New Plates", value: "1" },
];

const tagBottomRadio = [
    { name: "transfer", title: "Plate transfered", value: "0" },
    { name: "exchanged", title: "Exchanged Plate", value: "1" },
    { name: "replaced", title: "Replaced Plate", value: "2" },
];

export const DealRetailTag = observer((): ReactElement => {
    const [plateSelected, setPlateSelected] = useState<string | number>("");
    return (
        <div className='grid deal-retail-tag row-gap-2'>
            <div className='col-6'>
                <DashboardRadio
                    radioArray={tagTopRadio}
                    style={{ width: `${95 / tagTopRadio.length}%` }}
                />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-odometer__text-input w-full' value={""} />
                    <label className='float-label'>Class of License</label>
                </span>
            </div>
            <div className='col-3'>
                <BorderedCheckbox checked={false} name='Were Plates Issued?' />
            </div>

            <hr className='col-12 form-line' />

            <div className='col-3'>
                <DashboardRadio
                    radioArray={tagBottomRadio}
                    style={{ width: `100%` }}
                    onChange={(e) => {
                        setPlateSelected(e);
                    }}
                />
            </div>
            <div className='col-3'>
                <div className='grid'>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <InputText
                                className='deal-odometer__text-input w-full'
                                disabled={plateSelected !== "0"}
                                value={""}
                            />
                            <label className='float-label'>Plate#</label>
                        </span>
                    </div>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <InputText
                                className='deal-odometer__text-input w-full'
                                disabled={plateSelected !== "1"}
                                value={""}
                            />
                            <label className='float-label'>Plate#</label>
                        </span>
                    </div>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <InputText
                                className='deal-odometer__text-input w-full'
                                disabled={plateSelected !== "2"}
                                value={""}
                            />
                            <label className='float-label'>Plate#</label>
                        </span>
                    </div>
                </div>
            </div>
            <div className='col-3'>
                <DateInput name='Expiration Date' />
            </div>

            <hr className='col-12 form-line' />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-odometer__text-input w-full' value={""} />
                    <label className='float-label'>Temp Marker Number</label>
                </span>
            </div>
            <div className='col-3'>
                <DateInput name='Date' />
            </div>
        </div>
    );
});
