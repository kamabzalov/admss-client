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
