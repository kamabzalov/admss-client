// TODO: Temporary solution: remove client-side password encryption logic.
// TODO: Need to migrate to a server-side token-based implementation.

const getEncryptionKey = (): string => {
    const domain = window.location.hostname;
    const appName = process.env.REACT_APP_TYPE;
    return `${domain}-${appName}`;
};

export const encryptPassword = (password: string): string => {
    try {
        const key = getEncryptionKey();
        let encrypted = "";

        for (let i = 0; i < password.length; i++) {
            const charCode = password.charCodeAt(i);
            const keyCharCode = key.charCodeAt(i % key.length);
            const encryptedChar = charCode ^ keyCharCode;
            encrypted += String.fromCharCode(encryptedChar);
        }

        return btoa(encrypted);
    } catch {
        return "";
    }
};

export const decryptPassword = (encryptedPassword: string): string => {
    try {
        if (!encryptedPassword) {
            return "";
        }

        const decoded = atob(encryptedPassword);
        const key = getEncryptionKey();
        let decrypted = "";

        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i);
            const keyCharCode = key.charCodeAt(i % key.length);
            const decryptedChar = charCode ^ keyCharCode;
            decrypted += String.fromCharCode(decryptedChar);
        }

        return decrypted;
    } catch {
        return "";
    }
};
