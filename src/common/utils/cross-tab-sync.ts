import { typeGuards } from "common/utils";

export enum SESSION_SYNC {
    ACTIVITY = "activity",
    SESSION_REFRESHED = "session-refreshed",
    LOGOUT = "logout",
    CHANNEL_NAME = "admss-session-sync",
}

export interface SessionSyncEvent {
    type: SESSION_SYNC;
    timestamp: number;
}

type Listener = (event: SessionSyncEvent) => void;

let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();

const isSupported = (): boolean =>
    typeGuards.isExist(window) && typeGuards.isExist(BroadcastChannel);

const ensureChannel = (): BroadcastChannel | null => {
    if (!isSupported()) {
        return null;
    }
    if (!channel) {
        channel = new BroadcastChannel(SESSION_SYNC.CHANNEL_NAME);
        channel.addEventListener("message", (event: MessageEvent<SessionSyncEvent>) => {
            if (!event?.data || !typeGuards.isExist(event.data.type)) {
                return;
            }
            listeners.forEach((listener) => listener(event.data));
        });
    }
    return channel;
};

export const broadcastSessionEvent = (type: SESSION_SYNC): void => {
    const channel = ensureChannel();
    if (!channel) {
        return;
    }
    channel.postMessage({ type, timestamp: Date.now() });
};

export const subscribeToSessionEvents = (listener: Listener): (() => void) => {
    ensureChannel();
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};
