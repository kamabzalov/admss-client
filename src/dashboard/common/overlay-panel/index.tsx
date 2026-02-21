import { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ReportsUserSettings, ServerUserSettings } from "common/models/user";

interface InfoOverlayPanelProps {
    panelTitle?: string;
    children: ReactNode;
    className?: string;
    pageId?: string | null;
    profileHintKey?: keyof Pick<ReportsUserSettings, "columnSelectHintViewed">;
}

export const InfoOverlayPanel = ({
    panelTitle,
    children,
    className,
    pageId,
    profileHintKey,
}: InfoOverlayPanelProps): ReactElement => {
    const [panelShow, setPanelShow] = useState<boolean>(false);
    const { userStore } = useStore();
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [profileHintViewed, setProfileHintViewed] = useState<boolean | undefined>(undefined);
    const { authUser } = userStore;

    const isProfileBased = Boolean(profileHintKey && authUser);
    const isFirstVisit = isProfileBased
        ? profileHintViewed !== true
        : userStore.isFirstVisit(pageId ?? "");

    useEffect(() => {
        if (!isProfileBased || !authUser) return;

        const loadProfile = async () => {
            const response = await getUserSettings(authUser.useruid);
            if (!response?.profile?.length) return;

            try {
                const allSettings: ServerUserSettings = JSON.parse(response.profile);
                const viewed = allSettings.reports?.[profileHintKey!];
                setProfileHintViewed(Boolean(viewed));
            } catch {
                setProfileHintViewed(false);
            }
        };

        void loadProfile();
    }, [authUser, isProfileBased, profileHintKey]);

    const markHintViewed = useCallback(async () => {
        if (!isProfileBased || !authUser) return;

        setProfileHintViewed(true);

        const response = await getUserSettings(authUser.useruid);
        let allSettings: ServerUserSettings = {} as ServerUserSettings;

        if (response?.profile?.length) {
            try {
                allSettings = JSON.parse(response.profile);
            } catch {
                allSettings = {} as ServerUserSettings;
            }
        }

        const currentReports: ReportsUserSettings = allSettings.reports ?? {};
        await setUserSettings(authUser.useruid, {
            ...allSettings,
            reports: {
                ...currentReports,
                [profileHintKey!]: true,
            },
        });
    }, [authUser, isProfileBased, profileHintKey]);

    const handleButtonClick = () => {
        if (isFirstVisit) {
            if (isProfileBased) {
                void markHintViewed();
            } else {
                userStore.markPageAsVisited(pageId ?? "");
            }
        }
        setPanelShow((prev) => !prev);
    };

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setPanelShow(true);
    };

    const handleMouseLeave = () => {
        const timeout = 150;
        hoverTimeoutRef.current = setTimeout(() => setPanelShow(false), timeout);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const showPulse = isProfileBased ? !profileHintViewed : isFirstVisit;

    return (
        <div
            className={`info-panel ${className ?? ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button
                type='button'
                className={`info-panel__button ${showPulse ? "info-panel__button--pulse" : ""}`}
                onClick={handleButtonClick}
            >
                <i className='icon adms-question-mark p-text-secondary p-overlay-badge info-panel__icon' />
            </Button>
            {panelShow && (
                <div className='info-panel__panel shadow-3'>
                    <div className='info-panel__title'>{panelTitle}</div>
                    <div className='info-panel__body'>{children}</div>
                </div>
            )}
        </div>
    );
};
