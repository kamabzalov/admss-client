import {
    createContext,
    ReactNode,
    ReactElement,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";
import { AuthUser } from "common/models/user";
import { getKeyValue, localStorageClear } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { typeGuards } from "common/utils";
import { SessionExpiryModal } from "dashboard/common/session-expiry-modal";
import {
    registerAuthProviderUpdate,
    refreshAccessTokenIfNeeded,
    setRefreshApi,
} from "http/token-refresh";
import { RefreshTokenResponse } from "common/models/user";
import { refreshAccessToken, logout as apiLogout } from "http/services/auth.service";
import { LS_LAST_ROUTE, LastRouteData } from "common/constants/localStorage";
import { HOME_PAGE } from "common/constants/links";
import { INACTIVITY_TIMEOUT_SECONDS } from "common/settings";
import { MS_IN_SECOND, SECONDS_IN_MINUTE } from "common/constants/time";

const REFRESH_MARGIN_SECONDS = SECONDS_IN_MINUTE;

interface AuthTokensState {
    accessToken: string | null;
    refreshToken: string | null;
    sessionUid: string | null;
    userUid: string | null;
    expiresAt: number | null;
    refreshExpiresAt: number | null;
}

interface AuthContextValue extends AuthTokensState {
    authUser: AuthUser | null;
    isSessionExpiring: boolean;
    secondsLeft: number;
    login: (user: AuthUser) => void;
    logout: () => void;
    scheduleRefresh: (expiresInSec: number) => void;
    forceRefresh: () => Promise<void>;
    setSessionExpiring: (expiring: boolean, secondsLeft?: number) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const createInitialStateFromStoredUser = (): {
    user: AuthUser | null;
    tokens: AuthTokensState;
} => {
    const storedUser = getKeyValue(LS_APP_USER) as AuthUser | null;
    if (!storedUser) {
        return {
            user: null,
            tokens: {
                accessToken: null,
                refreshToken: null,
                sessionUid: null,
                userUid: null,
                expiresAt: null,
                refreshExpiresAt: null,
            },
        };
    }

    const now = Date.now();
    const expiresAt = typeGuards.isNumber(storedUser.expires_in)
        ? now + storedUser.expires_in * MS_IN_SECOND
        : null;
    const refreshExpiresAt = typeGuards.isNumber(storedUser.refresh_token_expires_in)
        ? now + storedUser.refresh_token_expires_in * MS_IN_SECOND
        : null;

    return {
        user: storedUser,
        tokens: {
            accessToken: storedUser.token || null,
            refreshToken: storedUser.refresh_token || null,
            sessionUid: storedUser.sessionuid || null,
            userUid: storedUser.useruid || null,
            expiresAt,
            refreshExpiresAt,
        },
    };
};

export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
    const initialState = useMemo(() => createInitialStateFromStoredUser(), []);

    const [authUser, setAuthUser] = useState<AuthUser | null>(initialState.user);
    const [tokens, setTokens] = useState<AuthTokensState>(initialState.tokens);
    const [isSessionExpiring, setIsSessionExpiring] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);

    const refreshTimerId = useRef<number | null>(null);
    const countdownIntervalId = useRef<number | null>(null);
    const inactivityTimerId = useRef<number | null>(null);
    const inactivityPreRefreshTimerId = useRef<number | null>(null);
    const inactivityInitializedRef = useRef<boolean>(false);

    const clearRefreshTimer = () => {
        if (refreshTimerId.current !== null) {
            window.clearTimeout(refreshTimerId.current);
            refreshTimerId.current = null;
        }
    };

    const clearCountdownInterval = () => {
        if (countdownIntervalId.current !== null) {
            window.clearInterval(countdownIntervalId.current);
            countdownIntervalId.current = null;
        }
    };

    const startExpiryCountdown = (initialSeconds: number) => {
        const safeInitialSeconds = initialSeconds > 0 ? initialSeconds : 0;
        setIsSessionExpiring(true);
        setSecondsLeft(safeInitialSeconds);

        clearCountdownInterval();
        if (inactivityTimerId.current !== null) {
            window.clearTimeout(inactivityTimerId.current);
            inactivityTimerId.current = null;
        }

        if (!safeInitialSeconds) {
            return;
        }

        countdownIntervalId.current = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(countdownIntervalId.current ?? undefined);
                    countdownIntervalId.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, MS_IN_SECOND);
    };

    const resetInactivityTimer = () => {
        if (!authUser) {
            return;
        }

        if (inactivityTimerId.current !== null) {
            window.clearTimeout(inactivityTimerId.current);
        }
        if (inactivityPreRefreshTimerId.current !== null) {
            window.clearTimeout(inactivityPreRefreshTimerId.current);
        }

        inactivityTimerId.current = window.setTimeout(() => {
            if (!authUser) {
                return;
            }
            startExpiryCountdown(REFRESH_MARGIN_SECONDS);
        }, INACTIVITY_TIMEOUT_SECONDS * MS_IN_SECOND);

        const preRefreshDelayMs = (INACTIVITY_TIMEOUT_SECONDS * MS_IN_SECOND) / 2;

        inactivityPreRefreshTimerId.current = window.setTimeout(() => {
            if (!authUser) {
                return;
            }
            void refreshAccessTokenIfNeeded();
        }, preRefreshDelayMs);
    };

    const login = useCallback((user: AuthUser) => {
        const now = Date.now();
        setAuthUser(user);
        setTokens({
            accessToken: user.token || null,
            refreshToken: user.refresh_token || null,
            sessionUid: user.sessionuid || null,
            userUid: user.useruid || null,
            expiresAt: typeGuards.isNumber(user.expires_in)
                ? now + user.expires_in * MS_IN_SECOND
                : null,
            refreshExpiresAt: typeGuards.isNumber(user.refresh_token_expires_in)
                ? now + user.refresh_token_expires_in * MS_IN_SECOND
                : null,
        });
        setIsSessionExpiring(false);
        setSecondsLeft(0);

        if (typeGuards.isNumber(user.expires_in)) {
            scheduleRefresh(user.expires_in);
        }
    }, []);

    const logout = useCallback(() => {
        setAuthUser(null);
        setTokens({
            accessToken: null,
            refreshToken: null,
            sessionUid: null,
            userUid: null,
            expiresAt: null,
            refreshExpiresAt: null,
        });
        setIsSessionExpiring(false);
        setSecondsLeft(0);
        clearRefreshTimer();
        clearCountdownInterval();
        localStorageClear(LS_APP_USER);
    }, []);

    const performSignOut = useCallback(async () => {
        const currentPath = window.location.pathname + window.location.search;

        if (authUser) {
            const routeData: LastRouteData = {
                path: currentPath,
                timestamp: Date.now(),
                useruid: authUser.useruid,
            };
            localStorage.setItem(LS_LAST_ROUTE, JSON.stringify(routeData));
        }

        if (authUser && tokens.accessToken) {
            await apiLogout(authUser.useruid, tokens.accessToken);
        }

        logout();
        window.location.replace(HOME_PAGE);
    }, [authUser, tokens.accessToken, logout]);

    useEffect(() => {
        const { user, tokens: nextTokens } = createInitialStateFromStoredUser();
        setAuthUser(user);
        setTokens(nextTokens);
    }, []);

    useEffect(() => {
        return () => {
            clearRefreshTimer();
            clearCountdownInterval();
            if (inactivityTimerId.current !== null) {
                window.clearTimeout(inactivityTimerId.current);
                inactivityTimerId.current = null;
            }
            if (inactivityPreRefreshTimerId.current !== null) {
                window.clearTimeout(inactivityPreRefreshTimerId.current);
                inactivityPreRefreshTimerId.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isSessionExpiring && secondsLeft === 0) {
            void performSignOut();
        }
    }, [isSessionExpiring, secondsLeft, performSignOut]);

    useEffect(() => {
        if (!tokens.expiresAt) {
            return;
        }

        const remainingMs = tokens.expiresAt - Date.now();
        const remainingSec = Math.floor(remainingMs / MS_IN_SECOND);

        if (remainingSec <= 0) {
            (async () => {
                const success = await refreshAccessTokenIfNeeded();
                if (!success) {
                    logout();
                    window.location.replace(HOME_PAGE);
                }
            })();
            return;
        }

        scheduleRefresh(remainingSec);
    }, [tokens.expiresAt]);

    useEffect(() => {
        if (!authUser) {
            if (inactivityTimerId.current !== null) {
                window.clearTimeout(inactivityTimerId.current);
                inactivityTimerId.current = null;
            }
            inactivityInitializedRef.current = false;
            return;
        }

        const handleUserActivity = (event: MouseEvent | KeyboardEvent | TouchEvent) => {
            if (isSessionExpiring || !event.isTrusted) {
                return;
            }

            resetInactivityTimer();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                return;
            }
        };

        const activityEvents: Array<keyof WindowEventMap> = ["click", "keydown", "touchstart"];

        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, handleUserActivity as EventListener);
        });
        document.addEventListener("visibilitychange", handleVisibilityChange);

        if (!inactivityInitializedRef.current) {
            inactivityInitializedRef.current = true;
            resetInactivityTimer();
        }

        return () => {
            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, handleUserActivity as EventListener);
            });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [authUser, isSessionExpiring]);

    const scheduleRefresh = useCallback(
        (expiresInSec: number) => {
            if (!typeGuards.isNumber(expiresInSec) || expiresInSec <= 0) {
                return;
            }

            const refreshInMs = Math.max((expiresInSec - REFRESH_MARGIN_SECONDS) * MS_IN_SECOND, 0);

            clearRefreshTimer();

            refreshTimerId.current = window.setTimeout(async () => {
                const success = await refreshAccessTokenIfNeeded();
                if (!success) {
                    logout();
                    window.location.replace(HOME_PAGE);
                }
            }, refreshInMs);
        },
        [logout]
    );

    const forceRefresh = useCallback(async () => {
        const success = await refreshAccessTokenIfNeeded();
        if (!success) {
            logout();
        }
    }, [logout]);

    const applyRefreshedTokens = useCallback(
        (data: RefreshTokenResponse) => {
            const now = Date.now();
            setTokens({
                accessToken: data.token,
                refreshToken: data.refresh_token,
                sessionUid: data.sessionuid,
                userUid: data.useruid,
                expiresAt: now + data.expires_in * MS_IN_SECOND,
                refreshExpiresAt: now + data.refresh_token_expires_in * MS_IN_SECOND,
            });
            setAuthUser((prev) =>
                prev
                    ? {
                          ...prev,
                          token: data.token,
                          refresh_token: data.refresh_token,
                          refresh_token_expires_in: data.refresh_token_expires_in,
                          expires_in: data.expires_in,
                          sessionuid: data.sessionuid,
                      }
                    : null
            );
            scheduleRefresh(data.expires_in);
            setIsSessionExpiring(false);
            setSecondsLeft(0);
            clearCountdownInterval();
            clearRefreshTimer();
        },
        [scheduleRefresh]
    );

    useEffect(() => {
        setRefreshApi(refreshAccessToken);
        return () => setRefreshApi(null);
    }, []);

    useEffect(() => {
        registerAuthProviderUpdate(applyRefreshedTokens);
        return () => registerAuthProviderUpdate(null);
    }, [applyRefreshedTokens]);

    const setSessionExpiring = useCallback((expiring: boolean, value?: number) => {
        setIsSessionExpiring(expiring);
        if (typeGuards.isNumber(value)) {
            setSecondsLeft(value);
        }
    }, []);

    const value: AuthContextValue = useMemo(
        () => ({
            authUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            sessionUid: tokens.sessionUid,
            userUid: tokens.userUid,
            expiresAt: tokens.expiresAt,
            refreshExpiresAt: tokens.refreshExpiresAt,
            isSessionExpiring,
            secondsLeft,
            login,
            logout,
            scheduleRefresh,
            forceRefresh,
            setSessionExpiring,
        }),
        [
            authUser,
            tokens,
            isSessionExpiring,
            secondsLeft,
            login,
            logout,
            scheduleRefresh,
            forceRefresh,
            setSessionExpiring,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            <>
                {children}
                <SessionExpiryModal
                    visible={isSessionExpiring}
                    secondsLeft={secondsLeft}
                    onContinue={forceRefresh}
                    onLogout={performSignOut}
                />
            </>
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("AuthContext is not defined. useAuth must be used within an AuthProvider");
    }
    return context;
};
