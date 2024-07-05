import { ReportCollection } from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import "./index.css";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { ReportSelect } from "./common";
import { useNavigate } from "react-router-dom";

export const ReportForm = (): ReactElement => {
    const userStore = useStore().userStore;
    const navigate = useNavigate();
    const { authUser } = userStore;
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
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

    const handleGetUserReportCollections = (useruid: string) =>
        getUserReportCollectionsContent(useruid).then((response) => {
            if (Array.isArray(response)) {
                const collectionsWithoutFavorite = response.filter(
                    (collection: ReportCollection) => collection.description !== "Favorites"
                );
                setCollections(collectionsWithoutFavorite);
            } else {
                setCollections([]);
            }
        });

    useEffect(() => {
        if (authUser) {
            handleGetUserReportCollections(authUser.useruid);
            getUserFavoriteReportList(authUser.useruid).then((response) => {
                if (Array.isArray(response)) {
                    setFavoriteCollections(response);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

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
        <div className='grid relative'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={() => navigate("/dashboard/reports")}
            />
            <div className='col-12'>
                <div className='card report'>
                    <div className='card-header flex'>
                        <h2 className='report__title uppercase m-0'>Create custom report</h2>
                    </div>
                    <div className='card-content report__card grid'>
                        <div className='col-4'>
                            <Accordion multiple className='report__accordion'>
                                {collections &&
                                    [...favoriteCollections, ...collections].map(
                                        ({ itemUID, name, documents }: ReportCollection) => (
                                            <AccordionTab
                                                key={itemUID}
                                                header={name}
                                                className='report__accordion-tab'
                                            >
                                                {documents &&
                                                    documents.map((report) => (
                                                        <div
                                                            className='report__list-item'
                                                            key={report.itemUID}
                                                        >
                                                            <p>{report.name}</p>
                                                        </div>
                                                    ))}
                                            </AccordionTab>
                                        )
                                    )}
                            </Accordion>
                        </div>
                        <div className='col-8 grid report-form'>
                            <div className='report-form__header uppercase'>New report</div>
                            <div className='report-form__body grid'>
                                <div className='col-6'>
                                    <span className='p-float-label'>
                                        <InputText className='w-full' />
                                        <label className='float-label w-full'>Name</label>
                                    </span>
                                </div>
                                <div className='col-3'>
                                    <Button
                                        className='uppercase w-full px-6 report__button'
                                        outlined
                                    >
                                        Preview
                                    </Button>
                                </div>
                                <div className='col-3'>
                                    <Button
                                        className='uppercase w-full px-6 report__button'
                                        outlined
                                    >
                                        Download
                                    </Button>
                                </div>
                                <div className='col-12 report-controls'>
                                    <div className='report-controls__top'>
                                        <span className='p-float-label'>
                                            <Dropdown className='report-controls__dropdown' />
                                            <label className='float-label'>Data Set</label>
                                        </span>
                                    </div>
                                    <div className='report-control'>
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-up'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeAvailableOrder(currentItem, "up")
                                            }
                                        />
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-double-up'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeAvailableOrder(currentItem, "top")
                                            }
                                        />
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-down'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeAvailableOrder(currentItem, "down")
                                            }
                                        />
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-double-down'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeAvailableOrder(currentItem, "bottom")
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
                                            onClick={() =>
                                                currentItem &&
                                                changeSelectedOrder(currentItem, "up")
                                            }
                                        />
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-double-up'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeSelectedOrder(currentItem, "top")
                                            }
                                        />
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-down'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeSelectedOrder(currentItem, "down")
                                            }
                                        />
                                        <Button
                                            className='report-control__button'
                                            icon='pi pi-angle-double-down'
                                            outlined
                                            onClick={() =>
                                                currentItem &&
                                                changeSelectedOrder(currentItem, "bottom")
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
                    </div>
                    <div className='report__footer gap-3 mt-8 mr-3'>
                        <Button
                            className='report__icon-button'
                            icon='icon adms-password'
                            severity='secondary'
                            disabled
                        />
                        <Button
                            className='report__icon-button'
                            icon='icon adms-blank'
                            severity='secondary'
                            disabled
                        />
                        <Button
                            className='report__icon-button'
                            icon='icon adms-trash-can'
                            severity='secondary'
                            disabled
                        />
                        <Button className='ml-auto uppercase px-6 report__button' outlined>
                            Cancel
                        </Button>
                        <Button className='uppercase px-6 report__button'>Create</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
