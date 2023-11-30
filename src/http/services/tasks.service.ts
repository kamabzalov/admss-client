import { QueryParams } from "common/models/query-params";
/* eslint-disable no-unused-vars */
import { authorizedUserApiInstance } from "http/index";

export enum TaskStatus {
    COMPLETED = "Completed",
    STARTED = "Started",
    DEFAULT = "Default",
}

export interface Task {
    accountname: string;
    accountnumber: string;
    accountuid: string;
    contactname: string;
    contactuid: string;
    created: string;
    deadline: string;
    dealname: string;
    dealuid: string;
    description: string;
    index: number;
    itemuid: string;
    parentuid: string;
    phone: string;
    task_status: TaskStatus;
    taskname: string;
    updated: string;
    username: string;
    useruid: string;
}

export interface TaskUser {
    created: string;
    createdbyuid: string;
    updated: string;
    username: string;
    useruid: string;
}

export const getTasksByUserId = async (uid: string, params?: QueryParams): Promise<Task[]> => {
    const response = await authorizedUserApiInstance
        .get(`tasks/${uid}/listcurrent`, {
            params,
        })
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
            `tasks/${taskuid || 0}`,
            taskData
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getTasksUserList = async (useruid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<TaskUser[]>(`user/${useruid}/users`);
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

export const setTaskStatus = async (taskuid: string, taskStatus: TaskStatus) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`tasks/${taskuid || 0}/status`, {
            status: taskStatus,
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
