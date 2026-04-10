import { observer } from "mobx-react-lite";
import { ReactElement, useRef } from "react";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { TextInput } from "dashboard/common/form/inputs";
import { DateInput, PhoneInput, StateDropdown } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { useFormikContext } from "formik";
import { PartialDeal } from "dashboard/deals/form";
import { useLocation } from "react-router-dom";
import { ContactUser } from "common/models/contact";
import { ALL_FIELDS } from "common/constants/fields";

export const DealRetailLiens = observer((): ReactElement => {
    const store = useStore().dealStore;
    const { pathname, search } = useLocation();
    const currentPath = pathname + search;
    const { setFieldValue } = useFormikContext<PartialDeal>();
    const {
        changeDealExtData,
        dealExtData: {
            First_Lien_Name,
            First_Lien_Address,
            First_Lien_State,
            First_Lien_City,
            First_Lien_Zip_Code,
            First_Lien_Date,
            First_Lien_Acct_Num,
            First_Lien_Lienholder_ID,
            First_Lien_Phone_Num,
        },
    } = store;
    const autoFilledRef = useRef({
        First_Lien_Address: false,
        First_Lien_State: false,
        First_Lien_City: false,
        First_Lien_Zip_Code: false,
        First_Lien_Phone_Num: false,
    });

    const clearAutoFilledFields = () => {
        const autoFilledFields = [
            "First_Lien_Address",
            "First_Lien_State",
            "First_Lien_City",
            "First_Lien_Zip_Code",
        ] as const;

        autoFilledFields.forEach((key) => {
            if (autoFilledRef.current[key]) {
                changeDealExtData({ key, value: "" });
                autoFilledRef.current[key] = false;
            }
        });

        if (autoFilledRef.current.First_Lien_Phone_Num) {
            setFieldValue("First_Lien_Phone_Num", "");
            changeDealExtData({ key: "First_Lien_Phone_Num", value: "" });
            autoFilledRef.current.First_Lien_Phone_Num = false;
        }
    };

    const handleLessorSelect = (contact: ContactUser) => {
        const name =
            contact.companyName ||
            contact.businessName ||
            `${contact.firstName} ${contact.lastName}`.trim();
        changeDealExtData({ key: "First_Lien_Name", value: name });
        const contactFieldMap = [
            { key: "First_Lien_Address", value: contact.streetAddress },
            { key: "First_Lien_State", value: contact.state },
            { key: "First_Lien_City", value: contact.city },
            { key: "First_Lien_Zip_Code", value: contact.ZIP },
        ] as const;

        contactFieldMap.forEach(({ key, value }) => {
            if (value) {
                changeDealExtData({ key, value });
                autoFilledRef.current[key] = true;
            }
        });

        if (contact.phone1) {
            setFieldValue("First_Lien_Phone_Num", contact.phone1.replace(/[^0-9]/g, ""));
            changeDealExtData({ key: "First_Lien_Phone_Num", value: contact.phone1 });
            autoFilledRef.current.First_Lien_Phone_Num = true;
        }
    };

    return (
        <div className='grid deal-retail-liens row-gap-2'>
            <div className='col-6'>
                <CompanySearch
                    name='Lessor'
                    value={First_Lien_Name}
                    returnedField={ALL_FIELDS}
                    getFullInfo={handleLessorSelect}
                    onChange={({ target: { value } }) => {
                        changeDealExtData({ key: "First_Lien_Name", value });
                        if (!value?.trim()) {
                            clearAutoFilledFields();
                        }
                    }}
                    originalPath={currentPath}
                />
            </div>
            <PhoneInput
                colWidth={3}
                name='Phone Number'
                value={First_Lien_Phone_Num}
                onChange={({ target: { value } }) => {
                    autoFilledRef.current.First_Lien_Phone_Num = false;
                    setFieldValue("First_Lien_Phone_Num", value.replace(/[^0-9]/g, ""));
                    changeDealExtData({ key: "First_Lien_Phone_Num", value });
                }}
                withValidationMessage
            />

            <hr className='form-line' />

            <div className='col-6'>
                <TextInput
                    name='First_Lien_Address'
                    label='Address'
                    className='deal-liens__text-input w-full'
                    value={First_Lien_Address}
                    onChange={({ target: { value } }) => {
                        autoFilledRef.current.First_Lien_Address = false;
                        changeDealExtData({ key: "First_Lien_Address", value });
                    }}
                />
            </div>
            <StateDropdown
                colWidth={3}
                value={First_Lien_State}
                name='State'
                onChange={({ target: { value } }) => {
                    autoFilledRef.current.First_Lien_State = false;
                    changeDealExtData({ key: "First_Lien_State", value });
                }}
                className='w-full deal-liens__dropdown'
            />
            <div className='col-3'>
                <TextInput
                    name='First_Lien_City'
                    label='City'
                    value={First_Lien_City}
                    onChange={({ target: { value } }) => {
                        autoFilledRef.current.First_Lien_City = false;
                        changeDealExtData({ key: "First_Lien_City", value });
                    }}
                    className='w-full deal-liens__text'
                />
            </div>
            <div className='col-3'>
                <TextInput
                    name='First_Lien_Zip_Code'
                    label='Zip Code'
                    value={First_Lien_Zip_Code}
                    onChange={({ target: { value } }) => {
                        autoFilledRef.current.First_Lien_Zip_Code = false;
                        changeDealExtData({ key: "First_Lien_Zip_Code", value });
                    }}
                    className='deal-liens__text-input w-full'
                />
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <DateInput
                    name='Date of lien'
                    emptyDate
                    date={First_Lien_Date}
                    onChange={({ value }) =>
                        value && changeDealExtData({ key: "First_Lien_Date", value: Number(value) })
                    }
                />
            </div>
            <div className='col-3'>
                <TextInput
                    name='First_Lien_Acct_Num'
                    label='Account#'
                    value={First_Lien_Acct_Num}
                    onChange={({ target: { value } }) => {
                        changeDealExtData({ key: "First_Lien_Acct_Num", value });
                    }}
                    className='deal-liens__text-input w-full'
                />
            </div>
            <div className='col-3'>
                <TextInput
                    name='First_Lien_Lienholder_ID'
                    label='Lesser ID#'
                    value={First_Lien_Lienholder_ID}
                    onChange={({ target: { value } }) => {
                        changeDealExtData({ key: "First_Lien_Lienholder_ID", value });
                    }}
                    className='deal-liens__text-input w-full'
                />
            </div>
        </div>
    );
});
