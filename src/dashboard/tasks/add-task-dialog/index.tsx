import { DialogProps } from "primereact/dialog";
import "./index.css";
import { useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { createTask, getTasksSubUserList } from "http/services/tasks.service";
import { DashboardDialog } from "dashboard/common/dialog";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { DateInput } from "dashboard/common/form/inputs";
import { InputMask } from "primereact/inputmask";
import { useStore } from "store/hooks";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { DealSearch } from "dashboard/deals/common/deal-search";
import { AccountSearch } from "dashboard/accounts/common/account-search";
import { PostDataTask, Task, TaskUser } from "common/models/tasks";

interface AddTaskDialogProps extends DialogProps {
    currentTask?: Task;
    onAction?: () => void;
}

export const AddTaskDialog = ({
    visible,
    onHide,
    header,
    currentTask,
    onAction,
}: AddTaskDialogProps) => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [assignTo, setAssignTo] = useState<string>(currentTask?.useruid || "");
    const [startDate, setStartDate] = useState<Date>(
        currentTask?.startdate ? new Date(currentTask.startdate) : new Date()
    );
    const [dueDate, setDueDate] = useState<Date>(
        currentTask?.deadline ? new Date(currentTask.deadline) : new Date()
    );
    const [account, setAccount] = useState<string>(currentTask?.accountname || "");
    const [deal, setDeal] = useState<string>(currentTask?.dealname || "");
    const [contact, setContact] = useState<string>(currentTask?.contactname || "");
    const [phoneNumber, setPhoneNumber] = useState<string>(currentTask?.phone || "");
    const [description, setDescription] = useState<string>(currentTask?.description || "");
    const [assignToData, setAssignToData] = useState<TaskUser[] | null>(null);
    const [dateError, setDateError] = useState<string>("");
    const toast = useToast();

    useEffect(() => {
        if (authUser && visible) {
            getTasksSubUserList(authUser.useruid).then((response) => {
                if (response && Array.isArray(response)) setAssignToData(response);
            });
            setAssignTo(currentTask?.useruid || "");
            setStartDate(currentTask?.startdate ? new Date(currentTask.startdate) : new Date());
            setDueDate(currentTask?.deadline ? new Date(currentTask.deadline) : new Date());
            setAccount(currentTask?.accountname || currentTask?.accountuid || "");
            setDeal(currentTask?.dealname || currentTask?.dealuid || "");
            setContact(currentTask?.contactname || currentTask?.contactuid || "");
            setPhoneNumber(currentTask?.phone || "");
            setDescription(currentTask?.description || "");
        }
        return () => {
            setAssignToData(null);
            setAssignTo("");
            setStartDate(new Date());
            setDueDate(new Date());
            setAccount("");
            setDeal("");
            setContact("");
            setPhoneNumber("");
            setDescription("");
            setDateError("");
        };
    }, [visible, currentTask]);

    const validateDates = (start: Date, due: Date) => {
        if (start > due) {
            setDateError("Start Date must be before Due Date");
            return false;
        }
        setDateError("");
        return true;
    };

    const handleStartDateChange = (date: Date) => {
        if (validateDates(date, dueDate)) {
            setStartDate(date);
        }
    };

    const handleDueDateChange = (date: Date) => {
        if (validateDates(startDate, date)) {
            setDueDate(date);
        }
    };

    const handleSaveTaskData = async () => {
        if (!validateDates(startDate, dueDate)) return;

        const taskData: Partial<PostDataTask> = {
            useruid: assignTo,
            startdate: startDate.toString(),
            deadline: dueDate.toString(),
            accountuid: account,
            dealuid: deal,
            contactuid: contact,
            phone: phoneNumber,
            description,
        };

        const response = await createTask(taskData, currentTask?.itemuid);

        if (response && response?.status === Status.ERROR) {
            return toast.current?.show({
                severity: "error",
                summary: Status.ERROR,
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Task created successfully!",
                life: TOAST_LIFETIME,
            });
        }
        onHide();
        onAction?.();
    };

    return (
        <DashboardDialog
            position='top'
            onHide={onHide}
            visible={visible}
            header={header}
            className={"dialog__add-task"}
            footer='Save'
            action={handleSaveTaskData}
            buttonDisabled={!description.trim() || !!dateError}
        >
            <>
                <Dropdown
                    placeholder='Assign to'
                    value={assignTo}
                    options={assignToData || []}
                    optionLabel={"username"}
                    optionValue={"useruid"}
                    className='flex align-items-center'
                    onChange={(e) => {
                        return setAssignTo(e.value.username);
                    }}
                />

                <div className='flex flex-column md:flex-row column-gap-3 relative'>
                    <div className='p-inputgroup'>
                        <DateInput
                            value={startDate}
                            date={startDate}
                            name='Start Date'
                            showTime
                            hourFormat='12'
                            onChange={(e) => handleStartDateChange(e.value as Date)}
                        />
                    </div>
                    <div className='p-inputgroup'>
                        <DateInput
                            value={dueDate}
                            date={dueDate}
                            name='Due Date'
                            showTime
                            hourFormat='12'
                            onChange={(e) => handleDueDateChange(e.value as Date)}
                        />
                    </div>
                    {dateError && <small className='p-error'>{dateError}</small>}
                </div>

                <AccountSearch
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    onRowClick={(value) => setAccount(value)}
                    name='Account (optional)'
                />

                <DealSearch
                    value={deal}
                    onChange={(e) => setDeal(e.target.value)}
                    onRowClick={(value) => setDeal(value)}
                    name='Deal (optional)'
                />

                <CompanySearch
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    onRowClick={(value) => setContact(value)}
                    name='Contact'
                />
                <InputMask
                    type='tel'
                    mask='999-999-9999'
                    placeholder='Phone Number (optional)'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target?.value || "")}
                />
                <InputTextarea
                    placeholder='Description (required)'
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className='p-dialog-description'
                />
            </>
        </DashboardDialog>
    );
};
