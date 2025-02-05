import { ReportServiceColumns, ReportServices } from "common/models/reports";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useRef, useState } from "react";
import { ReportSelect } from "../../common";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { getReportColumns } from "http/services/reports.service";
import { useStore } from "store/hooks";
import { useToast } from "dashboard/common/toast";

const dataSetValues: ReportServices[] = [
    ReportServices.INVENTORY,
    ReportServices.CONTACTS,
    ReportServices.DEALS,
    ReportServices.ACCOUNTS,
];

const initialDataSetsData: Record<ReportServices, ReportServiceColumns[]> = {
    [ReportServices.INVENTORY]: [],
    [ReportServices.CONTACTS]: [],
    [ReportServices.DEALS]: [],
    [ReportServices.ACCOUNTS]: [],
};

enum MOVE_DIRECTION {
    LEFT = "left",
    RIGHT = "right",
    TOP = "top",
    BOTTOM = "bottom",
    UP = "up",
    DOWN = "down",
}

export const ReportColumnSelect = observer((): ReactElement => {
    const store = useStore().reportStore;
    const { report } = store;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const toast = useToast();
    const [dataSet, setDataSet] = useState<ReportServices | null>(null);
    const [selectedValues, setSelectedValues] = useState<ReportServiceColumns[]>([]);
    const [availableValues, setAvailableValues] = useState<ReportServiceColumns[]>([]);
    const [currentItem, setCurrentItem] = useState<ReportServiceColumns | null>(null);
    const [initialDataSets, setInitialDataSets] =
        useState<Record<ReportServices, ReportServiceColumns[]>>(initialDataSetsData);
    const availableRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (report?.columns) {
            setSelectedValues(report.columns.filter(Boolean));
        }
        return () => {
            setSelectedValues([]);
            setAvailableValues([]);
            setDataSet(null);
        };
    }, [report]);

    useEffect(() => {
        if (dataSet) {
            const allColumns = initialDataSets[dataSet] || [];
            const filtered = allColumns.filter(
                (col) => !selectedValues.some((sel) => sel.data === col.data)
            );
            setAvailableValues(filtered);
        }
    }, [dataSet, selectedValues, initialDataSets]);

    useEffect(() => {
        const useruid = authUser?.useruid;
        if (!dataSet || !useruid) return;
        const alreadyLoaded = initialDataSets[dataSet] && initialDataSets[dataSet].length > 0;
        if (alreadyLoaded) return;
        getReportColumns({ service: dataSet, useruid }).then((response) => {
            if (response?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response?.error,
                    life: TOAST_LIFETIME,
                });
            } else if (response) {
                const columnsWithOrigin = response.map((item: ReportServiceColumns) => ({
                    ...item,
                    originalDataSet: dataSet,
                }));
                setInitialDataSets((prev) => ({
                    ...prev,
                    [dataSet]: columnsWithOrigin,
                }));
            }
        });
    }, [dataSet, authUser?.useruid, toast, initialDataSets]);

    useEffect(() => {
        store.reportColumns = selectedValues;
    }, [selectedValues, store]);

    const scrollToTop = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo({
            top: ref.current.scrollHeight,
            behavior: "smooth",
        });
    };

    const moveItem = (
        item: ReportServiceColumns,
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setFrom(from.filter((i) => i !== item));
        setTo([...to, item]);
        setCurrentItem(null);
    };

    const moveAllItems = (
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setTo([...to, ...from]);
        setFrom([]);
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
            <div className='report-controls__top'>
                <span className='p-float-label'>
                    <Dropdown
                        className='report-controls__dropdown'
                        options={dataSetValues}
                        value={dataSet}
                        emptyMessage='-'
                        disabled={!!report.isdefault}
                        onChange={(e) => setDataSet(e.value)}
                        pt={{
                            wrapper: {
                                className: "capitalize",
                            },
                        }}
                    />
                    <label className='float-label'>Data Set</label>
                </span>
            </div>
            <div className='report-control'>
                {ControlButton(
                    MOVE_DIRECTION.UP,
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.UP,
                            availableValues,
                            setAvailableValues
                        ),
                    MOVE_DIRECTION.UP,
                    availableValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    "double-up",
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.TOP,
                            availableValues,
                            setAvailableValues
                        ),
                    MOVE_DIRECTION.TOP,
                    availableValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    MOVE_DIRECTION.DOWN,
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.DOWN,
                            availableValues,
                            setAvailableValues
                        ),
                    MOVE_DIRECTION.DOWN,
                    availableValues.findIndex((i) => i === currentItem) ===
                        availableValues.length - 1 || !currentItem
                )}
                {ControlButton(
                    "double-down",
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.BOTTOM,
                            availableValues,
                            setAvailableValues
                        ),
                    MOVE_DIRECTION.BOTTOM,
                    availableValues.findIndex((i) => i === currentItem) ===
                        availableValues.length - 1 || !currentItem
                )}
            </div>
            <ReportSelect
                header='Available'
                values={availableValues}
                currentItem={currentItem}
                onItemClick={(item) => setCurrentItem(item)}
                onItemDoubleClick={(item) =>
                    moveItem(
                        item,
                        availableValues,
                        selectedValues,
                        setAvailableValues,
                        setSelectedValues
                    )
                }
                containerRef={availableRef}
            />
            <div className='report-control'>
                {ControlButton(
                    MOVE_DIRECTION.RIGHT,
                    () =>
                        currentItem &&
                        moveItem(
                            currentItem,
                            availableValues,
                            selectedValues,
                            setAvailableValues,
                            setSelectedValues
                        ),
                    "Move Right",
                    !!selectedValues.includes(currentItem!) || !currentItem
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
                    () =>
                        currentItem &&
                        moveItem(
                            currentItem,
                            selectedValues,
                            availableValues,
                            setSelectedValues,
                            setAvailableValues
                        ),
                    "Move Left",
                    !!availableValues.includes(currentItem!) || !currentItem
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
            <ReportSelect
                header='Selected'
                values={selectedValues}
                currentItem={currentItem}
                onItemClick={(item) => setCurrentItem(item)}
                onItemDoubleClick={(item) =>
                    moveItem(
                        item,
                        selectedValues,
                        availableValues,
                        setSelectedValues,
                        setAvailableValues
                    )
                }
                containerRef={selectedRef}
            />
            <div className='report-control'>
                {ControlButton(
                    MOVE_DIRECTION.UP,
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.UP,
                            selectedValues,
                            setSelectedValues
                        ),
                    MOVE_DIRECTION.UP,
                    selectedValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    "double-up",
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.TOP,
                            selectedValues,
                            setSelectedValues
                        ),
                    MOVE_DIRECTION.TOP,
                    selectedValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    MOVE_DIRECTION.DOWN,
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.DOWN,
                            selectedValues,
                            setSelectedValues
                        ),
                    MOVE_DIRECTION.DOWN,
                    selectedValues.findIndex((i) => i === currentItem) ===
                        selectedValues.length - 1 || !currentItem
                )}
                {ControlButton(
                    "double-down",
                    () =>
                        currentItem &&
                        changeOrder(
                            currentItem,
                            MOVE_DIRECTION.BOTTOM,
                            selectedValues,
                            setSelectedValues
                        ),
                    MOVE_DIRECTION.BOTTOM,
                    selectedValues.findIndex((i) => i === currentItem) ===
                        selectedValues.length - 1 || !currentItem
                )}
            </div>
        </div>
    );
});
