import { Button, ButtonProps } from "primereact/button";
import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";

import "./index.css";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";

interface ReportSelectProps {
    header: string;
    values: string[];
    currentItem: string | Record<string, unknown> | null;
    onItemClick: (item: string) => void;
}

export const ReportSelect = ({
    header,
    values,
    currentItem,
    onItemClick,
}: ReportSelectProps): ReactElement => {
    return (
        <div className='report-select'>
            <span className='report-select__header'>{header}</span>
            <ul className='report-select__list'>
                {values.map((value) => (
                    <li
                        className={`report-select__item ${currentItem === value ? "selected" : ""}`}
                        key={value}
                        onClick={() => {
                            onItemClick(value);
                        }}
                    >
                        {value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface NoticeAlertProps extends ButtonProps {}

export const NoticeAlert = observer(({ ...props }: NoticeAlertProps): ReactElement => {
    const store = useStore().accountStore;
    const {
        accountNote: { alert, note },
    } = store;
    const tooltipId = "notice-tooltip";

    const tooltipContent = () => {
        return (
            <>
                {note && (
                    <div className='notice-content'>
                        <h4 className='notice-content__title'>Account Memo:</h4>
                        <p className='notice-content__description'>{note}</p>
                    </div>
                )}
                {alert && (
                    <div className='notice-content'>
                        <h4 className='notice-content__title'>Account Alert:</h4>
                        <p className='notice-content__description'>{alert}</p>
                    </div>
                )}
            </>
        );
    };

    return (
        <span className='notice-alert'>
            <Button className='notice-alert__button' id={tooltipId} {...props} severity='warning'>
                NOTICE! Account Alert!
            </Button>
            <Tooltip target={`#${tooltipId}`} showDelay={500} hideDelay={300} position='bottom'>
                {tooltipContent()}
            </Tooltip>
        </span>
    );
});
