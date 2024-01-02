import { DialogProps } from "primereact/dialog";
import "./index.css";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Task, TaskUser, createTask, getTasksUserList } from "http/services/tasks.service";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { DashboardDialog } from "dashboard/common/dialog";
import { LS_APP_USER } from "common/constants/localStorage";

const DialogIcon = ({ icon }: { icon: "search" | string }) => {
    return (
        <span className='p-inputgroup-addon'>
            <i className={`adms-${icon}`} />
        </span>
    );
};

interface AddTaskDialogProps extends DialogProps {
    currentTask?: Task;
}

export const AddTaskDialog = ({ visible, onHide, header, currentTask }: AddTaskDialogProps) => {
    const [assignTo, setAssignTo] = useState<string>(currentTask?.accountuid || "");
    const [startDate, setStartDate] = useState<Date | null>((currentTask?.created as any) || null);
    const [dueDate, setDueDate] = useState<Date | null>((currentTask?.deadline as any) || null);
    const [account, setAccount] = useState<string>(currentTask?.accountname || "");
    const [deal, setDeal] = useState<string>(currentTask?.dealname || "");
    const [contact, setContact] = useState<string>(currentTask?.contactname || "");
    const [phoneNumber, setPhoneNumber] = useState<string>(currentTask?.phone || "");
    const [description, setDescription] = useState<string>(currentTask?.description || "");
    const [assignToData, setAssignToData] = useState<TaskUser[] | null>(null);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser && visible) {
            getTasksUserList(authUser.useruid).then((response) => {
                if (response) setAssignToData(response);
            });
        }
    }, [visible]);

    const handleSaveTaskData = () => {
        const taskData: any = {
            assignTo,
            startDate,
            dueDate,
            account,
            deal,
            contact,
            phoneNumber,
            description,
        };

        createTask(taskData).then((response) => {});
        onHide();
    };

    return (
        <DashboardDialog
            onHide={onHide}
            visible={visible}
            header={header}
            className={"dialog__add-task "}
            footer='Save'
            action={handleSaveTaskData}
        >
            <>
                {assignToData && (
                    <Dropdown
                        placeholder='Assign to'
                        value={assignTo}
                        options={assignToData}
                        optionLabel={"username"}
                        className='flex align-items-center'
                        onChange={(e) => setAssignTo(e.value)}
                    />
                )}
                <div className='flex flex-column md:flex-row column-gap-3'>
                    <div className='p-inputgroup flex-1'>
                        <Calendar
                            placeholder='Start Date'
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date)}
                        />
                        <DialogIcon icon='support-history' />
                    </div>
                    <div className='p-inputgroup flex-1'>
                        <Calendar
                            placeholder='Due Date'
                            value={dueDate}
                            onChange={(e) => setDueDate(e.value as Date)}
                        />
                        <DialogIcon icon='support-history' />
                    </div>
                </div>
                <div className='p-inputgroup flex-1'>
                    <InputText
                        placeholder='Account'
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                    />
                    <DialogIcon icon='search' />
                </div>
                <div className='p-inputgroup flex-1'>
                    <InputText
                        placeholder='Deal'
                        value={deal}
                        onChange={(e) => setDeal(e.target.value)}
                    />
                    <DialogIcon icon='search' />
                </div>
                <div className='p-inputgroup flex-1'>
                    <InputText
                        placeholder='Contact'
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                    />
                    <DialogIcon icon='search' />
                </div>
                <InputText
                    placeholder='Phone Number'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <InputTextarea
                    placeholder='Description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className='p-dialog-description'
                />
            </>
        </DashboardDialog>
    );
};
