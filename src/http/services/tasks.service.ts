import { isAxiosError } from "axios";
import { BaseResponseError, Status, TotalListCount } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { Alert, News, PostDataTask, Task, TaskStatus, TaskUser } from "common/models/tasks";

import { ApiRequest, authorizedUserApiInstance } from "http/index";

export const getAllTasks = async (useruid: string, params?: QueryParams) => {
    try {
        const response = await authorizedUserApiInstance
            .get<Task[] & BaseResponseError>(`tasks/${useruid}/list`, {
                params,
            })
            .then((response) => response.data)
            .catch((err) => err.response.data);
        return response;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting tasks",
            };
        }
    }
};

export const getCurrentUserTasks = async (useruid: string, params?: QueryParams) => {
    try {
        const response = await authorizedUserApiInstance
            .get<Task[] & BaseResponseError>(`tasks/${useruid}/listcurrent`, {
                params,
            })
            .then((response) => response.data)
            .catch((err) => err.response.data);
        return response;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting current user tasks",
            };
        }
    }
};

export const createTask = async (taskData: Partial<PostDataTask>, taskuid?: string | undefined) => {
    return new ApiRequest().post({
        url: `tasks/${taskuid || 0}/set`,
        data: taskData,
        defaultError: `Error while ${taskuid ? "update" : "create"} task`,
    });
};

export const getTasksUserList = async (useruid: string) => {
    return new ApiRequest().get<TaskUser[]>({
        url: `user/${useruid}/users`,
        defaultError: "Error while getting tasks user list",
    });
};

export const getTasksSubUserList = async (useruid: string) => {
    return new ApiRequest().get<TaskUser[]>({
        url: `user/${useruid || 0}/subusers`,
        defaultError: "Error while getting tasks sub user list",
    });
};

export const deleteTask = async (taskIndex: number) => {
    return new ApiRequest().post({
        url: `tasks/${taskIndex}/delete`,
        defaultError: "Error while deleting task",
    });
};

export const setTaskStatus = async (taskuid: string, taskStatus: TaskStatus) => {
    return new ApiRequest().post({
        url: `tasks/${taskuid || 0}/status`,
        data: { status: taskStatus },
        defaultError: `Error while set task status to ${taskStatus}`,
    });
};

export const getLatestNews = async (userid: string, params?: QueryParams) => {
    return new ApiRequest().get<TotalListCount | News[]>({
        url: `tasks/${userid}/listnews`,
        config: { params },
        defaultError: "Error while getting latest news",
    });
};

export const markNewsAsRead = async (newsuid: string) => {
    return new ApiRequest().post({
        url: `tasks/${newsuid}/readnews`,
        defaultError: "Error while marking news as read",
    });
};

export const getAlerts = async (useruid: string) => {
    return new ApiRequest().get<Alert[]>({
        url: `tasks/${useruid}/listalerts`,
        defaultError: "Error while getting alerts",
    });
};

export const setAlert = async (alertuid: string) => {
    return new ApiRequest().post({
        url: `tasks/${alertuid}/setalert`,
        defaultError: "Error while setting alert",
    });
};

export const FOR_TESTING_deleteAlert = async (alertuid: string) => {
    return new ApiRequest().post({
        url: `tasks/${alertuid}/deletealert`,
        defaultError: "Error while deleting alert",
    });
};

export const FOR_TESTING_createAlert = async (useruid: string, data: Partial<Alert>) => {
    return new ApiRequest().post<Alert>({
        url: `tasks/${useruid}/createalert`,
        data,
        defaultError: "Error while creating alert",
    });
};
