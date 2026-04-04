import { REPORTS_PAGE } from "common/constants/links";
import { useToastMessage } from "common/hooks";
import { BaseResponseError, Status } from "common/models/base-response";
import { ReportServiceColumns } from "common/models/reports";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { EditAccessDialog } from "dashboard/reports/common/access-dialog";
import { copyReportDocument, deleteReportDocument } from "http/services/reports.service";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Fragment, MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "store/hooks";

const REPORT_DRAG = {
    TYPE: "report-drag-type",
    TEXT_PLAIN: "text/plain",
    MOVE: "move",
    END: "dragend",
} as const;

export type ReportColumnListId = "available" | "selected";

interface ReportSelectProps {
    header: string;
    listId: ReportColumnListId;
    values: ReportServiceColumns[];
    selectedItems: ReportServiceColumns[];
    onItemClick: (item: ReportServiceColumns) => void;
    onItemDoubleClick?: (item: ReportServiceColumns) => void;
    containerRef?: MutableRefObject<HTMLDivElement | null>;
    draggableItems?: boolean;
    onColumnDrop: (
        sourceList: ReportColumnListId,
        dataKey: string,
        targetList: ReportColumnListId,
        targetIndex: number
    ) => void;
}

export const ReportSelect = ({
    header,
    listId,
    values,
    selectedItems,
    onItemClick,
    onItemDoubleClick,
    containerRef,
    draggableItems,
    onColumnDrop,
}: ReportSelectProps): ReactElement => {
    const isSelected = (value: ReportServiceColumns) => selectedItems.includes(value);
    const ignoreClickRef = useRef(false);
    const dragRef = useRef<{
        sourceList: ReportColumnListId;
        data: string;
        sourceIndex: number;
    } | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);

    useEffect(() => {
        const reset = () => {
            dragRef.current = null;
            setDropIndex(null);
        };
        document.addEventListener(REPORT_DRAG.END, reset);
        return () => document.removeEventListener(REPORT_DRAG.END, reset);
    }, []);

    const isNoOpPosition = (targetIdx: number): boolean => {
        const src = dragRef.current;
        if (!src || src.sourceList !== listId) return false;
        return targetIdx === src.sourceIndex || targetIdx === src.sourceIndex + 1;
    };

    const onDragStart = (e: React.DragEvent, item: ReportServiceColumns, index: number) => {
        if (!draggableItems) return;
        dragRef.current = { sourceList: listId, data: item.data, sourceIndex: index };
        setDropIndex(null);
        e.dataTransfer.setData(
            REPORT_DRAG.TYPE,
            JSON.stringify({ sourceList: listId, data: item.data })
        );
        e.dataTransfer.setData(REPORT_DRAG.TEXT_PLAIN, item.data);
        e.dataTransfer.effectAllowed = REPORT_DRAG.MOVE;
    };

    const onDragEnd = () => {
        dragRef.current = null;
        setDropIndex(null);
        ignoreClickRef.current = true;
        window.setTimeout(() => {
            ignoreClickRef.current = false;
        }, 0);
    };

    const onDrop = (e: React.DragEvent, targetIdx: number) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = null;
        setDropIndex(null);
        if (!draggableItems) return;
        const raw = e.dataTransfer.getData(REPORT_DRAG.TYPE);
        if (!raw) return;
        try {
            const { sourceList, data } = JSON.parse(raw) as {
                sourceList: ReportColumnListId;
                data: string;
            };
            if (data) onColumnDrop(sourceList, data, listId, targetIdx);
        } catch {
            return;
        }
    };

    const allowDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = REPORT_DRAG.MOVE;
    };

    const onRowDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = REPORT_DRAG.MOVE;
        if (isNoOpPosition(index)) {
            setDropIndex(null);
            return;
        }
        setDropIndex(index);
    };

    const onTailDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = REPORT_DRAG.MOVE;
        if (isNoOpPosition(values.length)) {
            setDropIndex(null);
            return;
        }
        setDropIndex(values.length);
    };

    const onEmptyDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = REPORT_DRAG.MOVE;
        setDropIndex(0);
    };

    const showIndicator = dropIndex !== null;

    return (
        <div
            className='report-select'
            ref={(node) => {
                if (containerRef) containerRef.current = node;
            }}
            role='listbox'
            aria-multiselectable='true'
            onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndex(null);
            }}
        >
            <span className='report-select__header'>{header}</span>
            <div
                className='report-select__list'
                onDragOver={allowDrop}
                onDrop={(e) => {
                    if (e.target === e.currentTarget) onDrop(e, values.length);
                }}
            >
                {values.length === 0 ? (
                    <div
                        className={`report-select__item report-select__item--drop-empty ${
                            showIndicator ? "report-select__item--drop-empty-active" : ""
                        }`}
                        role='presentation'
                        onDragOver={onEmptyDragOver}
                        onDrop={(e) => onDrop(e, 0)}
                    />
                ) : (
                    values.map((value, index) => (
                        <Fragment key={value.data}>
                            {dropIndex === index && (
                                <div className='report-select__drop-placeholder' aria-hidden />
                            )}
                            <div
                                className={`report-select__item ${isSelected(value) ? "selected" : ""}`}
                                role='option'
                                aria-selected={isSelected(value)}
                                draggable={!!draggableItems}
                                onDragStart={(e) => onDragStart(e, value, index)}
                                onDragEnd={onDragEnd}
                                onDragOver={(e) => onRowDragOver(e, index)}
                                onDrop={(e) => onDrop(e, index)}
                                onClick={() => {
                                    if (ignoreClickRef.current) return;
                                    onItemClick(value);
                                }}
                                onDoubleClick={() => {
                                    if (ignoreClickRef.current) return;
                                    onItemDoubleClick?.(value);
                                }}
                            >
                                {value.name}
                            </div>
                        </Fragment>
                    ))
                )}
                {dropIndex === values.length && values.length > 0 && (
                    <div className='report-select__drop-placeholder' aria-hidden />
                )}
                {values.length > 0 && (
                    <div
                        className='report-select__drop-tail'
                        role='presentation'
                        onDragOver={onTailDragOver}
                        onDrop={(e) => onDrop(e, values.length)}
                    />
                )}
            </div>
        </div>
    );
};

