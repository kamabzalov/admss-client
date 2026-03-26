import { useToastMessage } from "common/hooks";
import { BaseResponseError, Status } from "common/models/base-response";
import { ReportServiceColumns } from "common/models/reports";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { EditAccessDialog } from "dashboard/reports/common/access-dialog";
import { copyReportDocument, deleteReportDocument } from "http/services/reports.service";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { MutableRefObject, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "store/hooks";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface ReportSelectProps {
    header: string;
    values: ReportServiceColumns[];
    selectedItems: ReportServiceColumns[];
    onItemClick: (item: ReportServiceColumns) => void;
    onItemDoubleClick?: (item: ReportServiceColumns) => void;
    containerRef?: MutableRefObject<HTMLDivElement | null>;
    draggableItems?: boolean;
    onItemReorder?: (item: ReportServiceColumns, newIndex: number) => void;
}

export const ReportSelect = ({
    header,
    values,
    selectedItems,
    onItemClick,
    onItemDoubleClick,
    containerRef,
    draggableItems,
    onItemReorder,
}: ReportSelectProps): ReactElement => {
    const isSelected = (value: ReportServiceColumns) => selectedItems.includes(value);
    const [isDragging, setIsDragging] = useState(false);
    const [gridWidth, setGridWidth] = useState(1);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const layouts = useMemo(
        () => ({
            lg: values.map((value, index) => ({
                i: value.data,
                x: 0,
                y: index,
                w: 1,
                h: 1,
            })),
        }),
        [values]
    );

    useEffect(() => {
        const node = rootRef.current;
        if (!node) return;

        const updateWidth = () => {
            const nextWidth = Math.max(node.clientWidth - 2, 1);
            setGridWidth(nextWidth);
        };

        updateWidth();
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(node);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const handleDragStop = (_: unknown, oldItem: Layout, newItem: Layout) => {
        setIsDragging(false);
        if (!onItemReorder) return;
        if (oldItem.y === newItem.y) return;
        const movedItem = values.find((value) => value.data === oldItem.i);
        if (!movedItem) return;
        onItemReorder(movedItem, newItem.y);
    };

    return (
        <div
            className='report-select'
            ref={(node) => {
                rootRef.current = node;
                if (containerRef) {
                    containerRef.current = node;
                }
            }}
            role='listbox'
            aria-multiselectable='true'
        >
            <span className='report-select__header'>{header}</span>
            <GridLayout
                className='report-select__list'
                layout={layouts.lg}
                cols={1}
                rowHeight={39}
                margin={[0, 0]}
                compactType='vertical'
                preventCollision={false}
                width={gridWidth}
                useCSSTransforms={false}
                autoSize={false}
                isDraggable={!!draggableItems}
                isDroppable={false}
                isResizable={false}
                onDragStart={() => setIsDragging(true)}
                onDragStop={handleDragStop}
            >
                {values.map((value) => (
                    <div
                        className={`report-select__item ${isSelected(value) ? "selected" : ""}`}
                        key={value.data}
                        role='option'
                        aria-selected={isSelected(value)}
                        onClick={() => {
                            if (isDragging) return;
                            onItemClick(value);
                        }}
                        onDoubleClick={() => {
                            if (isDragging) return;
                            onItemDoubleClick?.(value);
                        }}
                    >
                        {value.name}
                    </div>
                ))}
            </GridLayout>
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
                navigate(`/dashboard/reports/${itemuid}`);
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
                    navigate("/dashboard/reports/create");
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
                    onClick={() => navigate("/dashboard/reports")}
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
