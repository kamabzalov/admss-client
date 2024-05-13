import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";

export const DealRetailCharges = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        dealExtData: { Ins_AH, Ins_IA, Ins_MR },
        changeDealExtData,
    } = store;
    return (
        <div className='grid deal-retail-charges row-gap-2'>
            <div className='col-3'>
                <CurrencyInput
                    value={Ins_IA}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Ins_IA", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Credit Life'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    labelPosition='top'
                    value={Ins_AH}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Ins_AH", value: value || 0 });
                    }}
                    title='A&H/ Disability'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Ins_MR}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Ins_MR", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='VSI'
                />
            </div>
        </div>
    );
});
