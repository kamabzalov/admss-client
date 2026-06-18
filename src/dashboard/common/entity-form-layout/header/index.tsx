import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";
import { truncateText } from "common/helpers";

export interface EntityFormHeaderItem {
    label: string;
    value: string;
    truncate?: boolean;
}

interface EntityFormHeaderProps {
    title: string;
    metadata?: EntityFormHeaderItem[];
}

export const EntityFormHeader = ({ title, metadata = [] }: EntityFormHeaderProps): ReactElement => {
    const hasMetadata = metadata.length > 0;

    return (
        <div className='card-header'>
            <h2 className='card-header__title uppercase m-0 pr-2'>{title}</h2>
            {hasMetadata && (
                <div className='card-header-info'>
                    <Tooltip
                        target='.entity-form-header__tooltip'
                        className='tooltip-tail-bottom'
                    />
                    {metadata.map(({ label, value, truncate = true }) => (
                        <span key={label} className='entity-form-header__item'>
                            {label}
                            <span
                                className='card-header-info__data entity-form-header__tooltip'
                                data-pr-tooltip={value}
                                data-pr-position='top'
                            >
                                {truncate ? truncateText(value) : value}
                            </span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
