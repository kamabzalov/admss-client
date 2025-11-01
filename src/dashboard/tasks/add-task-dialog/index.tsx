import { DialogProps } from "primereact/dialog";
import { useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { createTask, getTasksSubUserList } from "http/services/tasks.service";
import { DashboardDialog } from "dashboard/common/dialog";
import { Status } from "common/models/base-response";
import { DateInput, PhoneInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { DealSearch } from "dashboard/deals/common/deal-search";
import { AccountSearch } from "dashboard/accounts/common/account-search";
import { PostDataTask, Task, TaskUser } from "common/models/tasks";
import { formatDateForServer, validateDates } from "common/helpers";
import "./index.css";
import { observer } from "mobx-react-lite";
import { ContactUser } from "common/models/contact";
import { Deal } from "common/models/deals";
import { Account } from "common/models/accounts";
import { ComboBox } from "dashboard/common/form/dropdown";
import { useToastMessage } from "common/hooks";
import { ALL_FIELDS } from "common/constants/fields";

enum DATE_TYPE {
    START = "startdate",
    DEADLINE = "deadline",
}

interface AddTaskDialogProps extends DialogProps {
    currentTask?: Task;
    onAction?: () => void;
}

const initializeTaskState = (task?: Task): Partial<PostDataTask> => ({
    startdate: formatDateForServer(task?.startdate ? new Date(task.startdate) : new Date()),
    deadline: formatDateForServer(task?.deadline ? new Date(task.deadline) : new Date()),
    useruid: task?.useruid || "",
    accountuid: task?.accountuid || "",
    accountname: task?.accountname || "",
    dealuid: task?.dealuid || "",
    dealname: task?.dealname || "",
    contactuid: task?.contactuid || "",
    contactname: task?.contactname || "",
    phone: task?.phone || "",
    description: task?.description || "",
});

export const AddTaskDialog = observer(
    ({ visible, onHide, header, currentTask, onAction }: AddTaskDialogProps) => {
        const userStore = useStore().userStore;
        const { authUser } = userStore;
        const { showSuccess, showError } = useToastMessage();
        const [taskState, setTaskState] = useState<Partial<PostDataTask>>(initializeTaskState());
        const [assignToData, setAssignToData] = useState<TaskUser[] | null>(null);
        const [dateError, setDateError] = useState<string>("");
        const [isFormChanged, setIsFormChanged] = useState<boolean>(false);
        const [isSaving, setIsSaving] = useState<boolean>(false);

        const isSubmitDisabled =
            !taskState.description?.trim() ||
            !!dateError ||
            !isFormChanged ||
            isSaving ||
            !taskState.useruid;

        const handleGetTasksSubUserList = async () => {
            const response = await getTasksSubUserList(authUser!.useruid);
            if (response && Array.isArray(response)) setAssignToData(response);
            setTaskState(initializeTaskState(currentTask));
        };

        useEffect(() => {
            if (authUser && visible) {
                handleGetTasksSubUserList();
            }
        }, [visible, currentTask]);

        useEffect(() => {
            if (!visible) {
                setTaskState(initializeTaskState());
                setDateError("");
                setIsFormChanged(false);
                setAssignToData(null);
            }
        }, [visible]);

        const handleDateChange = (key: DATE_TYPE, date: Date) => {
            const formattedDate = formatDateForServer(date);
            if (
                (key === DATE_TYPE.START &&
                    validateDates(formattedDate, taskState.deadline || "")) ||
                (key === DATE_TYPE.DEADLINE &&
                    validateDates(taskState.startdate || "", formattedDate))
            ) {
                setTaskState((prev) => ({ ...prev, [key]: formattedDate }));
                setDateError("");
                setIsFormChanged(true);
            }
        };

        const handleInputChange = (key: keyof PostDataTask, value: string) => {
            setTaskState((prev) => ({ ...prev, [key]: value }));
            setIsFormChanged(true);
        };

        const handleSaveTaskData = async () => {
            if (
                !validateDates(taskState.startdate || "", taskState.deadline || "") ||
                !taskState.useruid
            )
                return;

            const payload: Partial<PostDataTask> = {
                ...taskState,
                accountname: taskState.accountuid ? taskState.accountname : "",
                dealname: taskState.dealuid ? taskState.dealname : "",
                contactname: taskState.contactname,
            };

            setIsSaving(true);

            const response = await createTask(payload, currentTask?.itemuid);

            if (response?.status === Status.ERROR) {
                showError(response.error);
                setDateError("");
            } else {
                showSuccess(`Task ${currentTask ? "updated" : "created"} successfully!`);
                onHide();
                onAction?.();
            }

            setIsSaving(false);
        };

        const handleGetAccountInfo = (account: Account) => {
            handleInputChange("accountuid", account.accountuid);
            handleInputChange("accountname", account.name);
        };

        const handleAccountNameChange = (value: string) => {
            handleInputChange("accountname", value);
            if (taskState.accountuid) {
                handleInputChange("accountuid", "");
            }
        };

        const handleGetCompanyInfo = (contact: ContactUser) => {
            handleInputChange("contactuid", contact.contactuid);
            handleInputChange(
                "contactname",
                contact.companyName ||
                    `${contact.firstName} ${contact.lastName}`.trim() ||
                    contact.userName
            );
        };

        const handleContactNameChange = (value: string) => {
            handleInputChange("contactname", value);
            if (taskState.contactuid) {
                handleInputChange("contactuid", "");
            }
        };

        const handleGetDealInfo = (deal: Deal) => {
            handleInputChange("dealuid", deal.dealuid);
            handleInputChange("dealname", deal.contactinfo);
        };

        const handleDealNameChange = (value: string) => {
            handleInputChange("dealname", value);
            if (taskState.dealuid) {
                handleInputChange("dealuid", "");
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
                buttonDisabled={isSubmitDisabled}
            >
                <>
                    <ComboBox
                        label='Assign to (required)'
                        value={taskState.useruid || authUser?.useruid || ""}
                        options={assignToData || []}
                        optionLabel='username'
                        optionValue='useruid'
                        required
                        className='flex align-items-center'
                        onChange={(e) => handleInputChange("useruid", e.value)}
                    />

                    <div className='flex flex-column md:flex-row column-gap-3 relative'>
                        <div className='p-inputgroup'>
                            <DateInput
                                value={
                                    new Date(taskState.startdate || formatDateForServer(new Date()))
                                }
                                date={
                                    new Date(taskState.startdate || formatDateForServer(new Date()))
                                }
                                name='Start Date'
                                showTime
                                hourFormat='12'
                                onChange={(e) => handleDateChange(DATE_TYPE.START, e.value as Date)}
                            />
                        </div>
                        <div className='p-inputgroup'>
                            <DateInput
                                value={
                                    new Date(taskState.deadline || formatDateForServer(new Date()))
                                }
                                date={
                                    new Date(taskState.deadline || formatDateForServer(new Date()))
                                }
                                name='Due Date'
                                showTime
                                hourFormat='12'
                                onChange={(e) =>
                                    handleDateChange(DATE_TYPE.DEADLINE, e.value as Date)
                                }
                            />
                        </div>
                        {dateError && <small className='p-error'>{dateError}</small>}
                    </div>

                    <AccountSearch
                        value={taskState.accountname?.trim() || ""}
                        returnedField={ALL_FIELDS}
                        getFullInfo={handleGetAccountInfo}
                        onChange={({ target: { value } }) => handleAccountNameChange(value)}
                        name='Account (optional)'
                    />

                    <DealSearch
                        value={taskState.dealname?.trim() || ""}
                        returnedField={ALL_FIELDS}
                        getFullInfo={handleGetDealInfo}
                        onChange={({ target: { value } }) => handleDealNameChange(value)}
                        name='Deal (optional)'
                    />

                    <CompanySearch
                        value={taskState.contactname?.trim() || ""}
                        returnedField={ALL_FIELDS}
                        getFullInfo={handleGetCompanyInfo}
                        onChange={({ target: { value } }) => handleContactNameChange(value)}
                        name='Contact (optional)'
                    />
                    <PhoneInput
                        value={taskState.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        name='Phone Number (optional)'
                        withValidationMessage={false}
                    />
                    <span className='p-float-label relative'>
                        <InputTextarea
                            required
                            value={taskState.description || ""}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className='p-dialog-description'
                        />
                        <label className='float-label'>Description (required)</label>
                    </span>
                </>
            </DashboardDialog>
        );
    }
);
