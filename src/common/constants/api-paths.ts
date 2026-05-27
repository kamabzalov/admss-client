export const API_PATH_USER_REFRESH = "user/refresh";
export const API_PATH_MEDIA_LOGO = "logo";

export const getMediaUserLogoPath = (useruid: string): string =>
    `media/${useruid}/${API_PATH_MEDIA_LOGO}`;

export const isRefreshApiPath = (url: string): boolean =>
    String(url).includes(API_PATH_USER_REFRESH);

export const isUserLogoApiPath = (url: string): boolean =>
    String(url).endsWith(`/${API_PATH_MEDIA_LOGO}`);
