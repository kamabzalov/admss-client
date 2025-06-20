import { Card } from "primereact/card";
import { DealProfitItem } from "..";
import { useState } from "react";

export const DealFIProfit = () => {
    const [warrantyProfitFirst, setWarrantyProfitFirst] = useState<boolean>(false);
    const [warrantyProfitSecond, setWarrantyProfitSecond] = useState<boolean>(false);
    const [gapProfitFirst, setGapProfitFirst] = useState<boolean>(false);
    const [gapProfitSecond, setGapProfitSecond] = useState<boolean>(false);
    const [accessoriesProfitFirst, setAccessoriesProfitFirst] = useState<boolean>(false);
    const [accessoriesProfitSecond, setAccessoriesProfitSecond] = useState<boolean>(false);
    const [clProfitFirst, setClProfitFirst] = useState<boolean>(false);
    const [clProfitSecond, setClProfitSecond] = useState<boolean>(false);
    const [ahProfitFirst, setAhProfitFirst] = useState<boolean>(false);
    const [ahProfitSecond, setAhProfitSecond] = useState<boolean>(false);
    const [vsiProfitFirst, setVsiProfitFirst] = useState<boolean>(false);
    const [vsiProfitSecond, setVsiProfitSecond] = useState<boolean>(false);
    const [netFIProfitFirst, setNetFIProfitFirst] = useState<boolean>(false);
    const [netFIProfitSecond, setNetFIProfitSecond] = useState<boolean>(false);
    const [interestMarkupFirst, setInterestMarkupFirst] = useState<boolean>(false);
    const [interestMarkupSecond, setInterestMarkupSecond] = useState<boolean>(false);
    const [discountFirst, setDiscountFirst] = useState<boolean>(false);
    const [discountSecond, setDiscountSecond] = useState<boolean>(false);
    const [acquisitionFeeFirst, setAcquisitionFeeFirst] = useState<boolean>(false);
    const [acquisitionFeeSecond, setAcquisitionFeeSecond] = useState<boolean>(false);
    const [reserveFirst, setReserveFirst] = useState<boolean>(false);
    const [reserveSecond, setReserveSecond] = useState<boolean>(false);

    return (
        <Card className='profit-card fi-profit'>
            <div className='profit-card__header fi-profit__header'>F & I Profit Worksheet</div>
            <div className='profit-card__body fi-profit__body'>
                <div className='fi-profit__costs'>
                    <div className='fi-profit__info'>
                        <DealProfitItem
                            title='Warranty Price:'
                            value={0}
                            fieldName='WarrantyPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Gap Price:'
                            value={0}
                            fieldName='GapPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Accessories Price:'
                            value={0}
                            fieldName='AccessoriesPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='C/L Price:'
                            value={0}
                            fieldName='CLPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='A/H Price:'
                            value={0}
                            fieldName='AHPrice'
                            currency='$'
                        />
                        <DealProfitItem
                            title='VSI Price:'
                            value={0}
                            fieldName='VSIPrice'
                            currency='$'
                        />
                    </div>
                    <div className='fi-profit__inputs'>
                        <DealProfitItem
                            title='Warranty Cost:'
                            value={0}
                            withInput
                            fieldName='WarrantyCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Gap Cost:'
                            value={0}
                            withInput
                            fieldName='GapCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='Accessories Cost:'
                            value={0}
                            withInput
                            fieldName='AccessoriesCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='C/L:'
                            value={0}
                            currencySelect
                            withInput
                            fieldName='CLCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='A/H:'
                            value={0}
                            currencySelect
                            withInput
                            fieldName='AHCost'
                            currency='$'
                        />
                        <DealProfitItem
                            title='VSI:'
                            value={0}
                            currencySelect
                            withInput
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
                                value={0}
                                withInput
                                fieldName='Discount'
                                includes
                                includeFirst={discountFirst}
                                includeSecond={discountSecond}
                                includeFirstOnChange={setDiscountFirst}
                                includeSecondOnChange={setDiscountSecond}
                                currency='$'
                            />
                            <DealProfitItem
                                title='Acquisition/ Loan Fee:'
                                value={0}
                                withInput
                                includes
                                includeFirst={acquisitionFeeFirst}
                                includeSecond={acquisitionFeeSecond}
                                includeFirstOnChange={setAcquisitionFeeFirst}
                                includeSecondOnChange={setAcquisitionFeeSecond}
                                fieldName='AcquisitionFee'
                                currency='$'
                            />
                            <DealProfitItem
                                title='Reserve:'
                                value={0}
                                currencySelect
                                includes
                                includeFirst={reserveFirst}
                                includeSecond={reserveSecond}
                                includeFirstOnChange={setReserveFirst}
                                includeSecondOnChange={setReserveSecond}
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
                        value={0}
                        currency='$'
                        includes
                        includeFirst={warrantyProfitFirst}
                        includeSecond={warrantyProfitSecond}
                        includeFirstOnChange={setWarrantyProfitFirst}
                        includeSecondOnChange={setWarrantyProfitSecond}
                    />
                    <DealProfitItem
                        title='Gap Profit:'
                        value={0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeFirst={gapProfitFirst}
                        includeSecond={gapProfitSecond}
                        includeFirstOnChange={setGapProfitFirst}
                        includeSecondOnChange={setGapProfitSecond}
                    />
                    <DealProfitItem
                        title='Accessories Profit:'
                        value={0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeFirst={accessoriesProfitFirst}
                        includeSecond={accessoriesProfitSecond}
                        includeFirstOnChange={setAccessoriesProfitFirst}
                        includeSecondOnChange={setAccessoriesProfitSecond}
                    />
                    <DealProfitItem
                        title='C/L Profit:'
                        value={0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeFirst={clProfitFirst}
                        includeSecond={clProfitSecond}
                        includeFirstOnChange={setClProfitFirst}
                        includeSecondOnChange={setClProfitSecond}
                    />
                    <DealProfitItem
                        title='A/H Profit:'
                        value={0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeFirst={ahProfitFirst}
                        includeSecond={ahProfitSecond}
                        includeFirstOnChange={setAhProfitFirst}
                        includeSecondOnChange={setAhProfitSecond}
                    />
                    <DealProfitItem
                        title='VSI Profit:'
                        value={0}
                        currency='$'
                        numberSign='+'
                        includes
                        includeFirst={vsiProfitFirst}
                        includeSecond={vsiProfitSecond}
                        includeFirstOnChange={setVsiProfitFirst}
                        includeSecondOnChange={setVsiProfitSecond}
                    />
                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <DealProfitItem
                        title='Interest Markup:'
                        value={0}
                        fieldName='InterestMarkup'
                        numberSign='+'
                        includes
                        includeFirst={interestMarkupFirst}
                        includeSecond={interestMarkupSecond}
                        includeFirstOnChange={setInterestMarkupFirst}
                        includeSecondOnChange={setInterestMarkupSecond}
                        currency='$'
                    />
                    <DealProfitItem
                        title='Loan Costs:'
                        numberSign='-'
                        value={0}
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
                        value={0}
                        currency='$'
                        className='deal-profit__item--blue'
                        includes
                        includeFirst={netFIProfitFirst}
                        includeSecond={netFIProfitSecond}
                        includeFirstOnChange={setNetFIProfitFirst}
                        includeSecondOnChange={setNetFIProfitSecond}
                    />
                </div>
            </div>
        </Card>
    );
};
