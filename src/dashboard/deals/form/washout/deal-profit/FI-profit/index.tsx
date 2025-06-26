import { Card } from "primereact/card";
import { DealProfitItem, INCLUDE_OPTIONS } from "..";
import { useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

export const DealFIProfit = observer(() => {
    const { dealWashout, changeDealWashout } = useStore().dealStore;

    const [warrantyProfit, setWarrantyProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [gapProfit, setGapProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [accessoriesProfit, setAccessoriesProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [clProfit, setClProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [ahProfit, setAhProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [vsiProfit, setVsiProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [netFIProfit, setNetFIProfit] = useState<INCLUDE_OPTIONS | null>(null);
    const [interestMarkup, setInterestMarkup] = useState<INCLUDE_OPTIONS | null>(null);
    const [discount, setDiscount] = useState<INCLUDE_OPTIONS | null>(null);
    const [acquisitionFee, setAcquisitionFee] = useState<INCLUDE_OPTIONS | null>(null);
    const [reserve, setReserve] = useState<INCLUDE_OPTIONS | null>(null);

    return (
        <Card className='profit-card fi-profit'>
            <div className='profit-card__header fi-profit__header'>F & I Profit Worksheet</div>
            <div className='profit-card__body fi-profit__body'>
                <div className='fi-profit__costs'>
                    <div className='fi-profit__info'>
                        <DealProfitItem
                            title='Warranty Price:'
                            value={Number(dealWashout.Warranty_Price) || 0}
                            fieldName='WarrantyPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Gap Price:'
                            value={Number(dealWashout.Gap) || 0}
                            fieldName='GapPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Accessories Price:'
                            value={Number(dealWashout.Accessory) || 0}
                            fieldName='AccessoriesPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='C/L Price:'
                            value={Number(dealWashout.CL) || 0}
                            fieldName='CLPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='A/H Price:'
                            value={Number(dealWashout.AH) || 0}
                            fieldName='AHPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='VSI Price:'
                            value={Number(dealWashout.VSI) || 0}
                            fieldName='VSIPrice'
                            currency='$'
                        />
                    </div>
                    <div className='fi-profit__inputs'>
                        <DealProfitItem
                            title='Warranty Cost:'
                            value={Number(dealWashout.Warranty_Cost) || 0}
                            withInput
                            onChange={({ value }) => {
                                changeDealWashout("Warranty_Cost", value?.toString() || "0");
                            }}
                            fieldName='WarrantyCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Gap Cost:'
                            value={Number(dealWashout.Gap_Cost) || 0}
                            withInput
                            onChange={({ value }) => {
                                changeDealWashout("Gap_Cost", value?.toString() || "0");
                            }}
                            fieldName='GapCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Accessories Cost:'
                            value={Number(dealWashout.Accessory_Cost) || 0}
                            withInput
                            onChange={({ value }) => {
                                changeDealWashout("Accessory_Cost", value?.toString() || "0");
                            }}
                            fieldName='AccessoriesCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='C/L:'
                            value={Number(dealWashout.CL_Cost) || 0}
                            currencySelectValue={dealWashout.CL_Type}
                            onCurrencySelect={(value) => {
                                changeDealWashout("CL_Type", value);
                            }}
                            withInput
                            onChange={({ value }) => {
                                changeDealWashout("CL_Cost", value?.toString() || "0");
                            }}
                            fieldName='CLCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='A/H:'
                            value={Number(dealWashout.AH_Cost) || 0}
                            currencySelectValue={dealWashout.AH_Type}
                            onCurrencySelect={(value) => {
                                changeDealWashout("AH_Type", value);
                            }}
                            withInput
                            onChange={({ value }) => {
                                changeDealWashout("AH_Cost", value?.toString() || "0");
                            }}
                            fieldName='AHCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='VSI:'
                            value={Number(dealWashout.VSI_Cost) || 0}
                            currencySelectValue={dealWashout.VSI_Type}
                            onCurrencySelect={(value) => {
                                changeDealWashout("VSI_Type", value);
                            }}
                            withInput
                            onChange={({ value }) => {
                                changeDealWashout("VSI_Cost", value?.toString() || "0");
                            }}
                            fieldName='VSICost'
                            currency='$'
                        />
                    </div>

                    <div className='fi-profit__loan-costs'>
                        <div className='splitter my-0 w-full'>
                            <hr className='splitter__line flex-1' />
                        </div>
                        <div className='fi-profit__loan-costs'>
                            <div className='fi-profit__loan-costs-title pl-4'>Loan Costs</div>
                            <DealProfitItem
                                title='Discount:'
                                value={Number(dealWashout.Discount) || 0}
                                withInput
                                fieldName='Discount'
                                includes
                                includeCheckbox={discount}
                                includeCheckboxOnChange={setDiscount}
                                currency='$'
                            />
                            <DealProfitItem
                                title='Acquisition/ Loan Fee:'
                                value={Number(dealWashout.AcquisitionFee) || 0}
                                withInput
                                includes
                                includeCheckbox={acquisitionFee}
                                includeCheckboxOnChange={setAcquisitionFee}
                                fieldName='AcquisitionFee'
                                currency='$'
                            />
                            <DealProfitItem
                                title='Reserve:'
                                value={Number(dealWashout.Reserve) || 0}
                                currencySelectValue={dealWashout.Reserve_Type}
                                onCurrencySelect={(value) => {
                                    changeDealWashout("Reserve_Type", value);
                                }}
                                includes
                                includeCheckbox={reserve}
                                includeCheckboxOnChange={setReserve}
                                withInput
                                fieldName='Reserve'
                                currency='$'
                            />
                        </div>
                    </div>
                </div>

                <div className='fi-profit__total'>
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
                        className='deal-profit__item--blue'
                        includes
                        includeCheckbox={netFIProfit}
                        includeCheckboxOnChange={setNetFIProfit}
                    />
                </div>
            </div>
        </Card>
    );
});
