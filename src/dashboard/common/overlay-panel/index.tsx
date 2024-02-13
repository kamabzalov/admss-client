import { ReactElement, ReactNode, useState } from "react";
import "./index.css";

interface InfoOverlayPanelProps {
    panelTitle?: string;
    children: ReactNode;
}
export const InfoOverlayPanel = ({ panelTitle, children }: InfoOverlayPanelProps): ReactElement => {
    const [panelShow, setPanelShow] = useState<boolean>(false);
    return (
        <div className='info-panel'>
            <div className='info-panel__icon-wrapper' onClick={() => setPanelShow((prev) => !prev)}>
                <i className='icon adms-question-mark p-text-secondary p-overlay-badge info-panel__icon' />
            </div>
            {panelShow && (
                <div className='info-panel__panel shadow-3'>
                    <div className='info-panel__title'>{panelTitle}</div>
                    <div className='info-panel__body'>{children}</div>
                </div>
            )}
        </div>
    );
};
