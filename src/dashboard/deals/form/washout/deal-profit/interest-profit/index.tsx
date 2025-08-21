import { Card } from "primereact/card";
import { DealProfitItem, INCLUDE_OPTIONS } from "dashboard/deals/form/washout/deal-profit";
import { useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { CURRENCY_OPTIONS } from "dashboard/common/form/inputs";

export const DealInterestProfit = observer(() => {
    const { dealWashout } = useStore().dealStore;

    const [warrantyProfit, setWarrantyProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [gapProfit, setGapProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [accessoriesProfit, setAccessoriesProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [clProfit, setClProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [ahProfit, setAhProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [vsiProfit, setVsiProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [interestMarkup, setInterestMarkup] = useState<INCLUDE_OPTIONS | null>(null);

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
                        includeCheckbox={warrantyProfit}
                        includeCheckboxOnChange={setWarrantyProfit}
                    />
                    <DealProfitItem
                        title='Gap Profit:'
                        value={Number(dealWashout.Gap_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckbox={gapProfit}
                        includeCheckboxOnChange={setGapProfit}
                    />
                    <DealProfitItem
                        title='Accessories Profit:'
                        value={Number(dealWashout.Accessory_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckbox={accessoriesProfit}
                        includeCheckboxOnChange={setAccessoriesProfit}
                    />
                    <DealProfitItem
                        title='C/L Profit:'
                        value={Number(dealWashout.CL_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckbox={clProfit}
                        includeCheckboxOnChange={setClProfit}
                    />
                    <DealProfitItem
                        title='A/H Profit:'
                        value={Number(dealWashout.AH_Profit) || 0}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        numberSign='+'
                        includes
                        includeCheckbox={ahProfit}
                        includeCheckboxOnChange={setAhProfit}
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
                        includeCheckbox={vsiProfit}
                        includeCheckboxOnChange={setVsiProfit}
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
                        includeCheckbox={interestMarkup}
                        includeCheckboxOnChange={setInterestMarkup}
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
                        className='deal-profit__item--green'
                        includes
                    />
                </div>
            </article>
        </Card>
    );
});
