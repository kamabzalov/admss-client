import { Dialog, DialogProps } from "primereact/dialog";
import "./index.css";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Task, createTask } from "http/services/tasks.service";

export const AddTaskDialog = ({ visible, onHide }: DialogProps) => {
    const [assignTo, setAssignTo] = useState<string>("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [account, setAccount] = useState<string>("");
    const [deal, setDeal] = useState<string>("");
    const [contact, setContact] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [description, setDescription] = useState<string>("");

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

        createTask(taskData).then((response) => {
            // eslint-disable-next-line no-console
            console.log(response);
        });
        onHide();
    };

    const demoDropdownData = [
        "Deep Watermelon",
        "Round Hair Brush",
        "Straight Dog Bone",
        "Thin Cheeseburger",
        "Fat Stick",
        "Double Head",
        "Iron Guard",
    ];

    return (
        <Dialog header='Add Task' className='dialog' visible={visible} onHide={onHide}>
            <div className='flex flex-column row-gap-3 p-4'>
                <Dropdown
                    placeholder='Assign to'
                    value={assignTo}
                    options={demoDropdownData}
                    onChange={(e) => setAssignTo(e.value)}
                />
                <div className='flex flex-column md:flex-row column-gap-3'>
                    <div className='p-inputgroup flex-1'>
                        <Calendar
                            placeholder='Start Date'
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date)}
                        />
                        <span className='p-inputgroup-addon'>
                            <i className='pi pi-calendar'></i>
                        </span>
                    </div>
                    <div className='p-inputgroup flex-1'>
                        <Calendar
                            placeholder='Due Date'
                            value={dueDate}
                            onChange={(e) => setDueDate(e.value as Date)}
                        />
                        <span className='p-inputgroup-addon'>
                            <i className='pi pi-calendar'></i>
                        </span>
                    </div>
                </div>
                <div className='p-inputgroup flex-1'>
                    <InputText
                        placeholder='Account'
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                    />
                    <span className='p-inputgroup-addon'>
                        <i className='pi pi-search'></i>
                    </span>
                </div>
                <div className='p-inputgroup flex-1'>
                    <InputText
                        placeholder='Deal'
                        value={deal}
                        onChange={(e) => setDeal(e.target.value)}
                    />
                    <span className='p-inputgroup-addon'>
                        <i className='pi pi-search'></i>
                    </span>
                </div>
                <div className='p-inputgroup flex-1'>
                    <InputText
                        placeholder='Contact'
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                    />
                    <span className='p-inputgroup-addon'>
                        <i className='pi pi-search'></i>
                    </span>
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
                    className='h-8rem'
                />
            </div>

            <div className='p-dialog-footer flex justify-content-center'>
                <Button label='Save' className='w-4' onClick={handleSaveTaskData} />
            </div>
        </Dialog>
    );
};
