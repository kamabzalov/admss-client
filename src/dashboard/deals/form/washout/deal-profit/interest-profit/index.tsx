import { Card } from "primereact/card";
import { DealProfitItem, INCLUDE_OPTIONS } from "..";
import { useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

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
        <Card className='profit-card interest-profit'>
            <h3 className='profit-card__header interest-profit__header'>Interest Profit</h3>
            <article className='profit-card__body interest-profit__body'>
                <div className='interest-profit__controls interest-controls'>
                    <DealProfitItem
                        title='Warranty Profit:'
                        value={Number(dealWashout.Warranty_Profit) || 0}
                        currency='$'
                        includes
                        includeCheckbox={warrantyProfit}
                        includeCheckboxOnChange={setWarrantyProfit}
                    />
                    <DealProfitItem
                        title='Gap Profit:'
                        value={Number(dealWashout.Gap_Profit) || 0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeCheckbox={gapProfit}
                        includeCheckboxOnChange={setGapProfit}
                    />
                    <DealProfitItem
                        title='Accessories Profit:'
                        value={Number(dealWashout.Accessory_Profit) || 0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeCheckbox={accessoriesProfit}
                        includeCheckboxOnChange={setAccessoriesProfit}
                    />
                    <DealProfitItem
                        title='C/L Profit:'
                        value={Number(dealWashout.CL_Profit) || 0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeCheckbox={clProfit}
                        includeCheckboxOnChange={setClProfit}
                    />
                    <DealProfitItem
                        title='A/H Profit:'
                        value={Number(dealWashout.AH_Profit) || 0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeCheckbox={ahProfit}
                        includeCheckboxOnChange={setAhProfit}
                    />
                </div>

                <div className='vertical-splitter' />

                <div className='interest-profit__results interest-results'>
                    <DealProfitItem
                        title='VSI Profit:'
                        value={Number(dealWashout.VSI_Profit) || 0}
                        currency='$'
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
                        currency='$'
                    />
                    <DealProfitItem
                        title='Loan Costs:'
                        numberSign='-'
                        value={Number(dealWashout.Loan_Cost) || 0}
                        fieldName='LoanCosts'
                        includes
                        currency='$'
                    />

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        numberSign='='
                        title='Net F&I Profit:'
                        value={Number(dealWashout.NetFI_Profit) || 0}
                        currency='$'
                        className='deal-profit__item--green'
                        includes
                    />
                </div>
            </article>
        </Card>
    );
});
