import { useEffect, useRef, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { Task, deleteTask, getTasksByUserId } from "http/services/tasks.service";
import { AddTaskDialog } from "./add-task-dialog";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddTaskDialog, setShowAddTaskDialog] = useState<boolean>(false);
    const [checkedId, setCheckedId] = useState<number | null>(null);
    const [checkboxDisabled, setChechboxDisabled] = useState<boolean>(false);

    const toast = useRef<Toast>(null);

    const authUser: AuthUser = getKeyValue("admss-client-app-user");

    useEffect(() => {
        if (authUser) {
            getTasksByUserId(authUser.useruid).then((response) => setTasks(response.splice(0, 5)));
        }
    }, []);

    const handleAddTaskClick = () => {
        setShowAddTaskDialog(true);
    };

    const handleAddTaskDialogHide = () => {
        setShowAddTaskDialog(false);
    };

    const handleDeleteTask = (taskIndex: number) => {
        setCheckedId(taskIndex);
        setChechboxDisabled(true);
        confirm(taskIndex);
    };

    const accept = (taskIndex: number) => {
        deleteTask(taskIndex)
            .then((res) => {
                if (res.status === "OK" && toast.current != null) {
                    toast.current.show({
                        severity: "info",
                        summary: "Confirmed",
                        detail: "Task completed and deleted.",
                        life: 3000,
                    });
                    getTasksByUserId(authUser.useruid).then((response) =>
                        setTasks(response.splice(0, 5))
                    );
                }
            })
            .finally(() => {
                setChechboxDisabled(false);
                setCheckedId(null);
            });
    };

    const reject = () => {
        if (toast.current != null) {
            toast.current.show({
                severity: "warn",
                summary: "Rejected",
                detail: "Task not completed!",
                life: 3000,
            });
            setChechboxDisabled(false);
            setCheckedId(null);
        }
    };

    const confirm = (taskIndex: number) => {
        confirmDialog({
            message: "Are you sure you want to mark the task as completed and delete it?",
            icon: "pi pi-exclamation-triangle",
            accept: () => accept(taskIndex),
            reject,
        });
    };

    return (
        <>
            <h2 className='card-content__title uppercase'>Tasks</h2>
            <ul className='list-none ml-0 pl-0'>
                {tasks.map((task) => (
                    <li key={`${task.itemuid}-${task.index}`} className='mb-2'>
                        <Checkbox
                            name='task'
                            disabled={checkboxDisabled}
                            checked={checkedId === task.index}
                            onChange={() => handleDeleteTask(task.index)}
                        />
                        <label className='ml-2'>
                            {task.taskname && `${task.taskname} - `}
                            {task.description && `${task.description} - `}
                            {task.username}
                        </label>
                    </li>
                ))}
            </ul>
            <span
                className='add-task-control font-semibold cursor-pointer'
                onClick={handleAddTaskClick}
            >
                <i className='pi pi-plus add-task-control__icon'></i>
                Add new task
            </span>
            <div className='hidden'>
                <Toast ref={toast} />
                <ConfirmDialog />
                <AddTaskDialog
                    visible={showAddTaskDialog}
                    onHide={handleAddTaskDialogHide}
                    header='Add Task'
                />
            </div>
        </>
    );
};
