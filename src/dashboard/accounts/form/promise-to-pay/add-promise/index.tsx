import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import { CurrencyInput, DateInput, TextInput } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import { addAccountPromise } from "http/services/accounts.service";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useStore } from "store/hooks";

interface AddPromiseDialogProps extends DashboardDialogProps {
    visible: boolean;
    accountuid?: string;
    statusList: Readonly<string[]>;
    action: () => void;
    onHide: () => void;
}

export const AddPromiseDialog = ({
    visible,
    onHide,
    action,
    accountuid,
    statusList,
    ...props
}: AddPromiseDialogProps): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [noteTaker, setNoteTaker] = useState<string>(authUser?.loginname || "");
    const [note, setNote] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [paydate, setPaydate] = useState<number>(0);
    const [status, setStatus] = useState<string>("");
    const toast = useToast();
    const currentTime = useMemo(
        () => `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        []
    );

    const handleAddPromise = async () => {
        if (accountuid) {
            const res = await addAccountPromise(accountuid, {
                username: noteTaker,
                amount,
                paydate,
                status,
                notes: note,
            });
            if (res && res.status === Status.ERROR) {
                return toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: res.error,
                    life: TOAST_LIFETIME,
                });
            } else {
                action();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Promise added successfully!",
                    life: TOAST_LIFETIME,
                });
                setNoteTaker("");
                setAmount(0);
                setPaydate(0);
                setNote("");
                onHide();
            }
        }
    };

    useEffect(() => {
        if (noteTaker && note) {
            setIsButtonDisabled(false);
        }
    }, [note, noteTaker]);

    return (
        <DashboardDialog
            className='add-promise'
            footer='Save'
            header='Add Promise'
            cancelButton
            visible={visible}
            onHide={onHide}
            action={handleAddPromise}
            buttonDisabled={isButtonDisabled}
            {...props}
        >
            <div className='grid row-gap-3'>
                <div className='add-note__info m-3'>
                    <strong>Date & Time: </strong>
                    <span className='add-note__time'>{currentTime}</span>
                </div>
                <TextInput
                    colWidth={12}
                    name='Note Taker'
                    value={noteTaker}
                    onChange={({ target: { value } }) => setNoteTaker(value)}
                />

                <div className='col-6'>
                    <DateInput
                        name='Promise to Pay Date'
                        date={paydate}
                        emptyDate
                        onChange={({ target: { value } }) => {
                            setPaydate(Number(value));
                        }}
                    />
                </div>

                <div className='col-6'>
                    <CurrencyInput
                        title='Amount'
                        labelPosition='top'
                        value={amount}
                        onChange={({ value }) => {
                            setAmount(Number(value));
                        }}
                    />
                </div>

                <div className='col-12'>
                    <span className='p-float-label'>
                        <InputTextarea
                            className='w-full add-promise__textarea'
                            value={note}
                            onChange={({ target: { value } }) => setNote(value)}
                        />
                        <label className='float-label'>Note</label>
                    </span>
                </div>
                <div className='col-12'>
                    <span className='p-float-label'>
                        <Dropdown
                            id='noteTaker'
                            onChange={(e) => setStatus(e.value)}
                            className='w-full'
                            options={[...statusList]}
                        />
                        <label className='float-label'>Status</label>
                    </span>
                </div>
            </div>
        </DashboardDialog>
    );
};
