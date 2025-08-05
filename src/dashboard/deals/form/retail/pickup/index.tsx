import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { getDealPaymentsTotal, deleteDealPayment } from "http/services/deals.service";
import { useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { useToast } from "dashboard/common/toast";
import { DealPaymentsTotal, DealPickupPayment } from "common/models/deals";
import { Status } from "common/models/base-response";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { NEW_PAYMENT_LABEL } from "store/stores/deal";

export const DealRetailPickup = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().dealStore;
    const toast = useToast();
    const { dealPickupPayments, getPickupPayments, changeDealPickupPayments, dealErrorMessage } =
        store;
    const [totalPayments, setTotalPayments] = useState(0);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [currentPaymentItemuid, setCurrentPaymentItemuid] = useState<string | null>(null);
    const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

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

    useEffect(() => {
        setCheckedMap(Object.fromEntries(dealPickupPayments.map((p) => [p.itemuid, !!p.paydate])));
    }, [dealPickupPayments]);

    const handleChange = (itemuid: string, key: keyof DealPickupPayment, value: any) => {
        changeDealPickupPayments(itemuid, { key, value });
    };

    const clearPayment = (itemuid: string) => {
        handleChange(itemuid, "paydate", "ХХ/ХХ/ХХХХ");
        handleChange(itemuid, "amount", 0);
        handleChange(itemuid, "paid", 0);
    };

    const handleDeletePayment = async (itemuid: string) => {
        const response = await deleteDealPayment(itemuid);
        if (response?.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.error,
            });
        } else {
            await store.getPickupPayments(id);
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Payment deleted successfully",
            });
        }
    };

    const handleConfirmClear = async () => {
        if (currentPaymentItemuid) {
            setCheckedMap((prev) => ({ ...prev, [currentPaymentItemuid]: false }));
            clearPayment(currentPaymentItemuid);
            if (id && !currentPaymentItemuid.startsWith(NEW_PAYMENT_LABEL)) {
                await handleDeletePayment(currentPaymentItemuid);
            }
        }
        setConfirmModalVisible(false);
        setCurrentPaymentItemuid(null);
    };

    const handleModalHide = () => {
        setConfirmModalVisible(false);
        setCurrentPaymentItemuid(null);
    };

    const handleCheckboxChange = async (itemuid: string, checked: boolean) => {
        const payment = dealPickupPayments.find((p) => p.itemuid === itemuid);
        if (
            !checked &&
            id &&
            payment?.paydate &&
            !dontShowAgain &&
            !itemuid.startsWith(NEW_PAYMENT_LABEL)
        ) {
            setCurrentPaymentItemuid(itemuid);
            setConfirmModalVisible(true);
        } else {
            setCheckedMap((prev) => ({ ...prev, [itemuid]: checked }));
            if (!checked) {
                clearPayment(itemuid);
                if (id && !itemuid.startsWith(NEW_PAYMENT_LABEL)) {
                    await handleDeletePayment(itemuid);
                }
            }
        }
    };

    const handleDateChange = (date: Date | null, itemuid: string) => {
        handleChange(itemuid, "paydate", date ? date : "ХХ/ХХ/ХХХХ");
        setCheckedMap((prev) => ({ ...prev, [itemuid]: !!date }));
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
                            <Checkbox
                                checked={Boolean(checkedMap[payment.itemuid])}
                                onChange={(e) =>
                                    handleCheckboxChange(payment.itemuid, Boolean(e.checked))
                                }
                                className='pickup-checkbox'
                            />
                            <DateInput
                                date={
                                    payment.paydate && payment.paydate !== "ХХ/ХХ/ХХХХ"
                                        ? new Date(payment.paydate)
                                        : undefined
                                }
                                onChange={(e) =>
                                    handleDateChange(e.value as Date | null, payment.itemuid)
                                }
                                floatLabel={false}
                                name={
                                    !payment.paydate || payment.paydate === "ХХ/ХХ/ХХХХ"
                                        ? "ХХ/ХХ/ХХХХ"
                                        : ""
                                }
                                emptyDate
                                className={
                                    payment.paydate
                                        ? "pickup-input"
                                        : "pickup-input pickup-input--grey"
                                }
                                disabled={!checkedMap[payment.itemuid]}
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
            {id && (
                <ConfirmModal
                    visible={confirmModalVisible}
                    className='pickup-delete-dialog'
                    title='Are you sure?'
                    icon='pi-times-circle'
                    bodyMessage={
                        <>
                            Do you really want to delete
                            <br />
                            this pickup payment?
                            <br />
                            This process cannot be undone.
                        </>
                    }
                    confirmAction={handleConfirmClear}
                    draggable={false}
                    rejectLabel='Cancel'
                    acceptLabel='Delete'
                    onHide={handleModalHide}
                    showCheckbox={true}
                    checkboxLabel='Remember this choice'
                    checkboxChecked={dontShowAgain}
                    onCheckboxChange={setDontShowAgain}
                />
            )}
        </div>
    );
});
