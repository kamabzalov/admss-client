import { Card } from "primereact/card";
import { useState } from "react";
import { DealProfitItem, INCLUDE_OPTIONS } from "dashboard/deals/form/washout/deal-profit";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { CURRENCY_OPTIONS } from "dashboard/common/form/inputs";

export const DealProfitFinanceWorksheet = observer(() => {
    const { dealWashout, changeDealWashout } = useStore().dealStore;

    const [discount, setDiscount] = useState<INCLUDE_OPTIONS | null>(null);
    const [acquisitionFee, setAcquisitionFee] = useState<INCLUDE_OPTIONS | null>(null);
    const [reserve, setReserve] = useState<INCLUDE_OPTIONS | null>(null);

    return (
        <Card className='profit-card profit-finance'>
            <h3 className='profit-card__header profit-finance__header'>Finance Worksheet</h3>

            <article className='profit-card__body finance-worksheet'>
                <div className='finance-profit__info'>
                    <DealProfitItem
                        title='Warranty Price:'
                        value={Number(dealWashout.Warranty_Price) || 0}
                        fieldName='WarrantyPrice'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Gap Price:'
                        value={Number(dealWashout.Gap) || 0}
                        fieldName='GapPrice'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Accessories Price:'
                        value={Number(dealWashout.Accessory) || 0}
                        fieldName='AccessoriesPrice'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='C/L Price:'
                        value={Number(dealWashout.CL) || 0}
                        fieldName='CLPrice'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='A/H Price:'
                        value={Number(dealWashout.AH) || 0}
                        fieldName='AHPrice'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='VSI Price:'
                        value={Number(dealWashout.VSI) || 0}
                        fieldName='VSIPrice'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                </div>
                <div className='vertical-splitter' />
                <div className='finance-profit__inputs'>
                    <DealProfitItem
                        title='Warranty Cost:'
                        value={Number(dealWashout.Warranty_Cost) || 0}
                        withInput
                        onChange={({ value }) => {
                            changeDealWashout("Warranty_Cost", value?.toString() || "0");
                        }}
                        fieldName='WarrantyCost'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Gap Cost:'
                        value={Number(dealWashout.Gap_Cost) || 0}
                        withInput
                        onChange={({ value }) => {
                            changeDealWashout("Gap_Cost", value?.toString() || "0");
                        }}
                        fieldName='GapCost'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Accessories Cost:'
                        value={Number(dealWashout.Accessory_Cost) || 0}
                        withInput
                        onChange={({ value }) => {
                            changeDealWashout("Accessory_Cost", value?.toString() || "0");
                        }}
                        fieldName='AccessoriesCost'
                        currency={CURRENCY_OPTIONS.DOLLAR}
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
                        currency={CURRENCY_OPTIONS.DOLLAR}
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
                        currency={CURRENCY_OPTIONS.DOLLAR}
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
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                </div>{" "}
            </article>
            <section className='finance-profit__loan finance-loan'>
                <h3 className='profit-card__header profit-finance__header'>Loan Costs</h3>

                <article className='profit-card__body'>
                    <DealProfitItem
                        title='Discount:'
                        value={Number(dealWashout.Discount) || 0}
                        withInput
                        fieldName='Discount'
                        justify='start'
                        includes
                        includeCheckbox={discount}
                        includeCheckboxOnChange={setDiscount}
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Acquisition/ Loan Fee:'
                        value={Number(dealWashout.AcquisitionFee) || 0}
                        withInput
                        justify='start'
                        includes
                        includeCheckbox={acquisitionFee}
                        includeCheckboxOnChange={setAcquisitionFee}
                        fieldName='AcquisitionFee'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                    />
                    <DealProfitItem
                        title='Reserve:'
                        value={Number(dealWashout.Reserve) || 0}
                        justify='start'
                        currencySelectValue={dealWashout.Reserve_Type}
                        onCurrencySelect={(value) => {
                            changeDealWashout("Reserve_Type", value);
                        }}
                        includes
                        includeCheckbox={reserve}
                        includeCheckboxOnChange={setReserve}
                        withInput
                        fieldName='Reserve'
                        currency={CURRENCY_OPTIONS.DOLLAR}
                        additionalValue={`$ ${
                            Number(dealWashout.ReserveCalculated).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) || 0
                        }`}
                    />
                </article>
            </section>
        </Card>
    );
});
