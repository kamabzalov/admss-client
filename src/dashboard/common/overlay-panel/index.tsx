import { ReactElement, ReactNode, useState } from "react";
import "./index.css";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";

interface InfoOverlayPanelProps {
    panelTitle?: string;
    children: ReactNode;
    className?: string;
    pageId?: string | null;
}

export const InfoOverlayPanel = ({
    panelTitle,
    children,
    className,
    pageId,
}: InfoOverlayPanelProps): ReactElement => {
    const [panelShow, setPanelShow] = useState<boolean>(false);
    const { userStore } = useStore();
    const isFirstVisit = userStore.isFirstVisit(pageId ?? "");

    const handleButtonClick = () => {
        if (isFirstVisit) {
            userStore.markPageAsVisited(pageId ?? "");
        }
        setPanelShow((prev) => !prev);
    };

    return (
        <div className={`info-panel ${className ?? ""}`}>
            <Button
                type='button'
                className={`info-panel__button ${isFirstVisit ? "info-panel__button--pulse" : ""}`}
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
