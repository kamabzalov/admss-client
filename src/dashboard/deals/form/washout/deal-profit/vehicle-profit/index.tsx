import { Card } from "primereact/card";
import { DealProfitItem } from "dashboard/deals/form/washout/deal-profit";
import { useStore } from "store/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { INVENTORY_STEPS } from "dashboard/inventory/form";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { CURRENCY_OPTIONS, CurrencyInput } from "dashboard/common/form/inputs";

export const DealVehicleProfit = observer(() => {
    const { dealWashout, inventory, changeDealWashout, preserveWashoutState } =
        useStore().dealStore;
    const inventoryStore = useStore().inventoryStore;
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleNavigateToExpenses = () => {
        preserveWashoutState();
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
                        value={Number(dealWashout.Trade1_Allowance) || 0}
                        coloredEmptyValue
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade1_Allowance", String(value));
                        }}
                    />
                    <CurrencyInput
                        title='ACV'
                        labelPosition='top'
                        coloredEmptyValue
                        value={Number(dealWashout.Trade1_Trade_ACV) || 0}
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade1_Trade_ACV", String(value));
                        }}
                    />
                </div>
                <div className='vehicle-profit__trade profit-trade'>
                    <h4 className='profit-trade__title'>Trade 2:</h4>
                    <CurrencyInput
                        title='Allowance'
                        labelPosition='top'
                        value={Number(dealWashout.Trade2_Allowance) || 0}
                        coloredEmptyValue
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade2_Allowance", String(value));
                        }}
                    />
                    <CurrencyInput
                        title='ACV'
                        labelPosition='top'
                        coloredEmptyValue
                        value={Number(dealWashout.Trade2_Trade_ACV) || 0}
                        wrapperClassName='profit-trade__input'
                        onChange={({ value }) => {
                            changeDealWashout("Trade2_Trade_ACV", String(value));
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
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        value={Number(dealWashout.CashPrice) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("CashPrice", String(value));
                        }}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Vehicle Cost:'
                        includes
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        value={Number(dealWashout.VehicleCost) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("VehicleCost", String(value));
                        }}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Expenses:'
                        includes
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        value={Number(dealWashout.Expenses) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("Expenses", String(value));
                        }}
                    />
                    <DealProfitItem
                        numberSign='-'
                        title='Overallowance:'
                        includes
                        includeCheckboxFieldName='Overallowance'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        value={Number(dealWashout.Overallowance) || 0}
                        onChange={({ value }) => {
                            changeDealWashout("Overallowance", String(value));
                        }}
                    />

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        numberSign='='
                        title='Vehicle Profit:'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        className='deal-profit__item--purple deal-profit__item--bold'
                        includes
                        includeCheckboxFieldName='VehicleProfit'
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
