import {
    BorderedCheckbox,
    CurrencyInput,
    DateInput,
    SearchInput,
} from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const PurchaseFloorplan = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        inventoryExtData: {
            fpFloorplanCompany,
            fpIsFloorplanned,
            fpPayoffBy,
            fpReductionDate,
            fpReduxAmt,
            fpRemainBal,
        },
        changeInventoryExtData,
    } = store;

    return (
        <div className='grid purchase-floorplan row-gap-2'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Floorplanned'
                    checked={!!fpIsFloorplanned}
                    onChange={({ target: { value } }) =>
                        changeInventoryExtData({ key: "fpIsFloorplanned", value: !!value ? 0 : 1 })
                    }
                />
            </div>
            <div className='col-6'>
                <SearchInput
                    name='Floor'
                    title='Floorplan Company'
                    //TODO: Add search input API here
                    value={fpFloorplanCompany}
                />
            </div>
            <div className='col-3'>
                <DateInput
                    name='Reduction Date'
                    value={new Date(fpReductionDate)}
                    onChange={({ value }) => {
                        if (value instanceof Date) {
                            changeInventoryExtData({
                                key: "fpReductionDate",
                                value: value.getTime(),
                            });
                        }
                    }}
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    name='Reduced amount'
                    title='Reduced amount'
                    labelPosition='top'
                    value={fpReduxAmt}
                    onChange={({ value }) => {
                        value &&
                            changeInventoryExtData({
                                key: "fpReduxAmt",
                                value,
                            });
                    }}
                />
            </div>
            <div className='col-3'>
                <DateInput
                    name='Pay Off By'
                    value={new Date(fpPayoffBy)}
                    onChange={({ value }) => {
                        if (value instanceof Date) {
                            changeInventoryExtData({
                                key: "fpPayoffBy",
                                value: value.getTime(),
                            });
                        }
                    }}
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    title='Remain balance'
                    labelPosition='top'
                    value={fpRemainBal}
                    onChange={({ value }) =>
                        value &&
                        changeInventoryExtData({
                            key: "fpRemainBal",
                            value,
                        })
                    }
                />
            </div>
        </div>
    );
});
