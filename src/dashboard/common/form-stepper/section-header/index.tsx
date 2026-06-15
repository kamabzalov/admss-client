import { ReactElement } from "react";

interface SectionHeaderWithCountProps {
    label: string;
    filledCount: number;
    totalCount: number;
}

export const SectionHeaderWithCount = ({
    label,
    filledCount,
    totalCount,
}: SectionHeaderWithCountProps): ReactElement => {
    const isIndicatorActive = filledCount > 0;

    return (
        <div className='p-0'>
            {label}
            <span
                className={`ml-2 font-light ${isIndicatorActive ? "text--green" : "text--light-grey"}`}
            >
                ({filledCount}/{totalCount})
            </span>
        </div>
    );
};
