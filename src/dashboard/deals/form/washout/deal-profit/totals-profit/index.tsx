import { CurrencyInput, TextInput } from "dashboard/common/form/inputs";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { INCLUDE_OPTIONS } from "store/stores/deal";

export const DealTotalsProfit = observer(() => {
    const { dealWashout, changeDealWashout, toggleIncludeCheckbox, getIncludeCheckboxValue } =
        useStore().dealStore;

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
                            name='(+) Misc. Cost'
                            value={dealWashout.MiscProfitDescription || ""}
                            height={32}
                            className='totals-misc__input'
                            onChange={(e) =>
                                changeDealWashout("MiscProfitDescription", e.target.value)
                            }
                        />
                        <CurrencyInput
                            value={Number(dealWashout.MiscProfit) || 0}
                            className='totals-misc__input'
                            coloredEmptyValue
                            onChange={(e: InputNumberChangeEvent) =>
                                changeDealWashout("MiscProfit", String(e.value))
                            }
                        />
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-profit-commission1'
                                checked={
                                    getIncludeCheckboxValue("MiscCost") ===
                                    INCLUDE_OPTIONS.COMMISSION1
                                }
                                tooltip='Include in Commission1 Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("MiscCost");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION1) {
                                        toggleIncludeCheckbox("MiscCost", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "MiscCost",
                                            INCLUDE_OPTIONS.COMMISSION1
                                        );
                                    }
                                }}
                            />

                            <Checkbox
                                inputId='misc-profit-commission'
                                checked={
                                    getIncludeCheckboxValue("MiscCost") ===
                                    INCLUDE_OPTIONS.COMMISSION
                                }
                                tooltip='Include in Commission Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("MiscCost");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION) {
                                        toggleIncludeCheckbox("MiscCost", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "MiscCost",
                                            INCLUDE_OPTIONS.COMMISSION
                                        );
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className='totals-row totals-misc'>
                        <TextInput
                            name='(-) Misc. Cost'
                            height={32}
                            value={dealWashout.MiscCostDescription || ""}
                            className='totals-misc__input'
                            onChange={(e) =>
                                changeDealWashout("MiscCostDescription", e.target.value)
                            }
                        />
                        <CurrencyInput
                            value={Number(dealWashout.MiscCostMinus) || 0}
                            className='totals-misc__input'
                            coloredEmptyValue
                            onChange={(e: InputNumberChangeEvent) =>
                                changeDealWashout("MiscCostMinus", String(e.value))
                            }
                        />
                        <div className='deal-profit__includes'>
                            <Checkbox
                                inputId='misc-cost-commission1'
                                checked={
                                    getIncludeCheckboxValue("MiscCostMinus") ===
                                    INCLUDE_OPTIONS.COMMISSION1
                                }
                                tooltip='Include in Commission1 Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("MiscCostMinus");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION1) {
                                        toggleIncludeCheckbox("MiscCostMinus", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "MiscCostMinus",
                                            INCLUDE_OPTIONS.COMMISSION1
                                        );
                                    }
                                }}
                            />
                            <Checkbox
                                inputId='misc-cost-commission'
                                checked={
                                    getIncludeCheckboxValue("MiscCostMinus") ===
                                    INCLUDE_OPTIONS.COMMISSION
                                }
                                tooltip='Include in Commission Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("MiscCostMinus");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION) {
                                        toggleIncludeCheckbox("MiscCostMinus", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "MiscCostMinus",
                                            INCLUDE_OPTIONS.COMMISSION
                                        );
                                    }
                                }}
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
                                inputId='reserve-refund-commission1'
                                checked={
                                    getIncludeCheckboxValue("ReserveRefund") ===
                                    INCLUDE_OPTIONS.COMMISSION1
                                }
                                tooltip='Include in Commission1 Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("ReserveRefund");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION1) {
                                        toggleIncludeCheckbox("ReserveRefund", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "ReserveRefund",
                                            INCLUDE_OPTIONS.COMMISSION1
                                        );
                                    }
                                }}
                            />
                            <Checkbox
                                inputId='reserve-refund-commission'
                                checked={
                                    getIncludeCheckboxValue("ReserveRefund") ===
                                    INCLUDE_OPTIONS.COMMISSION
                                }
                                tooltip='Include in Commission Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("ReserveRefund");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION) {
                                        toggleIncludeCheckbox("ReserveRefund", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "ReserveRefund",
                                            INCLUDE_OPTIONS.COMMISSION
                                        );
                                    }
                                }}
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
                                inputId='vehicle-pack-commission1'
                                checked={
                                    getIncludeCheckboxValue("VehiclePack") ===
                                    INCLUDE_OPTIONS.COMMISSION1
                                }
                                tooltip='Include in Commission1 Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("VehiclePack");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION1) {
                                        toggleIncludeCheckbox("VehiclePack", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "VehiclePack",
                                            INCLUDE_OPTIONS.COMMISSION1
                                        );
                                    }
                                }}
                            />
                            <Checkbox
                                inputId='vehicle-pack-commission'
                                checked={
                                    getIncludeCheckboxValue("VehiclePack") ===
                                    INCLUDE_OPTIONS.COMMISSION
                                }
                                tooltip='Include in Commission Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("VehiclePack");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION) {
                                        toggleIncludeCheckbox("VehiclePack", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "VehiclePack",
                                            INCLUDE_OPTIONS.COMMISSION
                                        );
                                    }
                                }}
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
                                inputId='doc-fee-commission1'
                                checked={
                                    getIncludeCheckboxValue("DocFee") ===
                                    INCLUDE_OPTIONS.COMMISSION1
                                }
                                tooltip='Include in Commission1 Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("DocFee");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION1) {
                                        toggleIncludeCheckbox("DocFee", null);
                                    } else {
                                        toggleIncludeCheckbox(
                                            "DocFee",
                                            INCLUDE_OPTIONS.COMMISSION1
                                        );
                                    }
                                }}
                            />
                            <Checkbox
                                inputId='doc-fee-commission'
                                checked={
                                    getIncludeCheckboxValue("DocFee") === INCLUDE_OPTIONS.COMMISSION
                                }
                                tooltip='Include in Commission Base'
                                onChange={() => {
                                    const currentValue = getIncludeCheckboxValue("DocFee");
                                    if (currentValue === INCLUDE_OPTIONS.COMMISSION) {
                                        toggleIncludeCheckbox("DocFee", null);
                                    } else {
                                        toggleIncludeCheckbox("DocFee", INCLUDE_OPTIONS.COMMISSION);
                                    }
                                }}
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
