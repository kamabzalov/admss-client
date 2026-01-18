import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { AutoComplete } from "primereact/autocomplete";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";
import { Checkbox } from "primereact/checkbox";
import { BUYER_ID, GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";
import { ComboBox } from "dashboard/common/form/dropdown";
import { StateDropdown } from "dashboard/common/form/inputs";
import { useGooglePlacesAutocomplete, AddressSuggestion } from "common/hooks";

const { BUYER, CO_BUYER } = GENERAL_CONTACT_TYPE;

const MIN_AUTOCOMPLETE_LENGTH = 3;
const AUTOCOMPLETE_DELAY_MS = 300;
const DROPDOWN_SHOW_DELAY_MS = 100;
const ZIP_CODE_LENGTH = 5;

interface ContactsAddressInfoProps {
    type?: typeof BUYER | typeof CO_BUYER;
}

export const ContactsAddressInfo = observer(({ type }: ContactsAddressInfoProps): ReactElement => {
    const store = useStore().contactStore;
    const { contact, changeContact, contactExtData, changeContactExtData } = store;
    const [isSameAsMailing, setIsSameAsMailing] = useState<boolean>(false);

    const primaryAddressAutocomplete = useGooglePlacesAutocomplete();
    const mailingAddressAutocomplete = useGooglePlacesAutocomplete();

    const primaryAutoCompleteRef = useRef<AutoComplete>(null);
    const mailingAutoCompleteRef = useRef<AutoComplete>(null);

    useEffect(() => {
        if (primaryAddressAutocomplete.isReady) {
        }
    }, [primaryAddressAutocomplete.isReady]);

    const handlePrimaryAddressSelect = async (selected: AddressSuggestion | string) => {
        if (typeof selected === "string") {
            if (type === BUYER) {
                changeContact("streetAddress", selected);
            } else {
                changeContactExtData("CoBuyer_Res_Address", selected);
            }
            return;
        }

        const addressDetails = await primaryAddressAutocomplete.getPlaceDetails(selected.placeId);
        if (addressDetails) {
            if (type === BUYER) {
                changeContact("streetAddress", addressDetails.streetAddress);
                if (addressDetails.city) changeContact("city", addressDetails.city);
                if (addressDetails.state) changeContact("state", addressDetails.state);
                if (addressDetails.zipCode) changeContact("ZIP", addressDetails.zipCode);
            } else {
                changeContactExtData("CoBuyer_Res_Address", addressDetails.streetAddress);
                if (addressDetails.city) changeContactExtData("CoBuyer_City", addressDetails.city);
                if (addressDetails.state)
                    changeContactExtData("CoBuyer_State", addressDetails.state);
                if (addressDetails.zipCode)
                    changeContactExtData("CoBuyer_Zip_Code", addressDetails.zipCode);
            }
        }
    };

    const handleMailingAddressSelect = async (selected: AddressSuggestion | string) => {
        if (typeof selected === "string") {
            if (type === BUYER) {
                changeContact("mailStreetAddress", selected);
            } else {
                changeContactExtData("CoBuyer_Mailing_Address", selected);
            }
            return;
        }

        const addressDetails = await mailingAddressAutocomplete.getPlaceDetails(selected.placeId);
        if (addressDetails) {
            if (type === BUYER) {
                changeContact("mailStreetAddress", addressDetails.streetAddress);
                if (addressDetails.city) changeContact("mailCity", addressDetails.city);
                if (addressDetails.state) changeContact("mailState", addressDetails.state);
                if (addressDetails.zipCode) changeContact("mailZIP", addressDetails.zipCode);
            } else {
                changeContactExtData("CoBuyer_Mailing_Address", addressDetails.streetAddress);
                if (addressDetails.city)
                    changeContactExtData("CoBuyer_Mailing_City", addressDetails.city);
                if (addressDetails.state)
                    changeContactExtData("CoBuyer_Mailing_State", addressDetails.state);
                if (addressDetails.zipCode)
                    changeContactExtData("CoBuyer_Mailing_Zip", addressDetails.zipCode);
            }
        }
    };

    const fetchAddressByZipCode = async (
        zipCode: string
    ): Promise<{ city: string; state: string } | null> => {
        if (!zipCode || zipCode.length < ZIP_CODE_LENGTH) {
            return null;
        }

        return new Promise((resolve) => {
            if (typeof window === "undefined" || !window.google || !window.google.maps) {
                resolve(null);
                return;
            }

            const geocoder = new google.maps.Geocoder();

            geocoder.geocode(
                {
                    address: zipCode,
                    componentRestrictions: { country: "US" },
                },
                (results, status) => {
                    if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
                        let city = "";
                        let state = "";

                        results[0].address_components?.forEach((component) => {
                            const types = component.types;
                            if (types.includes("locality")) {
                                city = component.long_name;
                            }
                            if (types.includes("administrative_area_level_1")) {
                                state = component.short_name;
                            }
                        });

                        if (city && state) {
                            resolve({ city, state });
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    };

    const handlePrimaryZipCodeChange = async (value: string) => {
        if (type === BUYER) {
            changeContact("ZIP", value);
        } else {
            changeContactExtData("CoBuyer_Zip_Code", value);
        }

        if (value.length === ZIP_CODE_LENGTH) {
            const addressData = await fetchAddressByZipCode(value);
            if (addressData) {
                if (type === BUYER) {
                    if (addressData.city) changeContact("city", addressData.city);
                    if (addressData.state) changeContact("state", addressData.state);
                } else {
                    if (addressData.city) changeContactExtData("CoBuyer_City", addressData.city);
                    if (addressData.state) changeContactExtData("CoBuyer_State", addressData.state);
                }
            }
        }
    };

    const handleMailingZipCodeChange = async (value: string) => {
        if (type === BUYER) {
            changeContact("mailZIP", value);
        } else {
            changeContactExtData("CoBuyer_Mailing_Zip", value);
        }

        if (value.length === ZIP_CODE_LENGTH) {
            const addressData = await fetchAddressByZipCode(value);
            if (addressData) {
                if (type === BUYER) {
                    if (addressData.city) changeContact("mailCity", addressData.city);
                    if (addressData.state) changeContact("mailState", addressData.state);
                } else {
                    if (addressData.city)
                        changeContactExtData("CoBuyer_Mailing_City", addressData.city);
                    if (addressData.state)
                        changeContactExtData("CoBuyer_Mailing_State", addressData.state);
                }
            }
        }
    };

    useEffect(() => {
        if (isSameAsMailing) {
            if (type === BUYER) {
                changeContact("mailStreetAddress", contact.streetAddress);
                changeContact("mailState", contact.state);
                changeContact("mailCity", contact.city);
                changeContact("mailZIP", contact.ZIP);
            } else {
                changeContactExtData("CoBuyer_Mailing_Address", contactExtData.CoBuyer_Res_Address);
                changeContactExtData("CoBuyer_Mailing_State", contactExtData.CoBuyer_State);
                changeContactExtData("CoBuyer_Mailing_City", contactExtData.CoBuyer_City);
                changeContactExtData("CoBuyer_Mailing_Zip", contactExtData.CoBuyer_Zip_Code);
            }
        }
    }, [
        isSameAsMailing,
        contact.streetAddress,
        contact.state,
        contact.city,
        contact.ZIP,
        contactExtData.CoBuyer_Res_Address,
        contactExtData.CoBuyer_State,
        contactExtData.CoBuyer_City,
        contactExtData.CoBuyer_Zip_Code,
        type,
        changeContact,
        changeContactExtData,
    ]);

    const isControlDisabled = useMemo(
        () => type === CO_BUYER && contact.type !== BUYER_ID,
        [type, contact.type]
    );

    return (
        <div className='grid address-info row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <AutoComplete
                        ref={primaryAutoCompleteRef}
                        className='address-info__text-input w-full'
                        value={
                            (type === BUYER
                                ? contact.streetAddress
                                : contactExtData.CoBuyer_Res_Address) || ""
                        }
                        suggestions={primaryAddressAutocomplete.suggestions}
                        completeMethod={(e) => {
                            primaryAddressAutocomplete.completeMethod(e);
                        }}
                        onChange={({ value }) => {
                            const stringValue =
                                typeof value === "string"
                                    ? value
                                    : (value as AddressSuggestion)?.description || "";
                            if (type === BUYER) {
                                changeContact("streetAddress", stringValue);
                            } else {
                                changeContactExtData("CoBuyer_Res_Address", stringValue);
                            }
                            if (stringValue.length >= MIN_AUTOCOMPLETE_LENGTH) {
                                primaryAddressAutocomplete.completeMethod({ query: stringValue });
                            }
                        }}
                        onSelect={(e) => {
                            const selected = e.value;
                            if (selected && typeof selected === "object" && "placeId" in selected) {
                                handlePrimaryAddressSelect(selected as AddressSuggestion);
                            }
                        }}
                        onDropdownClick={(e) => {
                            const currentValue =
                                type === BUYER
                                    ? contact.streetAddress
                                    : contactExtData.CoBuyer_Res_Address;
                            if (currentValue && currentValue.length >= MIN_AUTOCOMPLETE_LENGTH) {
                                primaryAddressAutocomplete.completeMethod({ query: currentValue });
                                setTimeout(() => {
                                    if (primaryAutoCompleteRef.current) {
                                        (primaryAutoCompleteRef.current as any).show();
                                    }
                                }, DROPDOWN_SHOW_DELAY_MS);
                            }
                        }}
                        itemTemplate={(suggestion: AddressSuggestion) => suggestion.description}
                        selectedItemTemplate={(suggestion: AddressSuggestion) =>
                            suggestion.description
                        }
                        disabled={isControlDisabled}
                        dropdown
                        forceSelection={false}
                        minLength={MIN_AUTOCOMPLETE_LENGTH}
                        delay={AUTOCOMPLETE_DELAY_MS}
                    />
                    <label className='float-label'>Street Address</label>
                </span>
            </div>

            <StateDropdown
                name='State'
                showClear={!!(type === BUYER ? contact.state : contactExtData.CoBuyer_State)}
                className='w-full address-info__dropdown'
                disabled={isControlDisabled}
                value={type === BUYER ? contact.state : contactExtData.CoBuyer_State}
                colWidth={3}
                onChange={({ value }) =>
                    type === BUYER
                        ? changeContact("state", value)
                        : changeContactExtData("CoBuyer_State", value)
                }
            />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='address-info__text-input w-full'
                        value={(type === BUYER ? contact.city : contactExtData.CoBuyer_City) || ""}
                        onChange={({ target: { value } }) =>
                            type === BUYER
                                ? changeContact("city", value)
                                : changeContactExtData("CoBuyer_City", value)
                        }
                        disabled={isControlDisabled}
                    />
                    <label className='float-label'>City</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='address-info__text-input w-full'
                        value={
                            (type === BUYER ? contact.ZIP : contactExtData.CoBuyer_Zip_Code) || ""
                        }
                        onChange={({ target: { value } }) => handlePrimaryZipCodeChange(value)}
                        disabled={isControlDisabled}
                    />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>
            <div className='col-12 grid'>
                <div className='col-9 text-line'>
                    <h3 className='text-line__title m-0 pr-3'>Mailing address</h3>
                    <hr className='text-line__line flex-1' />
                </div>
                <div className='col-3'>
                    <div className='flex px-2'>
                        <Checkbox
                            inputId='contact-same-address'
                            className='mt-1'
                            name='contact-same-address'
                            checked={isSameAsMailing}
                            onChange={() => setIsSameAsMailing(!isSameAsMailing)}
                            disabled={isControlDisabled}
                        />
                        <label htmlFor='contact-same-address' className='ml-2'>
                            Same as primary address
                        </label>
                    </div>
                </div>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <AutoComplete
                        ref={mailingAutoCompleteRef}
                        className='mailing-address-info__text-input w-full'
                        value={
                            (type === BUYER
                                ? contact.mailStreetAddress
                                : contactExtData.CoBuyer_Mailing_Address) || ""
                        }
                        suggestions={mailingAddressAutocomplete.suggestions}
                        completeMethod={mailingAddressAutocomplete.completeMethod}
                        onChange={({ value }) => {
                            const stringValue =
                                typeof value === "string"
                                    ? value
                                    : (value as AddressSuggestion)?.description || "";
                            if (type === BUYER) {
                                changeContact("mailStreetAddress", stringValue);
                            } else {
                                changeContactExtData("CoBuyer_Mailing_Address", stringValue);
                            }
                            if (stringValue.length >= MIN_AUTOCOMPLETE_LENGTH) {
                                mailingAddressAutocomplete.completeMethod({ query: stringValue });
                            }
                        }}
                        onSelect={(e) => {
                            const selected = e.value;
                            if (selected && typeof selected === "object" && "placeId" in selected) {
                                handleMailingAddressSelect(selected as AddressSuggestion);
                            }
                        }}
                        onDropdownClick={(e) => {
                            const currentValue =
                                type === BUYER
                                    ? contact.mailStreetAddress
                                    : contactExtData.CoBuyer_Mailing_Address;
                            if (currentValue && currentValue.length >= MIN_AUTOCOMPLETE_LENGTH) {
                                mailingAddressAutocomplete.completeMethod({ query: currentValue });
                                setTimeout(() => {
                                    if (mailingAutoCompleteRef.current) {
                                        (mailingAutoCompleteRef.current as any).show();
                                    }
                                }, DROPDOWN_SHOW_DELAY_MS);
                            }
                        }}
                        itemTemplate={(suggestion: AddressSuggestion) => suggestion.description}
                        selectedItemTemplate={(suggestion: AddressSuggestion) =>
                            suggestion.description
                        }
                        disabled={isSameAsMailing || isControlDisabled}
                        dropdown
                        forceSelection={false}
                        minLength={MIN_AUTOCOMPLETE_LENGTH}
                        delay={AUTOCOMPLETE_DELAY_MS}
                    />
                    <label className='float-label'>Street address</label>
                </span>
            </div>
            <div className='col-3'>
                <ComboBox
                    optionLabel='label'
                    optionValue='id'
                    placeholder='State'
                    value={
                        (type === BUYER
                            ? contact.mailState
                            : contactExtData.CoBuyer_Mailing_State) || ""
                    }
                    onChange={({ target: { value } }) =>
                        type === BUYER
                            ? changeContact("mailState", value)
                            : changeContactExtData("CoBuyer_Mailing_State", value)
                    }
                    options={STATES_LIST}
                    className='w-full mailing-address-info__dropdown'
                    disabled={isSameAsMailing || isControlDisabled}
                    showClear={
                        !!(type === BUYER
                            ? contact.mailState
                            : contactExtData.CoBuyer_Mailing_State)
                    }
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='mailing-address-info__text-input w-full'
                        value={
                            (type === BUYER
                                ? contact.mailCity
                                : contactExtData.CoBuyer_Mailing_City) || ""
                        }
                        onChange={({ target: { value } }) =>
                            type === BUYER
                                ? changeContact("mailCity", value)
                                : changeContactExtData("CoBuyer_Mailing_City", value)
                        }
                        disabled={isSameAsMailing || isControlDisabled}
                    />
                    <label className='float-label'>City</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='mailing-address-info__text-input w-full'
                        value={
                            (type === BUYER
                                ? contact.mailZIP
                                : contactExtData.CoBuyer_Mailing_Zip) || ""
                        }
                        onChange={({ target: { value } }) => handleMailingZipCodeChange(value)}
                        disabled={isSameAsMailing || isControlDisabled}
                    />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>
        </div>
    );
});
