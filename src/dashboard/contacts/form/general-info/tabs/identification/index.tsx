/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";

const SexList = [
    {
        name: "M",
    },
    {
        name: "F",
    },
];

const { BUYER, CO_BUYER } = GENERAL_CONTACT_TYPE;

interface ContactsIdentificationInfoProps {
    type?: typeof BUYER | typeof CO_BUYER;
}

export const ContactsIdentificationInfo = observer(
    ({ type }: ContactsIdentificationInfoProps): ReactElement => {
        const store = useStore().contactStore;
        const { contactExtData, changeContactExtData } = store;

        return (
            <div className='grid address-info row-gap-2'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown
                            optionLabel='label'
                            optionValue='id'
                            filter
                            value={
                                (type === BUYER
                                    ? contactExtData.Buyer_DL_State
                                    : contactExtData.CoBuyer_DL_State) || ""
                            }
                            options={STATES_LIST}
                            onChange={({ target: { value } }) =>
                                changeContactExtData(
                                    type === BUYER ? "Buyer_DL_State" : "CoBuyer_DL_State",
                                    value
                                )
                            }
                            className='w-full identification-info__dropdown'
                        />
                        <label className='float-label'>DL's State</label>
                    </span>
                </div>

                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputText
                            className='identification-info__text-input w-full'
                            value={
                                type === BUYER
                                    ? contactExtData.Buyer_Driver_License_Num
                                    : contactExtData.CoBuyer_Driver_License_Num
                            }
                            onChange={({ target: { value } }) => {
                                changeContactExtData(
                                    type === BUYER
                                        ? "Buyer_Driver_License_Num"
                                        : "CoBuyer_Driver_License_Num",
                                    value
                                );
                            }}
                        />
                        <label className='float-label'>Driver License's Number</label>
                    </span>
                </div>

                <div className='col-3 mr-2'>
                    <DateInput
                        name="DL's exp. date"
                        value={
                            (type === BUYER
                                ? contactExtData.Buyer_DL_Exp_Date
                                : contactExtData.CoBuyer_DL_Exp_Date) || ""
                        }
                        onChange={({ target: { value } }) =>
                            changeContactExtData(
                                type === BUYER ? "Buyer_DL_Exp_Date" : "CoBuyer_DL_Exp_Date",
                                Date.parse(String(value))
                            )
                        }
                        className='identification-info__date-input w-full'
                    />
                </div>

                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown
                            optionLabel='name'
                            optionValue='name'
                            filter
                            value={
                                (type === BUYER
                                    ? contactExtData.Buyer_Sex
                                    : contactExtData.CoBuyer_Sex) || ""
                            }
                            options={SexList}
                            onChange={({ target: { value } }) =>
                                changeContactExtData(
                                    type === BUYER ? "Buyer_Sex" : "CoBuyer_Sex",
                                    value
                                )
                            }
                            className='w-full identification-info__dropdown'
                        />
                        <label className='float-label'>Sex</label>
                    </span>
                </div>

                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputText
                            className='identification-info__text-input w-full'
                            value={
                                (type === BUYER
                                    ? contactExtData.Buyer_SS_Number
                                    : contactExtData.CoBuyer_SS_Number) || ""
                            }
                            onChange={({ target: { value } }) => {
                                changeContactExtData(
                                    type === BUYER ? "Buyer_SS_Number" : "CoBuyer_SS_Number",
                                    value
                                );
                            }}
                        />
                        <label className='float-label'>Social Security Number</label>
                    </span>
                </div>

                <div className='col-3'>
                    <DateInput
                        name='Date of Birth'
                        value={
                            (type === BUYER
                                ? contactExtData.Buyer_Date_Of_Birth
                                : contactExtData.CoBuyer_Date_Of_Birth) || ""
                        }
                        onChange={({ target: { value } }) =>
                            changeContactExtData(
                                type === BUYER ? "Buyer_Date_Of_Birth" : "CoBuyer_Date_Of_Birth",
                                Date.parse(String(value))
                            )
                        }
                        className='identification-info__date-input w-full'
                    />
                </div>
            </div>
        );
    }
);
