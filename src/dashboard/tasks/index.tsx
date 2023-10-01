import { useEffect } from "react";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { getTasksByUserId } from "http/services/tasks.service";

export const Tasks = () => {
    useEffect(() => {
        const authUser: AuthUser = getKeyValue("admss-client-app-user");
        if (authUser) {
            // eslint-disable-next-line no-console
            getTasksByUserId(authUser.useruid).then((response) => console.log(response));
        }
    }, []);
    return (
        <>
            <h2 className='card-content__title uppercase'>Tasks</h2>
            <ul className='list-none ml-0 pl-0'>
                <li className='mb-2'>
                    {/*<Checkbox></Checkbox>*/}
                    <label className='ml-2'>Add new arrivals to inventory</label>
                </li>
                <li className='mb-2'>
                    {/*<Checkbox></Checkbox>*/}
                    <label className='ml-2'>Complete all daily tasks</label>
                </li>
                <li className='mb-2'>
                    {/*<Checkbox></Checkbox>*/}
                    <label className='ml-2'>Complete all daily tasks</label>
                </li>
                <li className='mb-2'>
                    {/*<Checkbox></Checkbox>*/}
                    <label className='ml-2'>Create new tasks</label>
                </li>
            </ul>
            <span className='add-task-control font-semibold cursor-pointer'>
                <i className='pi pi-plus add-task-control__icon'></i>
                Add new task
            </span>
        </>
    );
};
