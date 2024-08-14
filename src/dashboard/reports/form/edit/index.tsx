import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useState } from "react";
import { ReportSelect } from "../common";
import { ReportDocument } from "common/models/reports";

const dataSetValues = ["Inventory", "Contacts", "Deals", "Account"];

interface ReportEditFormProps {
    report?: ReportDocument | null;
}

export const ReportEditForm = ({ report }: ReportEditFormProps): ReactElement => {
    const [availableValues, setAvailableValues] = useState<string[]>([
        "Account",
        "Buyer Name",
        "Type",
        "Info (value)",
        "Stock#",
        "VIN",
        "Date",
    ]);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [currentItem, setCurrentItem] = useState<string | null>(null);
    const [dataSet, setDataSet] = useState<string | null>(null);

    const moveItem = (
        item: string,
        from: string[],
        to: string[],
        setFrom: React.Dispatch<React.SetStateAction<string[]>>,
        setTo: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setFrom(from.filter((i) => i !== item));
        setTo([...to, item]);
        setCurrentItem(null);
    };

    const moveAllItems = (
        from: string[],
        to: string[],
        setFrom: React.Dispatch<React.SetStateAction<string[]>>,
        setTo: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        setTo([...to, ...from]);
        setFrom([]);
    };

    const changeAvailableOrder = (item: string, direction: "up" | "down" | "top" | "bottom") => {
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

    const changeSelectedOrder = (item: string, direction: "up" | "down" | "top" | "bottom") => {
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

    return (
        <div className='col-8 grid report-form'>
            <div className='report-form__header uppercase'>{report ? "Edit" : "New"} report</div>
            <div className='report-form__body grid'>
                <div className='col-6'>
                    <span className='p-float-label'>
                        <InputText className='w-full' value={report?.name} />
                        <label className='float-label w-full'>Name</label>
                    </span>
                </div>
                {report && (
                    <>
                        <div className='col-3'>
                            <Button className='uppercase w-full px-6 report__button' outlined>
                                Preview
                            </Button>
                        </div>
                        <div className='col-3'>
                            <Button className='uppercase w-full px-6 report__button' outlined>
                                Download
                            </Button>
                        </div>
                    </>
                )}
                <div className='col-12 report-controls'>
                    <div className='report-controls__top'>
                        <span className='p-float-label'>
                            <Dropdown
                                className='report-controls__dropdown'
                                options={dataSetValues}
                                value={dataSet}
                                onChange={(e) => setDataSet(e.value)}
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
                            onClick={() =>
                                currentItem && changeAvailableOrder(currentItem, "bottom")
                            }
                        />
                    </div>
                    <ReportSelect
                        header='Available'
                        values={availableValues}
                        currentItem={currentItem}
                        onItemClick={(item) => setCurrentItem(item)}
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
                            onClick={() =>
                                currentItem && changeSelectedOrder(currentItem, "bottom")
                            }
                        />
                    </div>
                </div>

                <div className='splitter col-12'>
                    <h3 className='splitter__title m-0 pr-3'>Report options</h3>
                    <hr className='splitter__line flex-1' />
                </div>

                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox checked={false} onChange={() => {}} />
                        Show Totals
                    </label>
                </div>
                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox checked={false} onChange={() => {}} />
                        Show Averages
                    </label>
                </div>
                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox checked={false} onChange={() => {}} />
                        Show Line Count
                    </label>
                </div>

                <div className='splitter col-12'>
                    <h3 className='splitter__title m-0 pr-3'>Report parameters</h3>
                    <hr className='splitter__line flex-1' />
                </div>

                <div className='col-4'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox checked={false} onChange={() => {}} />
                        Ask for Start and End Dates
                    </label>
                </div>
            </div>
        </div>
    );
};
