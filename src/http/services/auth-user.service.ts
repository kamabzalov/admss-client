import { authorizedUserApiInstance } from '../index';

export const getExtendedData = async (uid: string) => {
    try {
        await authorizedUserApiInstance.get(`user/${uid}/info`);
        return true;
    } catch (error) {
        // TODO: add error handler
        console.log(error);
    }
};
