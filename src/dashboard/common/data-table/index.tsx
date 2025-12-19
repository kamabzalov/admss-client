import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { ReactElement, CSSProperties, ReactNode } from "react";
import { truncateText } from "common/helpers";
import { DEFAULT_MAX_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from "common/settings";
import "./index.css";

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
    rowsCount?: number;
    rowHeight?: number;
}

export const DataTableWrapper = ({
    children,
    className,
    rowsCount = 10,
    rowHeight = DEFAULT_ROW_HEIGHT,
}: DataTableWrapperProps): ReactElement => {
    return (
        <div
            className={`data-table-wrapper ${className || ""}`}
            style={
                {
                    "--data-table-rows-count": rowsCount,
                    "--data-table-row-height": `${rowHeight}px`,
                } as CSSProperties
            }
        >
            {children}
        </div>
    );
};
