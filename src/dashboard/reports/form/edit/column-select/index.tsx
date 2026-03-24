import { Button } from "primereact/button";
import { ReactElement, useEffect, useRef, useState } from "react";
import { ReportSelect } from "dashboard/reports/form/common";
import { observer } from "mobx-react-lite";
import { ReportServiceColumns } from "common/models/reports";
import { useReportColumnController } from "dashboard/reports/form/edit/column-select/select-controller";
import { MOVE_DIRECTION } from "common/constants/report-options";
import { ComboBox } from "dashboard/common/form/dropdown";
import { DataSetInfoTemplate } from "dashboard/reports/form/edit/column-select/info-panel";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import "./index.css";

const toggleItemInSelection = (
    reportItem: ReportServiceColumns,
    prev: ReportServiceColumns[]
): ReportServiceColumns[] => {
    if (prev.includes(reportItem)) {
        if (prev.length === 1) {
            return prev;
        }
        return prev.filter((item) => item !== reportItem);
    }
    return [...prev, reportItem];
};

export const ReportColumnSelect = observer((): ReactElement => {
    const {
        dataSet,
        report,
        setDataSet,
        selectedValues,
        setSelectedValues,
        availableValues,
        setAvailableValues,
        availableDatasets,
    } = useReportColumnController();

    const [leftSelection, setLeftSelection] = useState<ReportServiceColumns[]>([]);
    const [rightSelection, setRightSelection] = useState<ReportServiceColumns[]>([]);

    const availableRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLeftSelection((prev) => prev.filter((i) => availableValues.includes(i)));
    }, [availableValues]);

    useEffect(() => {
        setRightSelection((prev) => prev.filter((i) => selectedValues.includes(i)));
    }, [selectedValues]);

    useEffect(() => {
        setLeftSelection([]);
        setRightSelection([]);
    }, [dataSet]);

    const scrollToTop = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo({
            top: ref.current?.scrollHeight ?? 0,
            behavior: "smooth",
        });
    };

    const moveItem = (
        item: ReportServiceColumns,
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        clearLeft: boolean
    ) => {
        setFrom(from.filter((reportItem) => reportItem !== item));
        setTo([...to, item]);
        if (clearLeft) {
            setLeftSelection([]);
        } else {
            setRightSelection([]);
        }
    };

    const moveMultipleToSelected = () => {
        if (!leftSelection.length) return;
        const toMove = leftSelection.filter((reportItem) => availableValues.includes(reportItem));
        if (!toMove.length) return;
        const ordered = availableValues.filter((reportItem) => toMove.includes(reportItem));
        setAvailableValues((prev) => prev.filter((reportItem) => !toMove.includes(reportItem)));
        setSelectedValues((prev) => [...prev, ...ordered]);
        setLeftSelection([]);
        setRightSelection(ordered);
    };

    const moveMultipleToAvailable = () => {
        if (!rightSelection.length) return;
        const toMove = rightSelection.filter((reportItem) => selectedValues.includes(reportItem));
        if (!toMove.length) return;
        const ordered = selectedValues.filter((reportItem) => toMove.includes(reportItem));
        setSelectedValues((prev) => prev.filter((reportItem) => !toMove.includes(reportItem)));
        setAvailableValues((prev) => [...prev, ...ordered]);
        setRightSelection([]);
        setLeftSelection(ordered);
    };

    const moveAllItems = (
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setTo([...to, ...from]);
        setFrom([]);
        setLeftSelection([]);
        setRightSelection([]);
    };

    const changeOrder = (
        item: ReportServiceColumns,
        direction: MOVE_DIRECTION,
        list: ReportServiceColumns[],
        setList: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        const index = list.indexOf(item);
        if (index === -1) return;
        const newList = [...list];

        switch (direction) {
            case MOVE_DIRECTION.UP:
                if (index) {
                    newList.splice(index - 1, 0, newList.splice(index, 1)[0]);
                }
                break;

            case MOVE_DIRECTION.DOWN:
                if (index < newList.length - 1) {
                    newList.splice(index + 1, 0, newList.splice(index, 1)[0]);
                }
                break;

            case MOVE_DIRECTION.TOP:
                newList.unshift(newList.splice(index, 1)[0]);
                scrollToTop(list === availableValues ? availableRef : selectedRef);
                break;

            case MOVE_DIRECTION.BOTTOM:
                newList.push(newList.splice(index, 1)[0]);
                scrollToBottom(list === availableValues ? availableRef : selectedRef);
                break;

            default:
                return;
        }

        setList(newList);

        setTimeout(() => {
            document.querySelector(".report-select__item.selected")?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 50);
    };

    const handleAvailableClick = (item: ReportServiceColumns) => {
        setRightSelection([]);
        setLeftSelection((prev) => toggleItemInSelection(item, prev));
    };

    const handleSelectedClick = (item: ReportServiceColumns) => {
        setLeftSelection([]);
        setRightSelection((prev) => toggleItemInSelection(item, prev));
    };

    const leftReorderItem = leftSelection.length === 1 ? leftSelection[0] : null;
    const rightReorderItem = rightSelection.length === 1 ? rightSelection[0] : null;

    const canMoveRight =
        leftSelection.length > 0 &&
        leftSelection.every((reportItem) => availableValues.includes(reportItem)) &&
        !leftSelection.some((reportItem) => selectedValues.includes(reportItem));

    const canMoveLeft =
        rightSelection.length > 0 &&
        rightSelection.every((reportItem) => selectedValues.includes(reportItem)) &&
        !rightSelection.some((reportItem) => availableValues.includes(reportItem));

    const ControlButton = (
        icon: string,
        action: () => void,
        tooltip: string,
        disabled?: boolean
    ) => {
        return (
            <Button
                className='report-control__button'
                icon={`pi pi-angle-${icon}`}
                disabled={disabled || !!report.isdefault}
                tooltip={tooltip}
                tooltipOptions={{ position: "mouse" }}
                outlined
                onClick={action}
            />
        );
    };

    return (
        <div className='col-12 report-controls'>
            <div className='report-controls__main'>
                <div className='report-control__available'>
                    <div className='report-control'>
                        {ControlButton(
                            MOVE_DIRECTION.UP,
                            () =>
                                leftReorderItem &&
                                changeOrder(
                                    leftReorderItem,
                                    MOVE_DIRECTION.UP,
                                    availableValues,
                                    setAvailableValues
                                ),
                            MOVE_DIRECTION.UP,
                            availableValues.findIndex((i) => i === leftReorderItem) === 0 ||
                                !leftReorderItem
                        )}
                        {ControlButton(
                            "double-up",
                            () =>
                                leftReorderItem &&
                                changeOrder(
                                    leftReorderItem,
                                    MOVE_DIRECTION.TOP,
                                    availableValues,
                                    setAvailableValues
                                ),
                            MOVE_DIRECTION.TOP,
                            availableValues.findIndex((i) => i === leftReorderItem) === 0 ||
                                !leftReorderItem
                        )}
                        {ControlButton(
                            MOVE_DIRECTION.DOWN,
                            () =>
                                leftReorderItem &&
                                changeOrder(
                                    leftReorderItem,
                                    MOVE_DIRECTION.DOWN,
                                    availableValues,
                                    setAvailableValues
                                ),
                            MOVE_DIRECTION.DOWN,
                            availableValues.findIndex((i) => i === leftReorderItem) ===
                                availableValues.length - 1 || !leftReorderItem
                        )}
                        {ControlButton(
                            "double-down",
                            () =>
                                leftReorderItem &&
                                changeOrder(
                                    leftReorderItem,
                                    MOVE_DIRECTION.BOTTOM,
                                    availableValues,
                                    setAvailableValues
                                ),
                            MOVE_DIRECTION.BOTTOM,
                            availableValues.findIndex((i) => i === leftReorderItem) ===
                                availableValues.length - 1 || !leftReorderItem
                        )}
                    </div>
                    <div className='report-control__content data-set'>
                        <div className='data-set__control'>
                            <ComboBox
                                className='data-set__dropdown'
                                panelClassName='capitalize'
                                options={availableDatasets}
                                value={dataSet}
                                emptyMessage='-'
                                disabled={!!report.isdefault}
                                onChange={(e) => setDataSet(e.value)}
                                label='Data Set'
                            />
                        </div>

                        <ReportSelect
                            header='Available'
                            values={availableValues}
                            selectedItems={leftSelection}
                            onItemClick={handleAvailableClick}
                            onItemDoubleClick={(item) =>
                                moveItem(
                                    item,
                                    availableValues,
                                    selectedValues,
                                    setAvailableValues,
                                    setSelectedValues,
                                    true
                                )
                            }
                            containerRef={availableRef}
                        />
                    </div>
                </div>
                <div className='report-control report-control__move'>
                    <InfoOverlayPanel
                        panelTitle='Note it'
                        className='data-set__info dataset-info'
                        profileHintKey='columnSelectHintViewed'
                    >
                        <DataSetInfoTemplate />
                    </InfoOverlayPanel>
                    {ControlButton(
                        MOVE_DIRECTION.RIGHT,
                        moveMultipleToSelected,
                        "Move Right",
                        !canMoveRight
                    )}
                    {ControlButton(
                        "double-right",
                        () =>
                            moveAllItems(
                                availableValues,
                                selectedValues,
                                setAvailableValues,
                                setSelectedValues
                            ),
                        "Move All",
                        !availableValues.length
                    )}
                    {ControlButton(
                        MOVE_DIRECTION.LEFT,
                        moveMultipleToAvailable,
                        "Move Left",
                        !canMoveLeft
                    )}
                    {ControlButton(
                        "double-left",
                        () =>
                            moveAllItems(
                                selectedValues,
                                availableValues,
                                setSelectedValues,
                                setAvailableValues
                            ),
                        "Move All",
                        !selectedValues.length
                    )}
                </div>
                <div className='report-control__selected'>
                    <ReportSelect
                        header='Selected'
                        values={selectedValues}
                        selectedItems={rightSelection}
                        onItemClick={handleSelectedClick}
                        onItemDoubleClick={(item) =>
                            moveItem(
                                item,
                                selectedValues,
                                availableValues,
                                setSelectedValues,
                                setAvailableValues,
                                false
                            )
                        }
                        containerRef={selectedRef}
                    />
                    <div className='report-control'>
                        {ControlButton(
                            MOVE_DIRECTION.UP,
                            () =>
                                rightReorderItem &&
                                changeOrder(
                                    rightReorderItem,
                                    MOVE_DIRECTION.UP,
                                    selectedValues,
                                    setSelectedValues
                                ),
                            MOVE_DIRECTION.UP,
                            selectedValues.findIndex((i) => i === rightReorderItem) === 0 ||
                                !rightReorderItem
                        )}
                        {ControlButton(
                            "double-up",
                            () =>
                                rightReorderItem &&
                                changeOrder(
                                    rightReorderItem,
                                    MOVE_DIRECTION.TOP,
                                    selectedValues,
                                    setSelectedValues
                                ),
                            MOVE_DIRECTION.TOP,
                            selectedValues.findIndex((i) => i === rightReorderItem) === 0 ||
                                !rightReorderItem
                        )}
                        {ControlButton(
                            MOVE_DIRECTION.DOWN,
                            () =>
                                rightReorderItem &&
                                changeOrder(
                                    rightReorderItem,
                                    MOVE_DIRECTION.DOWN,
                                    selectedValues,
                                    setSelectedValues
                                ),
                            MOVE_DIRECTION.DOWN,
                            selectedValues.findIndex((i) => i === rightReorderItem) ===
                                selectedValues.length - 1 || !rightReorderItem
                        )}
                        {ControlButton(
                            "double-down",
                            () =>
                                rightReorderItem &&
                                changeOrder(
                                    rightReorderItem,
                                    MOVE_DIRECTION.BOTTOM,
                                    selectedValues,
                                    setSelectedValues
                                ),
                            MOVE_DIRECTION.BOTTOM,
                            selectedValues.findIndex((i) => i === rightReorderItem) ===
                                selectedValues.length - 1 || !rightReorderItem
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
