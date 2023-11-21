import { authorizedUserApiInstance } from "http/index";

export interface Task {
    accountnumber: string;
    accountuid: string;
    contactname: string;
    contactuid: string;
    created: string;
    deadline: string;
    dealuid: string;
    description: string;
    index: number;
    itemuid: string;
    parentuid: string;
    phone: string;
    task_status: string;
    taskname: string;
    updated: string;
    username: string;
    useruid: string;
}

export const getTasksByUserId = async (uid: string): Promise<Task[]> => {
    const response = await authorizedUserApiInstance
        .get(`tasks/${uid}/list`)
        .then((response) => response.data)
        .catch((err) => err.response.data);
    return response;
};

export const createTask = async (
    taskData: Record<string, string | number>,
    taskuid?: string | undefined
) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(
            `tasks/${taskuid || 0}/`,
            taskData
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const deleteTask = async (taskIndex: number) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`tasks/${taskIndex}/delete`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const setTaskStatus = async (taskuid: string, taskStatus: "completed") => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`tasks/${taskuid || 0}/status`, {
            task_status: taskStatus,
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
