import { ReactElement } from "react";

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
