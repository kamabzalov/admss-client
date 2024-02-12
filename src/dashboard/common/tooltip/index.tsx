import { ReactElement } from "react";
import "./index.css";

import { useRef } from "react";
import { OverlayPanel, OverlayPanelProps } from "primereact/overlaypanel";
import { Button } from "primereact/button";

interface LimitationsPanelProps extends OverlayPanelProps {}
export const LimitationsPanel = (props: LimitationsPanelProps): ReactElement => {
    const op = useRef<OverlayPanel>(null);
    return (
        <div className='limitations'>
            <Button
                type='button'
                onClick={(e) => {
                    op.current?.toggle(e);
                }}
                className='p-button limitations__button'
            >
                <i className='custom-target-icon icon adms-help p-text-secondary p-overlay-badge limitations__icon' />
            </Button>
            <OverlayPanel ref={op} dismissable={false} className='limitations__panel shadow-3'>
                <div className='limitations__title'>Limitations:</div>
                <div className='limitations__body'>{props.children}</div>
            </OverlayPanel>
        </div>
    );
};
