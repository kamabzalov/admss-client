import { Card } from "primereact/card";
import { DealProfitItem } from "..";
import { useState } from "react";

export const DealVehicleProfit = () => {
    const [includeOverallowanceFirst, setIncludeOverallowanceFirst] = useState<boolean>(false);
    const [includeOverallowanceSecond, setIncludeOverallowanceSecond] = useState<boolean>(false);
    const [includeVehicleProfitFirst, setIncludeVehicleProfitFirst] = useState<boolean>(false);
    const [includeVehicleProfitSecond, setIncludeVehicleProfitSecond] = useState<boolean>(false);

    return (
        <Card className='profit-card vehicle-profit'>
            <div className='profit-card__header vehicle-profit__header'>Vehicle Profit</div>
            <div className='profit-card__body vehicle-profit__body'>
                <div className='vehicle-profit__inputs'>
                    <DealProfitItem
                        title='Trade 1 Allowance:'
                        value={0}
                        withInput
                        fieldName='Trade1Allowance'
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        title='Trade 1 ACV:'
                        value={0}
                        withInput
                        fieldName='Trade1ACV'
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        title='Trade 2 Allowance:'
                        value={0}
                        withInput
                        fieldName='Trade1Allowance'
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        title='Trade 2 ACV:'
                        value={0}
                        withInput
                        fieldName='Trade2ACV'
                        onChange={({ value }) => {}}
                    />
                </div>
                <div className='vehicle-profit__info'>
                    <DealProfitItem
                        title='Cash Price:'
                        justify='start'
                        includes
                        currency='$'
                        value={0}
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Vehicle Cost:'
                        includes
                        justify='start'
                        currency='$'
                        value={0}
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Expenses:'
                        includes
                        justify='start'
                        currency='$'
                        value={0}
                        onChange={({ value }) => {}}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Overallowance:'
                        includes
                        includeFirst={includeOverallowanceFirst}
                        includeSecond={includeOverallowanceSecond}
                        includeFirstOnChange={setIncludeOverallowanceFirst}
                        includeSecondOnChange={setIncludeOverallowanceSecond}
                        justify='start'
                        currency='$'
                        value={0}
                        onChange={({ value }) => {}}
                    />
                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>
                    <DealProfitItem
                        numberSign='='
                        title='Vehicle Profit:'
                        currency='$'
                        className='deal-profit__item--blue'
                        includes
                        includeFirst={includeVehicleProfitFirst}
                        includeSecond={includeVehicleProfitSecond}
                        includeFirstOnChange={setIncludeVehicleProfitFirst}
                        includeSecondOnChange={setIncludeVehicleProfitSecond}
                        value={0}
                        onChange={({ value }) => {}}
                    />
                </div>
            </div>
        </Card>
    );
};
