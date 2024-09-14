import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { InfoSection } from "dashboard/accounts/form/information/info-section";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";
import { AccountNoteData } from "store/stores/account";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { updateAccountNote } from "http/services/accounts.service";
import { useParams } from "react-router-dom";
import { TOAST_LIFETIME } from "common/settings";

export const TakePaymentInfo = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().accountStore;
    const {
        accountNote,
        accountPaymentsInfo: { CurrentStatus, CollectionDetails },
    } = store;
    const toast = useToast();

    const handleSaveNote = (saveItem: keyof AccountNoteData) => {
        id &&
            updateAccountNote(id, { [saveItem]: accountNote[saveItem] }).then((res) => {
                if (res?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: res.error,
                        life: TOAST_LIFETIME,
                    });
                }
            });
    };

    return (
        <div className='take-payment__info'>
            <InfoSection
                sectionTitle='Current Status'
                info={[
                    { title: "Past Due Amt", value: `$ ${CurrentStatus?.PastDueAmount || "0.00"}` },
                    { title: "Current Due", value: `$ ${CurrentStatus?.CurrentDue || "0.00"}` },
                    {
                        title: "Down/Pickup Due",
                        value: `$ ${CurrentStatus?.DownPickupDue || "0.00"}`,
                    },
                    { title: "Fees", value: `$ ${CurrentStatus?.Fees || "0.00"}` },
                    { title: "Total Due", value: `$ ${CurrentStatus?.TotalDue || "0.00"}` },
                    {
                        title: "Current Balance",
                        value: `$ ${CurrentStatus?.CurrentBalance || "0.00"}`,
                    },
                ]}
            />

            <InfoSection
                sectionTitle='Collection Details'
                info={[
                    {
                        title: "Regular Pmt",
                        value: `$ ${CollectionDetails?.RegularPayment || "0.00"}`,
                    },
                    {
                        title: "Next Pmt. due",
                        value: `$ ${CollectionDetails?.NextPmtDue || "0.00"}`,
                    },
                    {
                        title: "Days Overdue",
                        value: `$ ${CollectionDetails?.DaysOverdue || "0.00"}`,
                    },
                    { title: "Last Paid", value: `$ ${CollectionDetails?.LastPaid || "0.00"}` },
                    {
                        title: "Last Paid Days",
                        value: `$ ${CollectionDetails?.LastPaidDays || "0.00"}`,
                    },
                    { title: "Last Late", value: `$ ${CollectionDetails?.LastLate || "0.00"}` },
                ]}
            />

            <div className='account-note mt3'>
                <span className='p-float-label'>
                    <InputTextarea
                        id='account-memo'
                        value={accountNote.note}
                        onChange={(e) =>
                            (store.accountNote = { ...accountNote, note: e.target.value })
                        }
                        className='account-note__input'
                    />
                    <label htmlFor='account-memo'>Account Memo</label>
                </span>
                <Button
                    severity={!!accountNote.note ? "success" : "secondary"}
                    className='account-note__button'
                    label='Save'
                    disabled={!accountNote.note}
                    onClick={() => handleSaveNote("note")}
                />
            </div>
            <div className='account-note mt-3'>
                <span className='p-float-label'>
                    <InputTextarea
                        id='account-payment'
                        value={accountNote.alert}
                        onChange={(e) =>
                            (store.accountNote = { ...accountNote, alert: e.target.value })
                        }
                        className='account-note__input'
                    />
                    <label htmlFor='account-payment'>Payment Alert</label>
                </span>
                <Button
                    severity={!!accountNote.alert ? "success" : "secondary"}
                    className='account-note__button'
                    disabled={!accountNote.alert}
                    label='Save'
                    onClick={() => handleSaveNote("alert")}
                />
            </div>
        </div>
    );
});
