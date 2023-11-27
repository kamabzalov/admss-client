import { useEffect, useRef, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { Task, TaskStatus, getTasksByUserId, setTaskStatus } from "http/services/tasks.service";
import { AddTaskDialog } from "./add-task-dialog";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddTaskDialog, setShowAddTaskDialog] = useState<boolean>(false);
    const [showEditTaskDialog, setShowEditTaskDialog] = useState<boolean>(false);
    const [checkboxDisabled, setCheckboxDisabled] = useState<boolean>(false);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [checkboxStates, setCheckboxStates] = useState<{ [key: string]: boolean }>({});

    const toast = useRef<Toast>(null);

    const authUser: AuthUser = getKeyValue("admss-client-app-user");

    const getTasks = () =>
        authUser &&
        getTasksByUserId(authUser.useruid, { top: 5 }).then((response) => setTasks(response));

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

    const handleEditTask = (task: Task) => {
        setCurrentTask(task);
        setShowEditTaskDialog(true);
    };

    const handleTaskStatusChange = (taskuid: string) => {
        setCheckboxStates((prevStates) => ({
            ...prevStates,
            [taskuid]: true,
        }));
        setCheckboxDisabled(true);

        setTimeout(() => {
            setTaskStatus(taskuid, TaskStatus.COMPLETED)
                .then((res) => {
                    if (res.status === "OK" && toast.current != null) {
                        toast.current.show({
                            severity: "info",
                            summary: "Confirmed",
                            detail: "The task marked as completed",
                            life: 3000,
                        });
                        getTasks();
                    }
                })
                .finally(() => {
                    setCheckboxStates((prevStates) => ({
                        ...prevStates,
                        [taskuid]: false,
                    }));
                    setCheckboxDisabled(false);
                });
        }, 1000);
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
                            checked={checkboxStates[task.itemuid] || false}
                            onChange={() => handleTaskStatusChange(task.itemuid)}
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
