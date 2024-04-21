import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { Dropdown } from "primereact/dropdown";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";

export const DealRetailProducts = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        deal: { price },
        dealExtData: { GAP_Company },
        changeDeal,
        changeDealExtData,
    } = store;
    return (
        <div className='grid deal-retail-products row-gap-2'>
            <div className='col-6'>
                <CompanySearch name='Service Contract Company' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Price' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Deductible' />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-products__dropdown'
                    />
                    <label className='float-label'>Term (month or miles)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-products__dropdown'
                    />
                    <label className='float-label'>Duration</label>
                </span>
            </div>

            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea className='deal-products__text-area' />
                    <label className='float-label'>Notes</label>
                </span>
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch
                    value={GAP_Company}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "GAP_Company", value })
                    }
                    onRowClick={(value) =>
                        changeDealExtData({
                            key: "GAP_Company",
                            value,
                        })
                    }
                    name='GAP Company'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(price)}
                    onChange={({ value }) => {
                        changeDeal({ key: "price", value: Number(value) || 0 });
                    }}
                    labelPosition='top'
                    title='Price'
                />
            </div>
        </div>
    );
});
