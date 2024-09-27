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
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const toast = useToast();
    const [availableValues, setAvailableValues] = useState<ReportServiceColumns[]>([]);
    const [selectedValues, setSelectedValues] = useState<ReportServiceColumns[]>([]);
    const [dataSet, setDataSet] = useState<ReportServices | null>(null);

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
                    setAvailableValues(response);
                }
            });
    }, [dataSet, authUser?.useruid]);

    useEffect(() => {
        store.reportColumns = selectedValues;
    }, [selectedValues]);

    const [currentItem, setCurrentItem] = useState<ReportServiceColumns | null>(null);
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

    const changeAvailableOrder = (
        item: ReportServiceColumns,
        direction: "up" | "down" | "top" | "bottom"
    ) => {
        if (direction === "up") {
            const index = availableValues.indexOf(item);
            const newItems = [...availableValues];
            newItems.splice(index - 1, 0, newItems.splice(index, 1)[0]);
            setAvailableValues(newItems);
        } else if (direction === "down") {
            const index = availableValues.indexOf(item);
            const newItems = [...availableValues];
            newItems.splice(index + 1, 0, newItems.splice(index, 1)[0]);
            setAvailableValues(newItems);
        } else if (direction === "top") {
            const valuesWithoutItem = availableValues.filter((i) => i !== item);
            setAvailableValues([item, ...valuesWithoutItem]);
        } else if (direction === "bottom") {
            const valuesWithoutItem = availableValues.filter((i) => i !== item);
            setAvailableValues([...valuesWithoutItem, item]);
        }
    };

    const changeSelectedOrder = (
        item: ReportServiceColumns,
        direction: "up" | "down" | "top" | "bottom"
    ) => {
        if (direction === "up") {
            const index = selectedValues.indexOf(item);
            const newItems = [...selectedValues];
            newItems.splice(index - 1, 0, newItems.splice(index, 1)[0]);
            setSelectedValues(newItems);
        } else if (direction === "down") {
            const index = selectedValues.indexOf(item);
            const newItems = [...selectedValues];
            newItems.splice(index + 1, 0, newItems.splice(index, 1)[0]);
            setSelectedValues(newItems);
        } else if (direction === "top") {
            const valuesWithoutItem = selectedValues.filter((i) => i !== item);
            setSelectedValues([item, ...valuesWithoutItem]);
        } else if (direction === "bottom") {
            const valuesWithoutItem = selectedValues.filter((i) => i !== item);
            setSelectedValues([...valuesWithoutItem, item]);
        }
    };

    const handleItemDoubleClick = (item: ReportServiceColumns) => {
        if (availableValues.includes(item)) {
            moveItem(item, availableValues, selectedValues, setAvailableValues, setSelectedValues);
        } else if (selectedValues.includes(item)) {
            moveItem(item, selectedValues, availableValues, setSelectedValues, setAvailableValues);
        }
    };

    return (
        <div className='col-12 report-controls'>
            <div className='report-controls__top'>
                <span className='p-float-label'>
                    <Dropdown
                        className='report-controls__dropdown'
                        options={dataSetValues}
                        value={dataSet}
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
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-up'
                    outlined
                    onClick={() => currentItem && changeAvailableOrder(currentItem, "up")}
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-double-up'
                    outlined
                    onClick={() => currentItem && changeAvailableOrder(currentItem, "top")}
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-down'
                    outlined
                    onClick={() => currentItem && changeAvailableOrder(currentItem, "down")}
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-double-down'
                    outlined
                    onClick={() => currentItem && changeAvailableOrder(currentItem, "bottom")}
                />
            </div>
            <ReportSelect
                header='Available'
                values={availableValues}
                currentItem={currentItem}
                onItemClick={(item) => setCurrentItem(item)}
                onItemDoubleClick={(item) => handleItemDoubleClick(item)}
            />
            <div className='report-control'>
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-right'
                    outlined
                    onClick={() =>
                        currentItem &&
                        moveItem(
                            currentItem,
                            availableValues,
                            selectedValues,
                            setAvailableValues,
                            setSelectedValues
                        )
                    }
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-double-right'
                    outlined
                    onClick={() =>
                        moveAllItems(
                            availableValues,
                            selectedValues,
                            setAvailableValues,
                            setSelectedValues
                        )
                    }
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-left'
                    outlined
                    onClick={() =>
                        currentItem &&
                        moveItem(
                            currentItem,
                            selectedValues,
                            availableValues,
                            setSelectedValues,
                            setAvailableValues
                        )
                    }
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-double-left'
                    outlined
                    onClick={() =>
                        moveAllItems(
                            selectedValues,
                            availableValues,
                            setSelectedValues,
                            setAvailableValues
                        )
                    }
                />
            </div>
            <ReportSelect
                header='Selected'
                values={selectedValues}
                currentItem={currentItem}
                onItemClick={(item) => setCurrentItem(item)}
                onItemDoubleClick={(item) => handleItemDoubleClick(item)}
            />
            <div className='report-control'>
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-up'
                    outlined
                    onClick={() => currentItem && changeSelectedOrder(currentItem, "up")}
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-double-up'
                    outlined
                    onClick={() => currentItem && changeSelectedOrder(currentItem, "top")}
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-down'
                    outlined
                    onClick={() => currentItem && changeSelectedOrder(currentItem, "down")}
                />
                <Button
                    className='report-control__button'
                    icon='pi pi-angle-double-down'
                    outlined
                    onClick={() => currentItem && changeSelectedOrder(currentItem, "bottom")}
                />
            </div>
        </div>
    );
});
