import { CurrencyInput, TextInput } from "dashboard/common/form/inputs";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

enum MISC_COST_OPTIONS {
    COMMISSION1 = "commission1",
    COMMISSION = "commission",
}

export const DealTotalsProfit = observer(() => {
    const { dealWashout, changeDealWashout } = useStore().dealStore;

    const [firstMiscSelectedOption, setFirstMiscSelectedOption] =
        useState<MISC_COST_OPTIONS | null>(null);

    const [secondMiscSelectedOption, setSecondMiscSelectedOption] =
        useState<MISC_COST_OPTIONS | null>(null);

    const handleFirstMiscSelection = (optionId: MISC_COST_OPTIONS) => {
        if (firstMiscSelectedOption === optionId) {
            setFirstMiscSelectedOption(null);
        } else {
            setFirstMiscSelectedOption(optionId);
        }
    };

    const handleSecondMiscSelection = (optionId: MISC_COST_OPTIONS) => {
        if (secondMiscSelectedOption === optionId) {
            setSecondMiscSelectedOption(null);
        } else {
            setSecondMiscSelectedOption(optionId);
        }
    };

    const getCurrencyValue = (value: string, withSpace = false) => {
        return `${withSpace ? "$ " : "$"}${Number(value || 0).toFixed(2)}`;
    };

    return (
        <Card className='profit-card totals-profit'>
            <h3 className='profit-card__header totals-profit__header'>Totals</h3>
            <article className='profit-card__body totals-profit__body'>
                <section className='totals-profit__info totals-info'>
                    <div className='totals-info__item totals-info__item--vehicle'>
                        <span className='totals-info__title'>Vehicle Profit:</span>
                        <span className='totals-info__value'>
                            {getCurrencyValue(dealWashout.VehicleProfit)}
                        </span>
                    </div>
                    <div className='totals-info__item totals-info__item--finance'>
                        <span className='totals-info__title'>(+) F&amp;I Profit:</span>
                        <span className='totals-info__value'>
                            {getCurrencyValue(dealWashout.FIProfitTotal)}
                        </span>
                    </div>
                    <div className='totals-info__item totals-info__item--commission'>
                        <span className='totals-info__title'>(-) Commissions:</span>
                        <span className='totals-info__value'>
                            {getCurrencyValue(dealWashout.CommissionTotal)}
                        </span>
                    </div>
                </section>

                <section className='totals-controls'>
                    <div className='totals-row totals-misc'>
                        <TextInput
                            name='(-) Misc. Cost'
                            value={dealWashout.MiscProfitDescription}
                            height={32}
                            className='totals-misc__input'
                            onChange={(e) =>
                                changeDealWashout("MiscProfitDescription", e.target.value)
                            }
                        />
                        <CurrencyInput
                            name='(+) Misc. Cost'
                            value={Number(dealWashout.MiscProfit) || 0}
                            className='totals-misc__input'
                            coloredEmptyValue
                            onChange={(e: InputNumberChangeEvent) =>
                                changeDealWashout("MiscProfit", String(e.value))
                            }
                        />
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-cost-first-commission1'
                                checked={firstMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION1}
                                tooltip='Include in Commission1 Base'
                                onChange={() =>
                                    handleFirstMiscSelection(MISC_COST_OPTIONS.COMMISSION1)
                                }
                            />

                            <Checkbox
                                inputId='misc-cost-first-commission'
                                checked={firstMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION}
                                tooltip='Include in Commission Base'
                                onChange={() =>
                                    handleFirstMiscSelection(MISC_COST_OPTIONS.COMMISSION)
                                }
                            />
                        </div>
                    </div>
                    <div className='totals-row totals-misc'>
                        <TextInput
                            name='(-) Misc. Cost'
                            height={32}
                            value={dealWashout.MiscCostDescription}
                            className='totals-misc__input'
                            onChange={(e) =>
                                changeDealWashout("MiscCostDescription", e.target.value)
                            }
                        />
                        <CurrencyInput
                            name='Misc. Cost'
                            value={Number(dealWashout.MiscCost) || 0}
                            className='totals-misc__input'
                            coloredEmptyValue
                            onChange={(e: InputNumberChangeEvent) =>
                                changeDealWashout("MiscCost", String(e.value))
                            }
                        />
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-cost-second-commission1'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION1}
                                tooltip='Include in Commission1 Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION1)
                                }
                            />
                            <Checkbox
                                inputId='misc-cost-second-commission'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION}
                                tooltip='Include in Commission Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION)
                                }
                            />
                        </div>
                    </div>

                    <div className='totals-row'>
                        <span className='totals-info__title'>
                            (+) Reserve Refund from Finance Co:
                        </span>
                        <CurrencyInput
                            name='Reserve Refund from Finance Co'
                            value={Number(dealWashout.ReserveRefund) || 0}
                            className='totals-info__input'
                            coloredEmptyValue
                            onChange={(e: InputNumberChangeEvent) =>
                                changeDealWashout("ReserveRefund", String(e.value))
                            }
                        />
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-cost-second-commission1'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION1}
                                tooltip='Include in Commission1 Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION1)
                                }
                            />
                            <Checkbox
                                inputId='misc-cost-second-commission'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION}
                                tooltip='Include in Commission Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION)
                                }
                            />
                        </div>
                    </div>

                    <div className='totals-row mb-0'>
                        <span className='totals-info__title'>(+) Vehicle Pack:</span>
                        <span className='totals-info__value'>
                            {getCurrencyValue(dealWashout.VehiclePack, true)}
                        </span>
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-cost-second-commission1'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION1}
                                tooltip='Include in Commission1 Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION1)
                                }
                            />
                            <Checkbox
                                inputId='misc-cost-second-commission'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION}
                                tooltip='Include in Commission Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION)
                                }
                            />
                        </div>
                    </div>
                    <div className='totals-row mb-1'>
                        <span className='totals-info__title'>(+) Doc Fee:</span>
                        <span className='totals-info__value'>
                            {getCurrencyValue(dealWashout.DocFee, true)}
                        </span>
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-cost-second-commission1'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION1}
                                tooltip='Include in Commission1 Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION1)
                                }
                            />
                            <Checkbox
                                inputId='misc-cost-second-commission'
                                checked={secondMiscSelectedOption === MISC_COST_OPTIONS.COMMISSION}
                                tooltip='Include in Commission Base'
                                onChange={() =>
                                    handleSecondMiscSelection(MISC_COST_OPTIONS.COMMISSION)
                                }
                            />
                        </div>
                    </div>

                    <div className='splitter my-0'>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <div className='totals-row totals-summary'>
                        <span className='totals-summary__title'>(=) Net F&I Profit:</span>
                        <span className='totals-summary__value'>
                            {getCurrencyValue(dealWashout.TotalDealCost, true)}
                        </span>
                        <div className='deal-profit__includes' />
                    </div>
                </section>
            </article>
        </Card>
    );
});
