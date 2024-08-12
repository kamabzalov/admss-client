import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { AccountUpdateTotalInfo } from "common/models/accounts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { calcAccountFromHistory, getAccountOriginalAmount } from "http/services/accounts.service";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";

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

export const TotalPaidDialog = ({ onHide, action, visible }: TotalPaidDialogProps) => {
    const { id } = useParams();
    const toast = useToast();
    const [totalPaid, setTotalPaid] = useState<TotalPaidInfo>(initialTotalPaid);

    useEffect(() => {
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
                    setTotalPaid(res as TotalPaidInfo);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
                    setTotalPaid(res as TotalPaidInfo);
                }
            });
        }
    };

    return (
        <DashboardDialog
            className='dialog__total-paid total-paid'
            footer='Save'
            header='Total Paid'
            visible={visible}
            onHide={onHide}
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
                        {totalPaid?.PrincipalPaid || "$ 0.00"}
                    </span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Interest Paid:</label>
                    <span className='total-paid__value'>{totalPaid?.InterestPaid || "$ 0.00"}</span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Extra Principal Payments:</label>
                    <span className='total-paid__value'>
                        {totalPaid?.ExtraPrincipalPayments || "$ 0.00"}
                    </span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Total Paid:</label>
                    <span className='total-paid__value'>{totalPaid?.TotalPaid || "$ 0.00"}</span>
                </div>
            </div>

            <div className='splitter my-3'>
                <h3 className='splitter__title m-0'>New Amounts</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='total-paid__control'>
                <CurrencyInput className='total-paid__input' title='Amount' labelPosition='top' />
                <CurrencyInput className='total-paid__input' title='Amount' labelPosition='top' />
                <CurrencyInput className='total-paid__input' title='Amount' labelPosition='top' />
            </div>

            <div className='total-paid__item'>
                <label className='total-paid__label'>Total Paid:</label>
                <span className='total-paid__value'>$ 0.00</span>
            </div>

            <Button
                className='total-paid__button'
                label='Calculate from Payment History'
                onClick={handleCalcAmount}
                outlined
            />
        </DashboardDialog>
    );
};
