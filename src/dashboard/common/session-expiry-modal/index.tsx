import { ReactElement, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./index.css";
import { SECONDS_IN_MINUTE } from "common/constants/time";
import { TITLE_APP, TITLE_SESSION_EXPIRY } from "common/constants/titles";
import expireClockIcon from "assets/images/expire-clock.svg";

const SESSION_EXPIRY = {
    MESSAGE:
        "For security reasons, inactive sessions are automatically signed out. To continue working, please confirm your session.",
    TIME_REMAINING: "TIME REMAINING",
    CONTINUE: "Continue session",
    SIGN_OUT: "Sign out now",
};

const SESSION_WARNING_THRESHOLD_SECONDS = 30;
const SESSION_DANGER_THRESHOLD_SECONDS = 10;

interface SessionExpiryModalProps {
    visible: boolean;
    secondsLeft: number;
    onContinue: () => void;
    onLogout: () => void;
}

export const SessionExpiryModal = ({
    visible,
    secondsLeft,
    onContinue,
    onLogout,
}: SessionExpiryModalProps): ReactElement => {
    const previousTitleRef = useRef<string | null>(null);

    useEffect(() => {
        if (!visible) {
            if (previousTitleRef.current !== null) {
                document.title = previousTitleRef.current;
                previousTitleRef.current = null;
            }
            return;
        }

        if (previousTitleRef.current === null) {
            previousTitleRef.current = document.title;
        }

        let showExpiry = true;
        document.title = TITLE_SESSION_EXPIRY;

        const intervalId = window.setInterval(() => {
            document.title = showExpiry ? TITLE_APP : TITLE_SESSION_EXPIRY;
            showExpiry = !showExpiry;
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [visible]);

    const minutes = Math.floor(secondsLeft / SECONDS_IN_MINUTE)
        .toString()
        .padStart(2, "0");
    const seconds = (secondsLeft % SECONDS_IN_MINUTE).toString().padStart(2, "0");

    const timerClassName = `session-expiry-modal__timer${
        secondsLeft <= SESSION_DANGER_THRESHOLD_SECONDS
            ? " session-expiry-modal__timer--danger"
            : ""
    }${
        secondsLeft <= SESSION_WARNING_THRESHOLD_SECONDS &&
        secondsLeft > SESSION_DANGER_THRESHOLD_SECONDS
            ? " session-expiry-modal__timer--warning"
            : ""
    }`;

    const dialogHeader = () => {
        const isDanger = secondsLeft <= SESSION_DANGER_THRESHOLD_SECONDS;

        return (
            <div className='session-expiry-modal__header'>
                {isDanger ? (
                    <i className='icon adms-warning' />
                ) : (
                    <img
                        src={expireClockIcon}
                        alt='Session expiry warning'
                        className='session-expiry-modal__header-icon'
                    />
                )}
                <span>Your session is about to expire</span>
            </div>
        );
    };

    return (
        <Dialog
            visible={visible}
            onHide={onLogout}
            className='session-expiry-modal'
            closable={false}
            draggable={false}
            header={dialogHeader()}
        >
            <div className='session-expiry-modal__content'>
                <p className='session-expiry-modal__description'>{SESSION_EXPIRY.MESSAGE}</p>
                <div className={timerClassName}>
                    <span className='session-expiry-modal__timer-value'>
                        {minutes}:{seconds}
                    </span>
                    <span className='session-expiry-modal__timer-label'>
                        {SESSION_EXPIRY.TIME_REMAINING}
                    </span>
                </div>
                <div className='session-expiry-modal__actions'>
                    <Button
                        label={SESSION_EXPIRY.CONTINUE}
                        className='session-expiry-modal__button session-expiry-modal__button--primary'
                        onClick={onContinue}
                    />
                    <Button
                        label={SESSION_EXPIRY.SIGN_OUT}
                        className='session-expiry-modal__button session-expiry-modal__button--secondary'
                        outlined
                        onClick={onLogout}
                    />
                </div>
            </div>
        </Dialog>
    );
};
