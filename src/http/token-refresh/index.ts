import { getKeyValue, setKey } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser, RefreshTokenRequest, RefreshTokenResponse } from "common/models/user";
import { Status } from "common/models/base-response";
import { BaseResponseError } from "common/models/base-response";
import { typeGuards } from "common/utils";

type OnTokensUpdated = (data: RefreshTokenResponse) => void;
type RefreshApi = (
    data: RefreshTokenRequest
) => Promise<RefreshTokenResponse | BaseResponseError | undefined>;

let onTokensUpdated: OnTokensUpdated | null = null;
let refreshApi: RefreshApi | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function registerAuthProviderUpdate(callback: OnTokensUpdated | null): void {
    onTokensUpdated = callback;
}

export function setRefreshApi(fn: RefreshApi | null): void {
    refreshApi = fn;
}

export async function refreshAccessTokenIfNeeded(): Promise<boolean> {
    const stored = getKeyValue(LS_APP_USER) as AuthUser | null;
    if (!stored?.refresh_token || !stored?.sessionuid || !refreshApi) {
        return false;
    }

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async (): Promise<boolean> => {
        try {
            const result = await refreshApi!({
                refresh_token: stored.refresh_token!,
                sessionuid: stored.sessionuid!,
            });

            if (
                result &&
                result.status === Status.OK &&
                typeGuards.isExist(result as RefreshTokenResponse) &&
                typeGuards.isString((result as RefreshTokenResponse).token)
            ) {
                const data = result as RefreshTokenResponse;
                const updatedUser: AuthUser = {
                    ...stored,
                    token: data.token,
                    refresh_token: data.refresh_token,
                    refresh_token_expires_in: data.refresh_token_expires_in,
                    expires_in: data.expires_in,
                    sessionuid: data.sessionuid,
                };
                setKey(LS_APP_USER, JSON.stringify(updatedUser));
                onTokensUpdated?.(data);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}
