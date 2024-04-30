import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { getDealPayments, getDealPaymentsTotal } from "http/services/deals.service";
import { useParams } from "react-router-dom";

const arrayItem = Array.from({ length: 7 }, (_, i) => i + 1);

export const DealRetailPickup = observer((): ReactElement => {
    const { id } = useParams();
    const [, setPayments] = useState([]);
    const [totalPayments, setTotalPayments] = useState(0);

    useEffect(() => {
        if (id) {
            getDealPayments(id).then((data) => setPayments(data));
            getDealPaymentsTotal(id).then((data) => setTotalPayments(data));
        }
        // eslint-disable-next-line
    }, []);

    return (
        <div className='grid deal-retail-pickup row-gap-2'>
            <div className='col-4 pickup-column'>
                <div className='pickup-header'>Date</div>
                {arrayItem.map((item) => (
                    <div key={item} className='pickup-item'>
                        <DateInput />
                    </div>
                ))}
            </div>
            <div className='col-4 pickup-column'>
                <div className='pickup-header'>Amount</div>
                {arrayItem.map((item) => (
                    <div key={item} className='pickup-item'>
                        <CurrencyInput placeholder='0.00' />
                    </div>
                ))}
            </div>
            <div className='col-4 pickup-column'>
                <div className='pickup-header'>Paid</div>
                {arrayItem.map((item) => (
                    <div key={item} className='pickup-item'>
                        <Checkbox checked={false} />
                    </div>
                ))}
            </div>
            <div className='col-12'>
                <div className='pickup-amount'>
                    <label className='pickup-amount__label'>Total Down</label>
                    <label className='pickup-amount__label'>${totalPayments || "0.00"}</label>
                </div>
            </div>
        </div>
    );
});
