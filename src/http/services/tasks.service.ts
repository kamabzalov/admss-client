import { authorizedUserApiInstance } from "http/index";

export const getTasksByUserId = async (uid: string) => {
    const response = await authorizedUserApiInstance
        .get(`tasks/${uid}/list`)
        .then((response) => response.data)
        .catch((err) => err.response.data);
    return response;
};
