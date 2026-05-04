import { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import questionMarkIcon from "assets/images/question-mark.svg";
import { useStore } from "store/hooks";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ReportsUserSettings, ServerUserSettings } from "common/models/user";

interface InfoOverlayPanelProps {
    panelTitle?: string;
    children: ReactNode;
    className?: string;
    pageId?: string | null;
    profileHintKey?: keyof Pick<ReportsUserSettings, "columnSelectHintViewed">;
    disableHover?: boolean;
    disablePulse?: boolean;
}

export const InfoOverlayPanel = ({
    panelTitle,
    children,
    className,
    pageId,
    profileHintKey,
    disableHover = false,
    disablePulse = false,
}: InfoOverlayPanelProps): ReactElement => {
    const [panelShow, setPanelShow] = useState<boolean>(false);
    const { userStore } = useStore();
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [profileHintViewed, setProfileHintViewed] = useState<boolean>(true);
    const { authUser } = userStore;

    const isProfileBased = Boolean(profileHintKey && authUser);
    const isFirstVisit = userStore.isFirstVisit(pageId ?? "");

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

    const showPulse = disablePulse ? false : isProfileBased ? !profileHintViewed : isFirstVisit;

    return (
        <div
            className={`info-panel ${className ?? ""}`}
            onMouseEnter={disableHover ? undefined : handleMouseEnter}
            onMouseLeave={disableHover ? undefined : handleMouseLeave}
        >
            <button
                type='button'
                className={`info-panel__button ${showPulse ? "info-panel__button--pulse" : ""}`}
                onClick={handleButtonClick}
                aria-label='Info'
            >
                <img src={questionMarkIcon} alt='' className='info-panel__icon' />
            </button>
            {panelShow && (
                <div className='info-panel__panel shadow-3'>
                    <div className='info-panel__title'>{panelTitle}</div>
                    <div className='info-panel__body'>{children}</div>
                </div>
            )}
        </div>
    );
};
