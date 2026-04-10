import { observer } from "mobx-react-lite";
import { ReactElement, useState } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";
import { TERM_MONTH_LIST } from "common/constants/contract-options";
import { ComboBox } from "dashboard/common/form/dropdown";
import { useLocation } from "react-router-dom";

enum WarrantyTerm {
    MILES = "Miles",
    MONTH = "Month",
}

export const DealRetailProducts = observer((): ReactElement => {
    const store = useStore().dealStore;
    const { pathname, search } = useLocation();
    const currentPath = pathname + search;
    const {
        deal: { price },
        dealExtData,
        changeDeal,
        changeDealExtData,
    } = store;
    const {
        GAP_Company,
        Warranty_Name,
        Warranty_Miles,
        Warranty_Term,
        Warranty_Deductible,
        Warranty_Notes,
        Warranty_Price,
        serviceContract,
    } = dealExtData;
    const serviceContractCost = Number(serviceContract) || 0;
    const [gapCost, setGapCost] = useState<number>(0);

    return (
        <div className='grid deal-retail-products row-gap-2'>
            <div className='col-6'>
                <CompanySearch
                    originalPath={currentPath}
                    name='Service Contract Company'
                    value={Warranty_Name}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "Warranty_Name", value })
                    }
                    onRowClick={(value) =>
                        changeDealExtData({
                            key: "Warranty_Name",
                            value,
                        })
                    }
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Warranty_Price}
                    onChange={({ value }) =>
                        changeDealExtData({ key: "Warranty_Price", value: Number(value) || 0 })
                    }
                    labelPosition='top'
                    title='Price'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    labelPosition='top'
                    value={Warranty_Deductible}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Warranty_Deductible", value: value || 0 });
                    }}
                    title='Deductible'
                />
            </div>

            <div className='col-3'>
                <ComboBox
                    label='Term (month or miles)'
                    options={[WarrantyTerm.MONTH, WarrantyTerm.MILES]}
                    value={Warranty_Miles}
                    onChange={({ value }) => changeDealExtData({ key: "Warranty_Miles", value })}
                    className='w-full deal-products__dropdown'
                />
            </div>
            <div className='col-3 ml-auto'>
                <CurrencyInput
                    labelPosition='top'
                    value={serviceContractCost}
                    onChange={({ value }) =>
                        changeDealExtData({
                            key: "serviceContract",
                            value: Number(value) || 0,
                        })
                    }
                    title='Service Contract Cost'
                />
            </div>
            {Warranty_Miles === WarrantyTerm.MONTH && (
                <div className='col-3'>
                    <ComboBox
                        label='Duration'
                        editable
                        options={[...TERM_MONTH_LIST]}
                        value={Warranty_Term}
                        onChange={({ value }) => changeDealExtData({ key: "Warranty_Term", value })}
                        className='w-full deal-products__dropdown'
                    />
                </div>
            )}

            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        value={Warranty_Notes}
                        onChange={({ target: { value } }) =>
                            changeDealExtData({ key: "Warranty_Notes", value })
                        }
                        className='deal-products__text-area'
                    />
                    <label className='float-label'>Notes</label>
                </span>
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch
                    originalPath={currentPath}
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
                    value={
                        typeof price === "string" && price.includes("$")
                            ? Number(price.replace("$", ""))
                            : Number(price)
                    }
                    onChange={({ value }) => {
                        changeDeal({ key: "price", value: Number(value) || 0 });
                    }}
                    labelPosition='top'
                    title='Price'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    labelPosition='top'
                    title='GAP Cost'
                    value={gapCost}
                    onChange={({ value }) => setGapCost(Number(value) || 0)}
                />
            </div>
        </div>
    );
});
