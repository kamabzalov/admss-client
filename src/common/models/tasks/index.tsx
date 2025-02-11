import { BaseResponseError } from "../base-response";

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
    startdate: string;
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

export interface PostDataTask extends BaseResponseError {
    index: number;
    created: string;
    updated: string;
    startdate: string;
    deadline: string;
    task_status: TaskStatus;
    itemuid: string;
    parentuid: string;
    useruid: string;
    dealuid: string;
    accountuid: string;
    contactuid: string;
    phone: string;
    description: string;
}
