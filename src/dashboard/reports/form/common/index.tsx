import { ReportServiceColumns } from "common/models/reports";
import { ReactElement } from "react";

interface ReportSelectProps {
    header: string;
    values: ReportServiceColumns[];
    currentItem: ReportServiceColumns | null;
    onItemClick: (item: ReportServiceColumns) => void;
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
                        key={value.data}
                        onClick={() => {
                            onItemClick(value);
                        }}
                    >
                        {value.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};
