import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { getDealPaymentsTotal } from "http/services/deals.service";
import { useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { useToast } from "dashboard/common/toast";
import { DealPaymentsTotal, DealPickupPayment } from "common/models/deals";
import { Status } from "common/models/base-response";

export const DealRetailPickup = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().dealStore;
    const toast = useToast();
    const { dealPickupPayments, getPickupPayments, changeDealPickupPayments, dealErrorMessage } =
        store;
    const [totalPayments, setTotalPayments] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                await getPickupPayments(id);
                const data = await getDealPaymentsTotal(id);
                if (data?.status === Status.OK) {
                    const { total_paid } = data as DealPaymentsTotal;
                    setTotalPayments(total_paid);
                }
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (dealErrorMessage.length && toast.current) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: dealErrorMessage,
            });
        }
    }, [toast, dealErrorMessage]);

    const handleChange = (itemuid: string, key: keyof DealPickupPayment, value: any) => {
        changeDealPickupPayments(itemuid, { key, value });
    };

    return (
        <div className='grid deal-retail-pickup'>
            <div className='col-12 pickup-header'>
                <div className='pickup-header__item'>Date</div>
                <div className='pickup-header__item'>Amount</div>
                <div className='pickup-header__item'>Paid</div>
            </div>
            <div className='pickup-body col-12'>
                {dealPickupPayments.map((payment: DealPickupPayment) => (
                    <div key={payment.itemuid} className='pickup-row'>
                        <div className='pickup-row__item'>
                            <DateInput
                                checkbox
                                checked={!!payment.paydate}
                                floatLabel={false}
                                date={new Date(payment.paydate)}
                                name={!payment.paydate ? "ХХ/ХХ/ХХХХ" : ""}
                                onChange={(e) =>
                                    handleChange(payment.itemuid, "paydate", e.value || "")
                                }
                                className={
                                    payment.paydate
                                        ? "pickup-input"
                                        : "pickup-input pickup-input--grey"
                                }
                            />
                        </div>
                        <div className='pickup-row__item'>
                            <div className='pickup-item'>
                                <CurrencyInput
                                    placeholder='0.00'
                                    value={payment.amount}
                                    onChange={({ value }) =>
                                        handleChange(payment.itemuid, "amount", Number(value) || 0)
                                    }
                                    className={
                                        payment?.amount && payment.amount > 0
                                            ? "pickup-input"
                                            : "pickup-input pickup-input--grey"
                                    }
                                />
                            </div>
                        </div>
                        <div className='pickup-row__item'>
                            <Checkbox
                                checked={!!payment.paid}
                                onChange={(e) =>
                                    handleChange(payment.itemuid, "paid", e.checked ? 1 : 0)
                                }
                            />
                        </div>
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
