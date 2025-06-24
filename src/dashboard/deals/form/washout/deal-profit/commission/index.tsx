import { ComboBox } from "dashboard/common/form/dropdown";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import { DealProfitItem, INCLUDE_OPTIONS } from "..";
import { Button } from "primereact/button";

const COMMISSION_2_OPTIONS = ["Figure After Commission", "Figure Before Commission"];

export const DealProfitCommission = () => {
    const [commission2Options, setCommission2Options] = useState<string>(COMMISSION_2_OPTIONS[0]);
    const [defaultCommission, setDefaultCommission] = useState<boolean>(false);
    const [managerOverride, setManagerOverride] = useState<boolean>(false);
    const [s1, setS1] = useState<boolean>(false);
    const [s2, setS2] = useState<boolean>(false);
    const [includeManagerOverride, setIncludeManagerOverride] = useState<INCLUDE_OPTIONS | null>(
        null
    );

    return (
        <Card className='profit-card profit-commission'>
            <div className='profit-card__header profit-commission__header'>
                <div className='profit-commission__header-title'>Commission Settings</div>
                <div className='profit-commission__header-subtitle'>Commission Worksheet</div>
            </div>
            <div className='profit-card__body profit-commission__body'>
                <div className='profit-commission__settings commission-settings'>
                    <div className='commission-settings__item'>
                        <div className='commission-settings__label'>Commission 2 Options:</div>
                        <ComboBox
                            options={COMMISSION_2_OPTIONS}
                            value={commission2Options}
                            onChange={({ value }) => {
                                setCommission2Options(value);
                            }}
                            className='commission-settings__input w-full'
                        />
                    </div>
                    <div className='commission-settings__checkbox mt-2'>
                        <Checkbox
                            inputId='set-default'
                            checked={defaultCommission}
                            onChange={({ checked }) => {
                                setDefaultCommission(!!checked);
                            }}
                        />
                        <label htmlFor='set-default'>Set this as the Default</label>
                    </div>
                </div>
                <div className='profit-commission__worksheet commission-worksheet'>
                    <DealProfitItem
                        title='Commission Base:'
                        className='deal-profit__item--blue'
                        value={0}
                        currency='$'
                        justify='start'
                        fieldName='commissionBase'
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        title='Manager Override:'
                        value={0}
                        withInput
                        justify='start'
                        includes
                        includeCheckbox={includeManagerOverride}
                        includeCheckboxOnChange={setIncludeManagerOverride}
                        checkboxValue={managerOverride}
                        checkboxOnChange={setManagerOverride}
                        fieldName='managerOverride'
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        title='S1: (None Selected)'
                        value={0}
                        withInput
                        justify='start'
                        includes
                        checkboxValue={s1}
                        checkboxOnChange={setS1}
                        fieldName='s1'
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        title='S2: (None Selected)'
                        value={0}
                        withInput
                        justify='start'
                        includes
                        checkboxValue={s2}
                        checkboxOnChange={setS2}
                        fieldName='s2'
                        onChange={({ value }) => {}}
                    />

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        title='(=) Commission Profit:'
                        value={0}
                        currency='$'
                        justify='start'
                        className='deal-profit__item--blue'
                        fieldName='commissionProfit'
                        onChange={({ value }) => {}}
                    />
                </div>
                <Button
                    icon='pi pi-user-plus'
                    tooltip='Select Salesman'
                    className='profit-commission__salesman-button'
                />
            </div>
        </Card>
    );
};
