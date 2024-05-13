import { observer } from "mobx-react-lite";
import { ReactElement, useState } from "react";
import "./index.css";
import { BorderedCheckbox, DashboardRadio, DateInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { useStore } from "store/hooks";

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
    const store = useStore().dealStore;
    const {
        dealExtData: {
            Transferred_Plate_Number,
            Transferred_Expiration_Date,
            Exchanged_Plate_Number,
            Replaced_Plate_Number,
            TempTagDate,
            TempTagNumber,
            Class_of_License,
            Plate_Issued,
        },
        changeDealExtData,
    } = store;
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
                    <InputText
                        className='deal-odometer__text-input w-full'
                        value={Class_of_License}
                        onChange={({ target: { value } }) =>
                            changeDealExtData({ key: "Class_of_License", value })
                        }
                    />
                    <label className='float-label'>Class of License</label>
                </span>
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    checked={!!Plate_Issued}
                    onChange={() =>
                        changeDealExtData({ key: "Plate_Issued", value: !Plate_Issued ? 1 : 0 })
                    }
                    name='Were Plates Issued?'
                />
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
                                value={plateSelected !== "0" ? "" : Transferred_Plate_Number}
                                onChange={({ target: { value } }) =>
                                    changeDealExtData({ key: "Transferred_Plate_Number", value })
                                }
                            />
                            <label className='float-label'>Plate#</label>
                        </span>
                    </div>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <InputText
                                className='deal-odometer__text-input w-full'
                                disabled={plateSelected !== "1"}
                                value={plateSelected !== "1" ? "" : Exchanged_Plate_Number}
                                onChange={({ target: { value } }) =>
                                    changeDealExtData({ key: "Exchanged_Plate_Number", value })
                                }
                            />
                            <label className='float-label'>Plate#</label>
                        </span>
                    </div>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <InputText
                                className='deal-odometer__text-input w-full'
                                disabled={plateSelected !== "2"}
                                value={plateSelected !== "2" ? "" : Replaced_Plate_Number}
                                onChange={({ target: { value } }) =>
                                    changeDealExtData({ key: "Replaced_Plate_Number", value })
                                }
                            />
                            <label className='float-label'>Plate#</label>
                        </span>
                    </div>
                </div>
            </div>
            <div className='col-3'>
                <DateInput
                    name='Expiration Date'
                    date={Number(Transferred_Expiration_Date)}
                    onChange={({ value }) =>
                        changeDealExtData({
                            key: "Transferred_Expiration_Date",
                            value: Number(value),
                        })
                    }
                />
            </div>

            <hr className='col-12 form-line' />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='deal-odometer__text-input w-full'
                        value={TempTagNumber}
                        onChange={({ target: { value } }) =>
                            changeDealExtData({ key: "TempTagNumber", value })
                        }
                    />
                    <label className='float-label'>Temp Marker Number</label>
                </span>
            </div>
            <div className='col-3'>
                <DateInput
                    name='Date'
                    date={TempTagDate}
                    onChange={({ value }) =>
                        changeDealExtData({ key: "TempTagDate", value: Number(value) })
                    }
                />
            </div>
        </div>
    );
});
