import { DialogProps } from "primereact/dialog";
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
import { formatDateForServer } from "common/helpers";
import "./index.css";

interface AddTaskDialogProps extends DialogProps {
    currentTask?: Task;
    onAction?: () => void;
}

const initializeTaskState = (task?: Task, reset: boolean = false) => ({
    assignTo: reset ? "" : task?.useruid || "",
    startDate: reset ? new Date() : task?.startdate ? new Date(task.startdate) : new Date(),
    dueDate: reset ? new Date() : task?.deadline ? new Date(task.deadline) : new Date(),
    account: reset ? "" : task?.accountname || task?.accountuid || "",
    deal: reset ? "" : task?.dealname || task?.dealuid || "",
    contact: reset ? "" : task?.contactname || task?.contactuid || "",
    phoneNumber: reset ? "" : task?.phone || "",
    description: reset ? "" : task?.description || "",
});

export const AddTaskDialog = ({
    visible,
    onHide,
    header,
    currentTask,
    onAction,
}: AddTaskDialogProps) => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const toast = useToast();

    const [taskState, setTaskState] = useState(() => initializeTaskState(currentTask));
    const [assignToData, setAssignToData] = useState<TaskUser[] | null>(null);
    const [dateError, setDateError] = useState<string>("");

    useEffect(() => {
        if (authUser && visible) {
            getTasksSubUserList(authUser.useruid).then((response) => {
                if (response && Array.isArray(response)) setAssignToData(response);
            });
            setTaskState(initializeTaskState(currentTask));
        }
    }, [visible, currentTask]);

    useEffect(() => {
        if (!visible) {
            setTaskState(initializeTaskState(undefined, true));
            setDateError("");
            setAssignToData(null);
        }
    }, [visible]);

    const validateDates = (start: Date, due: Date) => {
        if (start > due) {
            setDateError("Start Date must be before Due Date");
            return false;
        }
        setDateError("");
        return true;
    };

    const handleDateChange = (key: "startDate" | "dueDate", date: Date) => {
        if (
            (key === "startDate" && validateDates(date, taskState.dueDate)) ||
            (key === "dueDate" && validateDates(taskState.startDate, date))
        ) {
            setTaskState((prev) => ({ ...prev, [key]: date }));
        }
    };

    const handleInputChange = (key: keyof typeof taskState, value: string) => {
        setTaskState((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveTaskData = async () => {
        if (!validateDates(taskState.startDate, taskState.dueDate)) return;

        const taskData: Partial<PostDataTask> = {
            useruid: taskState.assignTo,
            startdate: formatDateForServer(taskState.startDate),
            deadline: formatDateForServer(taskState.dueDate),
            accountuid: taskState.account,
            dealuid: taskState.deal,
            contactuid: taskState.contact,
            phone: taskState.phoneNumber,
            description: taskState.description,
        };

        const response = await createTask(taskData, currentTask?.itemuid);

        if (response?.status === Status.ERROR) {
            toast.current?.show({
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
            onHide();
            onAction?.();
        }
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
            buttonDisabled={!taskState.description.trim() || !!dateError}
        >
            <>
                <Dropdown
                    placeholder='Assign to'
                    value={taskState.assignTo}
                    options={assignToData || []}
                    optionLabel='username'
                    optionValue='useruid'
                    className='flex align-items-center'
                    onChange={(e) => {
                        return handleInputChange("assignTo", e.value);
                    }}
                />

                <div className='flex flex-column md:flex-row column-gap-3 relative'>
                    <div className='p-inputgroup'>
                        <DateInput
                            value={taskState.startDate}
                            date={taskState.startDate}
                            name='Start Date'
                            showTime
                            hourFormat='12'
                            onChange={(e) => handleDateChange("startDate", e.value as Date)}
                        />
                    </div>
                    <div className='p-inputgroup'>
                        <DateInput
                            value={taskState.dueDate}
                            date={taskState.dueDate}
                            name='Due Date'
                            showTime
                            hourFormat='12'
                            onChange={(e) => handleDateChange("dueDate", e.value as Date)}
                        />
                    </div>
                    {dateError && <small className='p-error'>{dateError}</small>}
                </div>

                <AccountSearch
                    value={taskState.account}
                    onChange={(e) => handleInputChange("account", e.target.value)}
                    onRowClick={(value) => handleInputChange("account", value)}
                    name='Account (optional)'
                />

                <DealSearch
                    value={taskState.deal}
                    onChange={(e) => handleInputChange("deal", e.target.value)}
                    onRowClick={(value) => handleInputChange("deal", value)}
                    name='Deal (optional)'
                />

                <CompanySearch
                    value={taskState.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    onRowClick={(value) => handleInputChange("contact", value)}
                    name='Contact'
                />
                <InputMask
                    type='tel'
                    mask='999-999-9999'
                    placeholder='Phone Number (optional)'
                    value={taskState.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target?.value || "")}
                />
                <InputTextarea
                    placeholder='Description (required)'
                    required
                    value={taskState.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className='p-dialog-description'
                />
            </>
        </DashboardDialog>
    );
};
