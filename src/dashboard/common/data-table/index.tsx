import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { ReactElement, CSSProperties, ReactNode, useMemo } from "react";
import { truncateText } from "common/helpers";
import {
    DEFAULT_MAX_COLUMN_WIDTH,
    DEFAULT_CARD_HEIGHT,
    BASE_CARD_HEIGHT,
    BASE_CARD_WIDTH,
} from "common/settings";
import { useWindowSize } from "common/hooks";
import "dashboard/common/data-table/index.css";

interface GetColumnPtStylesOptions {
    savedWidth?: number;
    isLastColumn?: boolean;
    additionalStyles?: CSSProperties;
}

export const getColumnPtStyles = ({
    savedWidth,
    isLastColumn = false,
    additionalStyles = {},
}: GetColumnPtStylesOptions) => {
    return {
        root: {
            style: savedWidth
                ? {
                      width: `${savedWidth}px`,
                      maxWidth: `${savedWidth}px`,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      ...additionalStyles,
                  }
                : {
                      maxWidth: isLastColumn ? "none" : `${DEFAULT_MAX_COLUMN_WIDTH}px`,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      ...additionalStyles,
                  },
        },
    };
};

interface RowExpansionTemplateProps {
    text: string;
    label?: string;
    wrap?: "wrap" | "nowrap";
    leftPadding?: number;
    limitTextLength?: number;
}

export const rowExpansionTemplate = ({
    text,
    label,
    wrap,
    leftPadding,
    limitTextLength,
}: RowExpansionTemplateProps) => {
    const safeText = text || "";
    const isLimitProvided = typeof limitTextLength === "number";
    const textToDisplay = isLimitProvided ? truncateText(safeText, limitTextLength) : safeText;
    const tooltipText =
        isLimitProvided && safeText.length > (limitTextLength ?? 0) ? safeText : undefined;
    const tooltipId = `expanded-row-tooltip-${Math.random().toString(36).slice(2)}`;

    const expandedRowStyle: CSSProperties | undefined = leftPadding
        ? ({ "--expanded-row-left-padding": `${leftPadding}px` } as CSSProperties)
        : undefined;

    return (
        <div className='expanded-row' style={expandedRowStyle}>
            <div className='expanded-row__label'>{label || "Description: "}</div>

            <div
                className={`expanded-row__text text-${wrap || "wrap"}`}
                data-tooltip-id={tooltipId}
            >
                {textToDisplay}
                {tooltipText && (
                    <Tooltip
                        target={`[data-tooltip-id="${tooltipId}"]`}
                        content={tooltipText}
                        position='mouse'
                    />
                )}
            </div>
        </div>
    );
};

interface ExpansionColumnProps extends ColumnProps {
    handleRowExpansion: (rowData: any) => void;
    width?: string;
}

export const ExpansionColumn = (props: ExpansionColumnProps): ReactElement => {
    return (
        <Column
            className='expansion-column-cell'
            bodyStyle={{ textAlign: "center" }}
            reorderable={props.reorderable ?? false}
            resizeable={props.resizeable ?? false}
            body={(rowData) => {
                return (
                    <div className={`expansion-column`}>
                        <Button
                            className='text expansion-column__button'
                            icon='pi pi-angle-down'
                            onClick={() => props.handleRowExpansion(rowData)}
                        />
                    </div>
                );
            }}
            pt={{
                root: {
                    style: {
                        width: props.width ?? "60px",
                    },
                },
            }}
        />
    );
};

interface DataTableWrapperProps {
    children: ReactNode;
    className?: string;
}

export const DataTableWrapper = ({ children, className }: DataTableWrapperProps): ReactElement => {
    const { height: windowHeight } = useWindowSize();

    const calculatedCardHeight = useMemo(() => {
        return Math.min(
            DEFAULT_CARD_HEIGHT,
            Math.floor((windowHeight / BASE_CARD_HEIGHT) * DEFAULT_CARD_HEIGHT)
        );
    }, [windowHeight]);

    const paddings = useMemo(() => {
        const ratio = Math.min(1, windowHeight / BASE_CARD_HEIGHT);
        return {
            wrapper: Math.max(20, Math.floor(40 * ratio)),
            paginator: Math.max(10, Math.floor(50 * ratio)),
        };
    }, [windowHeight]);

    return (
        <div
            className={`data-table-wrapper ${className || ""}`}
            style={
                {
                    "--data-table-base-card-width": `${BASE_CARD_WIDTH}px`,
                    "--data-table-wrapper-height": `${calculatedCardHeight}px`,
                    "--data-table-padding": `${paddings.wrapper}px`,
                    "--data-table-paginator-padding-top": `${paddings.paginator}px`,
                } as CSSProperties
            }
        >
            {children}
        </div>
    );
};
