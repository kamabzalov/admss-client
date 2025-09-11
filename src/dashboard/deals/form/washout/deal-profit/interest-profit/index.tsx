import { Card } from "primereact/card";
import { DealProfitItem } from "dashboard/deals/form/washout/deal-profit";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { CURRENCY_OPTIONS } from "dashboard/common/form/inputs";

export const DealInterestProfit = observer(() => {
    const { dealWashout } = useStore().dealStore;

    return (
        <Card className='profit-card deal-interest-profit'>
            <h3 className='profit-card__header deal-interest-profit__header'>Interest Profit</h3>
            <article className='profit-card__body deal-interest-profit__body'>
                <div className='deal-interest-profit__controls interest-controls'>
                    <DealProfitItem
                        title='Warranty Profit:'
                        value={Number(dealWashout.Warranty_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        includes
                        includeCheckboxFieldName='Warranty_Profit'
                    />
                    <DealProfitItem
                        title='Gap Profit:'
                        value={Number(dealWashout.Gap_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckboxFieldName='Gap_Profit'
                    />
                    <DealProfitItem
                        title='Accessories Profit:'
                        value={Number(dealWashout.Accessory_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckboxFieldName='Accessory_Profit'
                    />
                    <DealProfitItem
                        title='C/L Profit:'
                        value={Number(dealWashout.CL_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckboxFieldName='CL_Profit'
                    />
                    <DealProfitItem
                        title='A/H Profit:'
                        value={Number(dealWashout.AH_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckboxFieldName='AH_Profit'
                    />
                </div>

                <div className='vertical-splitter' />

                <div className='deal-interest-profit__results interest-results'>
                    <DealProfitItem
                        title='VSI Profit:'
                        value={Number(dealWashout.VSI_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckboxFieldName='VSI_Profit'
                    />

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        title='Interest Markup:'
                        value={Number(dealWashout.Interest_Markup) || 0}
                        fieldName='InterestMarkup'
                        numberSign='+'
                        includes
                        includeCheckboxFieldName='Interest_Markup'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Loan Costs:'
                        numberSign='-'
                        value={Number(dealWashout.Loan_Cost) || 0}
                        fieldName='LoanCosts'
                        includes
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        numberSign='='
                        title='Net F&I Profit:'
                        value={Number(dealWashout.NetFI_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        className='deal-profit__item--green deal-profit__item--bold'
                        includes
                    />
                </div>
            </article>
        </Card>
    );
});
