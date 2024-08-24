import { observer } from "mobx-react-lite";
import { Checkbox } from "primereact/checkbox";
import { ReactElement, useEffect } from "react";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";

export const ExportWebPrice = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().inventoryStore;
    const {
        exportWebActive,
        inventoryExportWeb: {
            ModelCode,
            CostPrice,
            ListPrice,
            SpecialPrice,
            ExtraPrice1,
            ExtraPrice2,
            ExtraPrice3,
            DealerComments,
        },
        changeExportWeb,
        getWebCheckStatus,
    } = store;

    useEffect(() => {
        getWebCheckStatus(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleExportWebChange = () => {
        store.exportWebActive = !exportWebActive;
        store.isFormChanged = true;
    };

    return (
        <div className='grid export-web-price row-gap-2'>
            <label className='cursor-pointer export-web-price__label'>
                <Checkbox
                    checked={exportWebActive}
                    onChange={handleExportWebChange}
                    className='export-web-price__checkbox'
                />
                Export to Web
            </label>

            <hr className='form-line' />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='export-web-price__text-input w-full'
                        value={ModelCode}
                        onChange={({ target: { value } }) =>
                            changeExportWeb({ key: "ModelCode", value })
                        }
                    />
                    <label className='float-label'>Model Code</label>
                </span>
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={parseFloat(ListPrice)}
                    labelPosition='top'
                    title='List price'
                    onChange={({ value }) => value && changeExportWeb({ key: "ListPrice", value })}
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={SpecialPrice}
                    labelPosition='top'
                    title='Special price'
                    onChange={({ value }) =>
                        value && changeExportWeb({ key: "SpecialPrice", value })
                    }
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={CostPrice}
                    labelPosition='top'
                    title='Cost price'
                    onChange={({ value }) => value && changeExportWeb({ key: "CostPrice", value })}
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={ExtraPrice1}
                    labelPosition='top'
                    title='Extra price 1'
                    onChange={({ value }) =>
                        value && changeExportWeb({ key: "ExtraPrice1", value })
                    }
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={ExtraPrice2}
                    labelPosition='top'
                    title='Extra price 2'
                    onChange={({ value }) =>
                        value && changeExportWeb({ key: "ExtraPrice2", value })
                    }
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={ExtraPrice3}
                    labelPosition='top'
                    title='Extra price 3'
                    onChange={({ value }) =>
                        value && changeExportWeb({ key: "ExtraPrice3", value })
                    }
                />
            </div>

            <hr className='form-line' />

            <div className='col-12'>
                <InputTextarea
                    placeholder='Dealer comments on vehicle'
                    className='w-full export-web-price__text-area'
                    value={DealerComments}
                    onChange={({ target: { value } }) =>
                        changeExportWeb({ key: "DealerComments", value })
                    }
                />
            </div>
        </div>
    );
});
