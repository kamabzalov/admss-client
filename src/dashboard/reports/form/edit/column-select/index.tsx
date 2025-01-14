import { ReportServiceColumns, ReportServices } from "common/models/reports";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
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

export const ReportColumnSelect = observer((): ReactElement => {
    const store = useStore().reportStore;
    const { report } = store;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const toast = useToast();
    const [availableValues, setAvailableValues] = useState<ReportServiceColumns[]>([]);
    const [selectedValues, setSelectedValues] = useState<ReportServiceColumns[]>([]);
    const [dataSet, setDataSet] = useState<ReportServices | null>(null);
    const [currentItem, setCurrentItem] = useState<ReportServiceColumns | null>(null);

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
        const useruid = authUser?.useruid;
        if (dataSet && useruid)
            getReportColumns({ service: dataSet, useruid }).then((response) => {
                if (response?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: response?.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    setAvailableValues(
                        response.filter(
                            (availableItem: ReportServiceColumns) =>
                                !selectedValues.some(
                                    (selectedItem) => selectedItem.data === availableItem.data
                                )
                        )
                    );
                }
            });
    }, [dataSet, authUser?.useruid]);

    useEffect(() => {
        store.reportColumns = selectedValues;
    }, [selectedValues]);

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
        direction: "up" | "down" | "top" | "bottom",
        list: ReportServiceColumns[],
        setList: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        const index = list.indexOf(item);
        if (index === -1) return;

        const newList = [...list];
        if (direction === "up" && index > 0) {
            newList.splice(index - 1, 0, newList.splice(index, 1)[0]);
        } else if (direction === "down" && index < list.length - 1) {
            newList.splice(index + 1, 0, newList.splice(index, 1)[0]);
        } else if (direction === "top") {
            newList.splice(0, 0, newList.splice(index, 1)[0]);
        } else if (direction === "bottom") {
            newList.push(newList.splice(index, 1)[0]);
        }

        setList(newList);
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
                    "up",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "up", availableValues, setAvailableValues),
                    "Up",
                    availableValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    "double-up",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "top", availableValues, setAvailableValues),
                    "Top",
                    availableValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    "down",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "down", availableValues, setAvailableValues),
                    "Down",
                    availableValues.findIndex((i) => i === currentItem) ===
                        availableValues.length - 1 || !currentItem
                )}
                {ControlButton(
                    "double-down",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "bottom", availableValues, setAvailableValues),
                    "Bottom",
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
            />
            <div className='report-control'>
                {ControlButton(
                    "right",
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
                    "left",
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
            />
            <div className='report-control'>
                {ControlButton(
                    "up",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "up", selectedValues, setSelectedValues),
                    "Up",
                    selectedValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}

                {ControlButton(
                    "double-up",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "top", selectedValues, setSelectedValues),
                    "Top",
                    selectedValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}

                {ControlButton(
                    "down",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "down", selectedValues, setSelectedValues),
                    "Down",
                    selectedValues.findIndex((i) => i === currentItem) ===
                        selectedValues.length - 1 || !currentItem
                )}

                {ControlButton(
                    "double-down",
                    () =>
                        currentItem &&
                        changeOrder(currentItem, "bottom", selectedValues, setSelectedValues),
                    "Bottom",
                    selectedValues.findIndex((i) => i === currentItem) ===
                        selectedValues.length - 1 || !currentItem
                )}
            </div>
        </div>
    );
});
