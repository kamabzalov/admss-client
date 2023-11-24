import { useEffect, useRef, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { Task, TaskStatus, getTasksByUserId, setTaskStatus } from "http/services/tasks.service";
import { AddTaskDialog } from "./add-task-dialog";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddTaskDialog, setShowAddTaskDialog] = useState<boolean>(false);
    const [showEditTaskDialog, setShowEditTaskDialog] = useState<boolean>(false);
    const [checkboxDisabled, setCheckboxDisabled] = useState<boolean>(false);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);

    const toast = useRef<Toast>(null);

    const authUser: AuthUser = getKeyValue("admss-client-app-user");

    const getTasks = () =>
        authUser &&
        getTasksByUserId(authUser.useruid).then((response) => setTasks(response.splice(0, 5)));

    useEffect(() => {
        if (authUser) {
            getTasks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddTaskClick = () => {
        setShowAddTaskDialog(true);
    };

    const handleAddTaskDialogHide = () => {
        setShowAddTaskDialog(false);
    };
    const handleEditTaskDialogHide = () => {
        setShowEditTaskDialog(false);
    };

    const handleTaskStatusChange = (taskuid: string, taskStatus: TaskStatus) => {
        setCheckboxDisabled(true);
        confirm(taskuid, taskStatus);
    };

    const handleEditTask = (task: Task) => {
        setCurrentTask(task);
        setShowEditTaskDialog(true);
    };

    const accept = (taskuid: string, taskStatus: TaskStatus) => {
        const newStatus =
            taskStatus === TaskStatus.COMPLETED ? TaskStatus.DEFAULT : TaskStatus.COMPLETED;
        const detail = `The task marked as ${
            taskStatus === TaskStatus.COMPLETED ? "uncompleted" : "completed"
        }.`;
        setTaskStatus(taskuid, newStatus)
            .then((res) => {
                if (res.status === "OK" && toast.current != null) {
                    toast.current.show({
                        severity: "info",
                        summary: "Confirmed",
                        detail,
                        life: 3000,
                    });
                    getTasks();
                }
            })
            .finally(() => {
                setCheckboxDisabled(false);
            });
    };

    const reject = () => {
        if (toast.current != null) {
            toast.current.show({
                severity: "warn",
                summary: "Rejected",
                detail: "Action canceled!",
                life: 3000,
            });
            setCheckboxDisabled(false);
        }
    };

    const confirm = (taskuid: string, taskStatus: TaskStatus) => {
        const message = `Are you sure you want to mark the task as ${
            taskStatus === TaskStatus.COMPLETED ? "uncompleted" : "completed"
        }?`;
        confirmDialog({
            message,
            icon: "pi pi-exclamation-triangle",
            accept: () => accept(taskuid, taskStatus),
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
                            checked={task.task_status === TaskStatus.COMPLETED}
                            onChange={() => handleTaskStatusChange(task.itemuid, task.task_status)}
                        />
                        <label
                            className='ml-2 cursor-pointer hover:text-primary'
                            onClick={() => handleEditTask(task)}
                        >
                            {task.taskname ||
                                `${task.description} ${task.username ?? `- ${task.username}`}`}
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
                <ConfirmDialog />
                <AddTaskDialog
                    visible={showAddTaskDialog}
                    onHide={handleAddTaskDialogHide}
                    header='Add Task'
                />
                {currentTask && (
                    <AddTaskDialog
                        visible={showEditTaskDialog}
                        onHide={handleEditTaskDialogHide}
                        currentTask={currentTask}
                        header='Edit Task'
                    />
                )}
            </div>

            <Toast ref={toast} />
        </>
    );
};
