import { observer } from "mobx-react-lite";
import { ReactElement, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { TextInput } from "dashboard/common/form/inputs";
import { DateInput, PhoneInput, StateDropdown } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { useFormikContext } from "formik";
import { PartialDeal } from "dashboard/deals/form";
import { useLocation } from "react-router-dom";
import { ContactUser } from "common/models/contact";
import { ALL_FIELDS } from "common/constants/fields";
import { DealExtData } from "common/models/deals";
import "./index.css";
import { Splitter } from "dashboard/common/display";

type LessorNumber = 1 | 2;

type LessorFieldSuffix =
    | "Lien_Name"
    | "Lien_Address"
    | "Lien_State"
    | "Lien_City"
    | "Lien_Zip_Code"
    | "Lien_Phone_Num";

type AutoFilledField =
    | "Lien_Address"
    | "Lien_State"
    | "Lien_City"
    | "Lien_Zip_Code"
    | "Lien_Phone_Num";

const getLessorField = (lessorNumber: LessorNumber, suffix: LessorFieldSuffix): keyof DealExtData =>
    `${lessorNumber === 1 ? "First" : "Second"}_${suffix}` as keyof DealExtData;

interface LessorFieldsProps {
    lessorNumber: LessorNumber;
}

const LessorFields = observer(({ lessorNumber }: LessorFieldsProps): ReactElement => {
    const store = useStore().dealStore;
    const { pathname, search } = useLocation();
    const currentPath = pathname + search;
    const { setFieldValue } = useFormikContext<PartialDeal>();
    const { changeDealExtData, dealExtData } = store;

    const nameField = getLessorField(lessorNumber, "Lien_Name");
    const addressField = getLessorField(lessorNumber, "Lien_Address");
    const stateField = getLessorField(lessorNumber, "Lien_State");
    const cityField = getLessorField(lessorNumber, "Lien_City");
    const zipField = getLessorField(lessorNumber, "Lien_Zip_Code");
    const phoneField = getLessorField(lessorNumber, "Lien_Phone_Num");

    const autoFilledRef = useRef<Record<AutoFilledField, boolean>>({
        Lien_Address: false,
        Lien_State: false,
        Lien_City: false,
        Lien_Zip_Code: false,
        Lien_Phone_Num: false,
    });

    const clearAutoFilledFields = () => {
        const autoFilledFields: AutoFilledField[] = [
            "Lien_Address",
            "Lien_State",
            "Lien_City",
            "Lien_Zip_Code",
        ];

        autoFilledFields.forEach((suffix) => {
            if (autoFilledRef.current[suffix]) {
                changeDealExtData({ key: getLessorField(lessorNumber, suffix), value: "" });
                autoFilledRef.current[suffix] = false;
            }
        });

        if (autoFilledRef.current.Lien_Phone_Num) {
            setFieldValue(phoneField, "");
            changeDealExtData({ key: phoneField, value: "" });
            autoFilledRef.current.Lien_Phone_Num = false;
        }
    };

    const handleLessorSelect = (contact: ContactUser) => {
        const name =
            contact.companyName ||
            contact.businessName ||
            `${contact.firstName} ${contact.lastName}`.trim();
        changeDealExtData({ key: nameField, value: name });

        const contactFieldMap = [
            { suffix: "Lien_Address" as const, value: contact.streetAddress },
            { suffix: "Lien_State" as const, value: contact.state },
            { suffix: "Lien_City" as const, value: contact.city },
            { suffix: "Lien_Zip_Code" as const, value: contact.ZIP },
        ];

        contactFieldMap.forEach(({ suffix, value }) => {
            if (value) {
                changeDealExtData({ key: getLessorField(lessorNumber, suffix), value });
                autoFilledRef.current[suffix] = true;
            }
        });

        if (contact.phone1) {
            setFieldValue(phoneField, contact.phone1.replace(/[^0-9]/g, ""));
            changeDealExtData({ key: phoneField, value: contact.phone1 });
            autoFilledRef.current.Lien_Phone_Num = true;
        }
    };

    return (
        <div className='grid deal-retail-liens row-gap-2'>
            <div className='col-6'>
                <CompanySearch
                    name={`Lessor ${lessorNumber}`}
                    value={dealExtData[nameField]?.toString() || ""}
                    returnedField={ALL_FIELDS}
                    getFullInfo={handleLessorSelect}
                    onChange={({ target: { value } }) => {
                        changeDealExtData({ key: nameField, value });
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
                value={dealExtData[phoneField]?.toString() || ""}
                onChange={({ target: { value } }) => {
                    autoFilledRef.current.Lien_Phone_Num = false;
                    setFieldValue(phoneField, value.replace(/[^0-9]/g, ""));
                    changeDealExtData({ key: phoneField, value });
                }}
                withValidationMessage
            />

            <Splitter className='px-2 py-3 w-full' />

            <div className='col-6'>
                <TextInput
                    name={addressField}
                    label='Address'
                    className='deal-liens__text-input w-full'
                    value={dealExtData[addressField]?.toString() || ""}
                    onChange={({ target: { value } }) => {
                        autoFilledRef.current.Lien_Address = false;
                        changeDealExtData({ key: addressField, value });
                    }}
                />
            </div>
            <StateDropdown
                colWidth={3}
                value={dealExtData[stateField]?.toString() || ""}
                name='State'
                onChange={({ target: { value } }) => {
                    autoFilledRef.current.Lien_State = false;
                    changeDealExtData({ key: stateField, value });
                }}
                className='w-full deal-liens__dropdown'
            />
            <div className='col-3'>
                <TextInput
                    name={cityField}
                    label='City'
                    value={dealExtData[cityField]?.toString() || ""}
                    onChange={({ target: { value } }) => {
                        autoFilledRef.current.Lien_City = false;
                        changeDealExtData({ key: cityField, value });
                    }}
                    className='w-full deal-liens__text'
                />
            </div>
            <div className='col-3'>
                <TextInput
                    name={zipField}
                    label='Zip Code'
                    value={dealExtData[zipField]?.toString() || ""}
                    onChange={({ target: { value } }) => {
                        autoFilledRef.current.Lien_Zip_Code = false;
                        changeDealExtData({ key: zipField, value });
                    }}
                    className='deal-liens__text-input w-full'
                />
            </div>
        </div>
    );
});

export const DealRetailLiens = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        changeDealExtData,
        dealExtData: { First_Lien_Date, First_Lien_Acct_Num, First_Lien_Lienholder_ID },
    } = store;

    return (
        <div className='deal-retail-liens'>
            <TabView className='deal-retail-liens__tabs'>
                <TabPanel
                    header='Lessor 1'
                    headerClassName='card-header deal-retail-liens__header uppercase m-0 heading-condensed'
                >
                    <LessorFields lessorNumber={1} />
                </TabPanel>
                <TabPanel
                    header='Lessor 2'
                    headerClassName='card-header deal-retail-liens__header uppercase m-0 heading-condensed'
                >
                    <LessorFields lessorNumber={2} />
                </TabPanel>
            </TabView>

            <div className='grid deal-retail-liens__shared-fields row-gap-2'>
                <Splitter className='px-2 py-3  w-full' />
                <div className='col-3'>
                    <DateInput
                        name='Date of Lien'
                        emptyDate
                        date={First_Lien_Date}
                        onChange={({ value }) =>
                            value &&
                            changeDealExtData({ key: "First_Lien_Date", value: Number(value) })
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
        </div>
    );
});
