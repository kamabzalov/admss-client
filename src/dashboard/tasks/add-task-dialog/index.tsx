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

const initializeTaskState = (task?: Task): Partial<PostDataTask> => ({
    startdate: formatDateForServer(task?.startdate ? new Date(task.startdate) : new Date()),
    deadline: formatDateForServer(task?.deadline ? new Date(task.deadline) : new Date()),
    useruid: task?.useruid || "",
    accountuid: task?.accountname || task?.accountuid || "",
    dealuid: task?.dealname || task?.dealuid || "",
    contactuid: task?.contactname || task?.contactuid || "",
    phone: task?.phone || "",
    description: task?.description || "",
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

    const [taskState, setTaskState] = useState<Partial<PostDataTask>>(initializeTaskState());
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
            setTaskState(initializeTaskState());
            setDateError("");
            setAssignToData(null);
        }
    }, [visible]);

    const validateDates = (start: string, due: string) => {
        if (new Date(start) > new Date(due)) {
            setDateError("Start Date must be before Due Date");
            return false;
        }
        setDateError("");
        return true;
    };

    const handleDateChange = (key: "startdate" | "deadline", date: Date) => {
        const formattedDate = formatDateForServer(date);
        if (
            (key === "startdate" && validateDates(formattedDate, taskState.deadline || "")) ||
            (key === "deadline" && validateDates(taskState.startdate || "", formattedDate))
        ) {
            setTaskState((prev) => ({ ...prev, [key]: formattedDate }));
        }
    };

    const handleInputChange = (key: keyof PostDataTask, value: string) => {
        setTaskState((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveTaskData = async () => {
        if (!validateDates(taskState.startdate || "", taskState.deadline || "")) return;

        const response = await createTask(taskState, currentTask?.itemuid);

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
            buttonDisabled={!taskState.description?.trim() || !!dateError}
        >
            <>
                <Dropdown
                    placeholder='Assign to'
                    value={taskState.useruid || ""}
                    options={assignToData || []}
                    optionLabel='username'
                    optionValue='useruid'
                    className='flex align-items-center'
                    onChange={(e) => handleInputChange("useruid", e.value)}
                />

                <div className='flex flex-column md:flex-row column-gap-3 relative'>
                    <div className='p-inputgroup'>
                        <DateInput
                            value={new Date(taskState.startdate || formatDateForServer(new Date()))}
                            date={new Date(taskState.startdate || formatDateForServer(new Date()))}
                            name='Start Date'
                            showTime
                            hourFormat='12'
                            onChange={(e) => handleDateChange("startdate", e.value as Date)}
                        />
                    </div>
                    <div className='p-inputgroup'>
                        <DateInput
                            value={new Date(taskState.deadline || formatDateForServer(new Date()))}
                            date={new Date(taskState.deadline || formatDateForServer(new Date()))}
                            name='Due Date'
                            showTime
                            hourFormat='12'
                            onChange={(e) => handleDateChange("deadline", e.value as Date)}
                        />
                    </div>
                    {dateError && <small className='p-error'>{dateError}</small>}
                </div>

                <AccountSearch
                    value={taskState.accountuid || ""}
                    onChange={(e) => handleInputChange("accountuid", e.target.value)}
                    onRowClick={(value) => handleInputChange("accountuid", value)}
                    name='Account (optional)'
                />

                <DealSearch
                    value={taskState.dealuid || ""}
                    onChange={(e) => handleInputChange("dealuid", e.target.value)}
                    onRowClick={(value) => handleInputChange("dealuid", value)}
                    name='Deal (optional)'
                />

                <CompanySearch
                    value={taskState.contactuid || ""}
                    onChange={(e) => handleInputChange("contactuid", e.target.value)}
                    onRowClick={(value) => handleInputChange("contactuid", value)}
                    name='Contact'
                />
                <InputMask
                    type='tel'
                    mask='999-999-9999'
                    placeholder='Phone Number (optional)'
                    value={taskState.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target?.value || "")}
                />
                <InputTextarea
                    placeholder='Description (required)'
                    required
                    value={taskState.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className='p-dialog-description'
                />
            </>
        </DashboardDialog>
    );
};
