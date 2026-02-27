import { ReactElement, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Splitter } from "dashboard/common/display";
import {
    CURRENCY_SELECT_OPTIONS,
    NumberInput,
    StateDropdown,
    TextInput,
} from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { CREATE_ID } from "common/constants/links";

export const AdditionalInformation = observer((): ReactElement => {
    const { id } = useParams();
    const usersStore = useStore().usersStore;
    const { user, changeUserData, salespersonInfo, changeSalespersonInfo, getSalespersonInfo } =
        usersStore;

    useEffect(() => {
        if (id && id !== CREATE_ID) {
            getSalespersonInfo(id);
        }
    }, [id]);

    return (
        <div className='additional-information'>
            <Splitter title='Address' className='my-5' />
            <div className='grid row-gap-2'>
                <div className='col-6'>
                    <TextInput
                        className='w-full'
                        name='Street Address'
                        value={user?.streetAddress || ""}
                        onChange={(e) => changeUserData("streetAddress", e.target.value)}
                    />
                </div>
                <div className='col-3'>
                    <StateDropdown
                        className='w-full'
                        name='State'
                        value={user?.state || ""}
                        onChange={(e) => changeUserData("state", e.value)}
                    />
                </div>
                <div className='col-3'>
                    <TextInput
                        className='w-full'
                        name='City'
                        value={user?.city || ""}
                        onChange={(e) => changeUserData("city", e.target.value)}
                    />
                </div>
                <div className='col-3'>
                    <TextInput
                        className='w-full'
                        name='Zip Code'
                        value={user?.ZIP || ""}
                        onChange={(e) => changeUserData("ZIP", e.target.value)}
                    />
                </div>
            </div>
            <Splitter title='License' className='my-5' />
            <div className='grid'>
                <div className='col-6'>
                    <TextInput
                        className='w-full'
                        name='License Number'
                        value={user?.salespersonLicense || ""}
                        onChange={(e) => changeUserData("salespersonLicense", e.target.value)}
                    />
                </div>
            </div>
            <Splitter title='Commission' className='my-5' />
            <div className='grid'>
                <div className='col-3'>
                    <div className='flex align-items-center justify-content-between commission-rate relative text-input'>
                        <label className='commission-rate__label label-top'>Commission</label>
                        <div className='commission-rate__input flex justify-content-center'>
                            <Button
                                type='button'
                                icon='icon adms-percentage'
                                severity={
                                    (salespersonInfo?.CommissionType ??
                                        CURRENCY_SELECT_OPTIONS[0].value) ===
                                    CURRENCY_SELECT_OPTIONS[1].value
                                        ? "success"
                                        : "secondary"
                                }
                                onClick={() =>
                                    changeSalespersonInfo(
                                        "CommissionType",
                                        CURRENCY_SELECT_OPTIONS[1].value
                                    )
                                }
                                className='commission-rate__button commission-rate__button-percent'
                            />
                            <Button
                                type='button'
                                icon='icon adms-dollar-sign'
                                severity={
                                    (salespersonInfo?.CommissionType ??
                                        CURRENCY_SELECT_OPTIONS[0].value) ===
                                    CURRENCY_SELECT_OPTIONS[0].value
                                        ? "success"
                                        : "secondary"
                                }
                                onClick={() =>
                                    changeSalespersonInfo(
                                        "CommissionType",
                                        CURRENCY_SELECT_OPTIONS[0].value
                                    )
                                }
                                className='commission-rate__button commission-rate__button-currency'
                            />
                            <NumberInput
                                name='Commission'
                                label=''
                                minFractionDigits={2}
                                maxFractionDigits={2}
                                min={0}
                                locale='en-US'
                                value={salespersonInfo?.Commission ?? 0}
                                onChange={(e) => changeSalespersonInfo("Commission", e.value ?? 0)}
                                className='w-full'
                                wrapperClassName='flex-1'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
