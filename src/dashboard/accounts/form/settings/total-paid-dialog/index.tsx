import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { AccountUpdateTotalInfo } from "common/models/accounts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    calcAccountFromHistory,
    getAccountOriginalAmount,
    updateAccountTotal,
} from "http/services/accounts.service";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { centsToDollars, formatCurrency } from "common/helpers";

interface TotalPaidDialogProps extends DashboardDialogProps {}
type TotalPaidInfo = Pick<
    AccountUpdateTotalInfo,
    "PrincipalPaid" | "InterestPaid" | "ExtraPrincipalPayments" | "TotalPaid"
>;

const initialTotalPaid: TotalPaidInfo = {
    PrincipalPaid: 0,
    InterestPaid: 0,
    ExtraPrincipalPayments: 0,
    TotalPaid: 0,
};

export const TotalPaidDialog = ({ onHide, visible }: TotalPaidDialogProps) => {
    const { id } = useParams();
    const toast = useToast();
    const [originalAmount, setOriginalAmount] = useState<TotalPaidInfo>(initialTotalPaid);
    const [newAmount, setNewAmount] = useState<TotalPaidInfo>(initialTotalPaid);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

    const fetchOriginalAmount = () => {
        if (id) {
            getAccountOriginalAmount(id).then((res) => {
                if (res?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: res.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    setOriginalAmount(res as TotalPaidInfo);
                    setNewAmount(res as TotalPaidInfo);
                }
            });
        }
    };

    useEffect(() => {
        if (visible) {
            fetchOriginalAmount();
            setIsSubmitEnabled(false);
        }
    }, [visible]);

    const handleCalcAmount = () => {
        if (id) {
            calcAccountFromHistory(id).then((res) => {
                if (res?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: res.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    setOriginalAmount(res as TotalPaidInfo);
                    setIsSubmitEnabled(true);
                }
            });
        }
    };

    const handleSaveTotalPaid = () => {
        const amountData: Partial<TotalPaidInfo> = {
            PrincipalPaid: centsToDollars(newAmount.PrincipalPaid),
            InterestPaid: centsToDollars(newAmount.InterestPaid),
            ExtraPrincipalPayments: centsToDollars(newAmount.ExtraPrincipalPayments),
        };

        if (id) {
            updateAccountTotal(id, amountData).then((res) => {
                if (res?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: res.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    toast.current?.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Total paid updated successfully",
                        life: TOAST_LIFETIME,
                    });
                    onHide();
                }
            });
        }
    };

    const handleCancel = () => {
        setNewAmount(originalAmount);
        onHide();
    };

    return (
        <DashboardDialog
            className='dialog__total-paid total-paid'
            position='top'
            footer='Save'
            header='Total Paid'
            visible={visible}
            onHide={handleCancel}
            action={handleSaveTotalPaid}
            buttonDisabled={!isSubmitEnabled}
            cancelButton
        >
            <div className='splitter my-3'>
                <h3 className='splitter__title m-0'>Original Amount</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='total-paid__info'>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Principal Paid:</label>
                    <span className='total-paid__value'>
                        {formatCurrency(originalAmount?.PrincipalPaid || 0)}
                    </span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Interest Paid:</label>
                    <span className='total-paid__value'>
                        {formatCurrency(originalAmount?.InterestPaid || 0)}
                    </span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Extra Principal Payments:</label>
                    <span className='total-paid__value'>
                        {formatCurrency(originalAmount?.ExtraPrincipalPayments || 0)}
                    </span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Total Paid:</label>
                    <span className='total-paid__value'>
                        {formatCurrency(originalAmount?.TotalPaid || 0)}
                    </span>
                </div>
            </div>

            <div className='splitter my-3'>
                <h3 className='splitter__title m-0'>New Amounts</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='total-paid__control'>
                <CurrencyInput
                    className='total-paid__input'
                    value={newAmount?.PrincipalPaid}
                    onChange={({ value }) =>
                        setNewAmount({ ...newAmount, PrincipalPaid: value || 0 })
                    }
                    title='Principal'
                    labelPosition='top'
                />
                <CurrencyInput
                    className='total-paid__input'
                    value={newAmount?.InterestPaid}
                    onChange={({ value }) =>
                        setNewAmount({ ...newAmount, InterestPaid: value || 0 })
                    }
                    title='Interest'
                    labelPosition='top'
                />
                <CurrencyInput
                    className='total-paid__input'
                    value={newAmount?.ExtraPrincipalPayments}
                    onChange={({ value }) =>
                        setNewAmount({ ...newAmount, ExtraPrincipalPayments: value || 0 })
                    }
                    title='Extra Principal'
                    labelPosition='top'
                />
            </div>

            <div className='total-paid__item'>
                <label className='total-paid__label'>Total Paid:</label>
                <span className='total-paid__value'>
                    {formatCurrency(newAmount?.TotalPaid || 0)}
                </span>
            </div>

            <Button
                className='total-paid__button'
                type='button'
                label='Calculate from Payment History'
                onClick={handleCalcAmount}
                outlined
            />
        </DashboardDialog>
    );
};
