import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { Dropdown } from "primereact/dropdown";
import { DateInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { useStore } from "store/hooks";
import { getDealTypes, getSaleTypes } from "http/services/deals.service";
import { DealType, SaleType } from "common/models/deals";

export const DealGeneralSale = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        deal: { dealtype, saletype, inventoryuinfo, name },
    } = store;

    const [dealTypesList, setDealTypesList] = useState<DealType[]>([]);
    const [saleTypesList, setSaleTypesList] = useState<SaleType[]>([]);

    useEffect(() => {
        getDealTypes().then((res) => {
            if (res) setDealTypesList(res);
        });
        getSaleTypes().then((res) => {
            if (res) setSaleTypesList(res);
        });
    }, []);

    return (
        <div className='grid deal-general-sale row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        value={name}
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Buyer Name (required)</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        value={inventoryuinfo}
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Vehicle (required)</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        required
                        options={dealTypesList}
                        value={dealtype}
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Type of Deal (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Sale status (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        required
                        options={saleTypesList}
                        value={saletype}
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Sale type (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <DateInput name='Sale date (required)' />
            </div>
            <div className='col-3'>
                <DateInput name='First operated (req.)' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>New or Used (req.)</label>
                </span>
            </div>

            <div className='col-12 text-line'>
                <h3 className='text-line__title m-0 pr-3'>Vehicle payments tracking</h3>
                <hr className='text-line__line flex-1' />
            </div>

            <div className='col-3'>
                <DateInput name='Warn Overdue After X Days' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-sale__text-input w-full' />
                    <label className='float-label'>Account number</label>
                </span>
            </div>

            <hr className='col-12 form-line' />

            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>How did you hear about us? (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-sale__text-input w-full' />
                    <label className='float-label'>ROS SaleID (required)</label>
                </span>
            </div>
        </div>
    );
});
