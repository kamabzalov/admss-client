export const setKey = (key: string, value: string) => {
    localStorage.setItem(key, value);
};

export const clear = () => {
    localStorage.clear();
};

export const getKeyValue = (key: string) => {
    const valueByKey = localStorage.getItem(key);
    if (valueByKey) {
        return JSON.parse(valueByKey);
    }
    return null;
};
