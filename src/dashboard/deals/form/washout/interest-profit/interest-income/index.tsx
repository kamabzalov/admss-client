import { DealProfitItem } from "dashboard/deals/form/washout/deal-profit";
import { CURRENCY_OPTIONS } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { toBinary } from "common/helpers";

export const InterestIncome = observer(() => {
    const { dealWashout, changeDealWashout } = useStore().dealStore;

    return (
        <div className='interest-income__body'>
            <DealProfitItem
                title='Sell Rate (Contract Rate):'
                justify='start'
                value={Number(dealWashout.ContractRate) || 0}
                currency={CURRENCY_OPTIONS.DOLLAR}
            />
            <DealProfitItem
                title='Projected Term Interest:'
                justify='start'
                value={Number(dealWashout.ProjTermInterest) || 0}
                currency={CURRENCY_OPTIONS.DOLLAR}
            />
            <DealProfitItem
                title='Buy Rate:'
                value={Number(dealWashout.BuyRate) || 0}
                currency={CURRENCY_OPTIONS.PERCENT}
                withInput
                fieldName='BuyRate'
                onChange={({ value }: any) => changeDealWashout("BuyRate", String(value))}
            />
            <DealProfitItem
                title='(-) Buy Rate Term Interest:'
                justify='start'
                value={Number(dealWashout.BuyRateTermInterest) || 0}
                currency={CURRENCY_OPTIONS.DOLLAR}
            />

            <div className='splitter my-0'>
                <hr className='splitter__line flex-1' />
            </div>

            <DealProfitItem
                title='Expected Interest / Reserve:'
                value={Number(dealWashout.ExpectedInterest) || 0}
                currency={CURRENCY_OPTIONS.DOLLAR}
                justify='start'
                className='deal-profit__item--bold'
            />
            <DealProfitItem
                title='Percent Witheld:'
                value={Number(dealWashout.PercentWitheld) || 0}
                currency={CURRENCY_OPTIONS.PERCENT}
                withInput
                fieldName='PercentWitheld'
                onChange={({ value }: any) => changeDealWashout("PercentWitheld", String(value))}
            />

            <div className='splitter my-0'>
                <hr className='splitter__line flex-1' />
            </div>

            <DealProfitItem
                title='Total Interest / Reserve:'
                value={Number(dealWashout.TotalInterest) || 0}
                currency={CURRENCY_OPTIONS.DOLLAR}
                justify='start'
                className='deal-profit__item--bold'
            />
            <div className='flex align-items-center mt-2'>
                <Checkbox
                    inputId='add-expected-to-total'
                    checked={!!dealWashout.AddExpectedToTotal}
                    onChange={(e) => {
                        changeDealWashout("AddExpectedToTotal", toBinary(Boolean(e.checked)));
                    }}
                />
                <label htmlFor='add-expected-to-total' className='ml-2'>
                    Add Expected Interest Amount to Total Profit
                </label>
            </div>
        </div>
    );
});
