import { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { Task, getTasksByUserId } from "http/services/tasks.service";

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    useEffect(() => {
        const authUser: AuthUser = getKeyValue("admss-client-app-user");
        if (authUser) {
            getTasksByUserId(authUser.useruid).then((response) => setTasks(response.splice(0, 5)));
            // eslint-disable-next-line no-console
            console.log(tasks);
        }
    }, []);
    return (
        <>
            <h2 className='card-content__title uppercase'>Tasks</h2>
            <ul className='list-none ml-0 pl-0'>
                {tasks.map((task) => (
                    <li key={task.itemuid} className='mb-2'>
                        <label className='ml-2'>
                            {task.taskname && `${task.taskname} - `}
                            {task.description && `${task.description} - `}
                            {task.username}
                        </label>
                    </li>
                ))}
            </ul>
            <span className='add-task-control font-semibold cursor-pointer'>
                <i className='pi pi-plus add-task-control__icon'></i>
                Add new task
            </span>
        </>
    );
};
