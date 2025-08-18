import { Card } from "primereact/card";
import { DealProfitItem, INCLUDE_OPTIONS } from "..";
import { useState } from "react";
import { useStore } from "store/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { INVENTORY_STEPS } from "dashboard/inventory/form";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { CurrencyInput } from "dashboard/common/form/inputs";

export const DealVehicleProfit = observer(() => {
    const { dealWashout, inventory, changeDealWashout } = useStore().dealStore;
    const inventoryStore = useStore().inventoryStore;
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [includeOverallowance, setIncludeOverallowance] = useState<INCLUDE_OPTIONS | null>(null);
    const [includeVehicleProfit, setIncludeVehicleProfit] = useState<INCLUDE_OPTIONS | null>(null);

    const handleNavigateToExpenses = () => {
        inventoryStore.memoRoute = pathname;
        navigate(`/dashboard/inventory/${inventory.itemuid}?step=${INVENTORY_STEPS.EXPENSES}`);
    };

    return (
        <Card className='profit-card vehicle-profit'>
            <h3 className='profit-card__header vehicle-profit__header'>Vehicle Profit</h3>
            <article className='profit-card__body vehicle-profit__body'>
                <div className='vehicle-profit__trade profit-trade'>
                    <h4 className='profit-trade__title'>Trade 1:</h4>
                    <CurrencyInput
                        title='Allowance'
                        labelPosition='top'
                        value={Number(dealWashout.Trade1Allowance) || 0}
                        coloredEmptyValue
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade1Allowance", String(value));
                        }}
                    />
                    <CurrencyInput
                        title='ACV'
                        labelPosition='top'
                        coloredEmptyValue
                        value={Number(dealWashout.Trade1ACV) || 0}
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade1ACV", String(value));
                        }}
                    />
                </div>
                <div className='vehicle-profit__trade profit-trade'>
                    <h4 className='profit-trade__title'>Trade 2:</h4>
                    <CurrencyInput
                        title='Allowance'
                        labelPosition='top'
                        value={Number(dealWashout.Trade2Allowance) || 0}
                        coloredEmptyValue
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade2Allowance", String(value));
                        }}
                    />
                    <CurrencyInput
                        title='ACV'
                        labelPosition='top'
                        coloredEmptyValue
                        value={Number(dealWashout.Trade2ACV) || 0}
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade2ACV", String(value));
                        }}
                    />
                </div>

                <div className='splitter my-0 pt-3'>
                    <hr className='splitter__line flex-1' />
                </div>

                <Button
                    icon='icon adms-expenses'
                    label='Expenses'
                    className='vehicle-profit__button'
                    onClick={handleNavigateToExpenses}
                />

                <div className='vehicle-profit__info profit-info'>
                    <DealProfitItem
                        title='Cash Price:'
                        includes
                        currency='$'
                        value={Number(dealWashout.CashPrice) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("CashPrice", String(value));
                        }}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Vehicle Cost:'
                        includes
                        currency='$'
                        value={Number(dealWashout.VehicleCost) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("VehicleCost", String(value));
                        }}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Expenses:'
                        includes
                        currency='$'
                        value={Number(dealWashout.Expenses) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("Expenses", String(value));
                        }}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Overallowance:'
                        includes
                        includeCheckbox={includeOverallowance}
                        includeCheckboxOnChange={setIncludeOverallowance}
                        currency='$'
                        value={Number(dealWashout.Overllowance) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("Overllowance", String(value));
                        }}
                    />

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        numberSign='='
                        title='Vehicle Profit:'
                        currency='$'
                        className='deal-profit__item--purple'
                        includes
                        includeCheckbox={includeVehicleProfit}
                        includeCheckboxOnChange={setIncludeVehicleProfit}
                        value={Number(dealWashout.VehicleProfit) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("VehicleProfit", String(value));
                        }}
                    />
                </div>
            </article>
        </Card>
    );
});