interface ReportFooterProps {
    onRefetch?: () => void;
}

export const ReportFooter = observer(({ onRefetch }: ReportFooterProps): ReactElement => {
    const reportStore = useStore().reportStore;
    const navigate = useNavigate();
    const { report, saveReport, isReportChanged } = reportStore;
    const { showSuccess, showError } = useToastMessage();
    const [accessDialogVisible, setAccessDialogVisible] = useState<boolean>(false);
    const [duplicateDialogVisible, setDuplicateDialogVisible] = useState<boolean>(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const handleSaveReport = async () => {
        if (!!report.isdefault) return;
        const response = await saveReport(report?.itemuid);
        if (response) {
            if (response?.status === Status.OK) {
                showSuccess("Custom report is successfully saved!");
                const { itemuid } = response as { status: Status.OK; itemuid: string };
                navigate(`/dashboard/reports/${itemuid}`);
                onRefetch?.();
            } else {
                showError(response?.error || "Error while saving new custom report");
            }
        }
    };

    const handleDuplicateReport = async () => {
        if (report?.itemuid) {
            const response = await copyReportDocument(report.itemuid);
            if (response?.status === Status.OK) {
                const { itemuid } = response as { status: Status.OK; itemuid: string };
                navigate(REPORTS_PAGE.EDIT(itemuid));
                onRefetch?.();
                showSuccess("Custom report is successfully copied!");
            } else {
                showError(response?.error!);
            }
        }
    };

    const handleDeleteReport = () => {
        report?.itemuid &&
            !report.isdefault &&
            deleteReportDocument(report.itemuid).then((response: BaseResponseError | undefined) => {
                if (response?.status === Status.OK) {
                    navigate(REPORTS_PAGE.CREATE());
                    showSuccess("Custom report is successfully deleted!");
                    onRefetch?.();
                } else {
                    showError(response?.error!);
                }
            });
    };

    return (
        <>
            <div className='report__footer gap-3'>
                <Button
                    className='report__icon-button'
                    icon='icon adms-password'
                    severity='success'
                    onClick={() => setAccessDialogVisible(true)}
                    outlined
                    tooltip='Edit access'
                    tooltipOptions={{ position: "mouse" }}
                />

                {report.itemuid && (
                    <Button
                        className='report__icon-button'
                        icon='icon adms-copy'
                        severity='success'
                        onClick={() => setDuplicateDialogVisible(true)}
                        outlined
                        tooltip='Duplicate report'
                        tooltipOptions={{ position: "mouse" }}
                    />
                )}

                {!report.isdefault && report.itemuid && (
                    <Button
                        className='report__icon-button'
                        icon='icon adms-trash-can'
                        onClick={() => setDeleteDialogVisible(true)}
                        outlined
                        severity='danger'
                        tooltip='Delete report'
                        tooltipOptions={{ position: "mouse" }}
                    />
                )}
                <Button
                    className='ml-auto uppercase px-6 report__button'
                    severity='danger'
                    onClick={() => navigate(REPORTS_PAGE.MAIN)}
                    outlined
                >
                    Cancel
                </Button>
                <Button
                    className='uppercase px-6 report__button'
                    disabled={!report.name || !!report.isdefault || !isReportChanged}
                    severity={
                        !report.name || !!report.isdefault || !isReportChanged
                            ? "secondary"
                            : "success"
                    }
                    onClick={handleSaveReport}
                >
                    {report?.itemuid ? "Update" : "Create"}
                </Button>
            </div>
            {accessDialogVisible && (
                <EditAccessDialog
                    visible={accessDialogVisible}
                    onHide={() => setAccessDialogVisible(false)}
                    reportuid={report.itemuid || "0"}
                />
            )}
            {report.itemuid && (
                <ConfirmModal
                    visible={duplicateDialogVisible}
                    position='top'
                    title='Duplicate report?'
                    icon='pi-exclamation-triangle'
                    bodyMessage={`Are you sure you want to duplicate ${report.name} report?`}
                    confirmAction={() => {
                        handleDuplicateReport();
                        setDuplicateDialogVisible(false);
                    }}
                    draggable={false}
                    rejectLabel={"Cancel"}
                    acceptLabel={"Copy"}
                    onHide={() => setDuplicateDialogVisible(false)}
                />
            )}

            {report.itemuid && (
                <ConfirmModal
                    visible={deleteDialogVisible}
                    position='top'
                    title='Are you sure?'
                    icon='pi-exclamation-triangle'
                    bodyMessage={`Are you sure you want to delete ${report.name} report?`}
                    confirmAction={() => {
                        handleDeleteReport();
                        setDeleteDialogVisible(false);
                    }}
                    draggable={false}
                    rejectLabel={"Cancel"}
                    acceptLabel={"Delete"}
                    onHide={() => setDeleteDialogVisible(false)}
                />
            )}
        </>
    );
});
