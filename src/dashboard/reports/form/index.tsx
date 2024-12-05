import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
    moveReportToCollection,
    setReportOrder,
} from "http/services/reports.service";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css";
import { ReportEditForm } from "./edit";
import { observer } from "mobx-react-lite";
import { ReportFooter } from "./common";
import { OrderList } from "primereact/orderlist";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";

enum REPORT_TYPES {
    FAVORITES = "Favorites",
    CUSTOM = "Custom reports",
}

export const ReportForm = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const reportStore = useStore().reportStore;
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { authUser } = userStore;
    const toast = useToast();
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [selectedTabUID, setSelectedTabUID] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number[]>(!id ? [1] : []);

    const [draggedReport, setDraggedReport] = useState<{
        report: ReportDocument;
        sourceCollectionId: string;
    } | null>(null);

    const handleGetUserReportCollections = async (useruid: string) => {
        const response = await getUserReportCollectionsContent(useruid);
        if (Array.isArray(response)) {
            const collectionsWithoutFavorite = response.filter(
                (collection: ReportCollection) => collection.description !== REPORT_TYPES.FAVORITES
            );

            const customReportsCollection = collectionsWithoutFavorite.find(
                (collection: ReportCollection) => collection.name === REPORT_TYPES.CUSTOM
            );

            if (customReportsCollection) {
                setCollections([
                    customReportsCollection,
                    ...collectionsWithoutFavorite.filter(
                        (collection) => collection.name !== REPORT_TYPES.CUSTOM
                    ),
                ]);
            } else {
                setCollections(collectionsWithoutFavorite);
            }
        } else {
            setCollections([]);
        }
    };

    useEffect(() => {
        if (authUser) {
            handleGetUserReportCollections(authUser.useruid);
            getUserFavoriteReportList(authUser.useruid).then((response) => {
                if (Array.isArray(response)) {
                    setFavoriteCollections(response);
                }
            });
        }
    }, [authUser]);

    useEffect(() => {
        if (id && collections) {
            const allCollections = [...favoriteCollections, ...collections];

            const findReportInCollections = (
                targetId: string
            ): { mainIndex: number; nestedIndex?: number } | null => {
                const mainIndex = allCollections?.findIndex((collection) => {
                    if (collection.documents?.some((doc) => doc.documentUID === targetId)) {
                        return true;
                    }

                    return collection.collections?.some((nestedCollection) => {
                        if (
                            nestedCollection.documents?.some((doc) => doc.documentUID === targetId)
                        ) {
                            return true;
                        }
                        return false;
                    });
                });

                if (mainIndex !== -1) {
                    const nestedIndex = allCollections[mainIndex]?.collections?.findIndex(
                        (nestedCollection) =>
                            nestedCollection?.documents?.some(
                                (doc) => doc?.documentUID === targetId
                            )
                    );
                    return { mainIndex, nestedIndex: nestedIndex !== -1 ? nestedIndex : undefined };
                }

                return null;
            };

            const foundIndices = findReportInCollections(id);

            if (foundIndices) {
                const { mainIndex } = foundIndices;

                setActiveIndex([mainIndex]);
                setSelectedTabUID(id);
            } else {
                setActiveIndex([1]);
            }
        }
    }, [id, collections, favoriteCollections]);

    const handleAccordionTabChange = (report: ReportDocument) => {
        if (report.documentUID === id) return;
        reportStore.report = report;
        reportStore.reportName = report.name;
        setSelectedTabUID(report.itemUID);
        navigate(`/dashboard/reports/${report.documentUID}`);
    };

    const listItemTemplate = (report: ReportDocument, collectionId: string) => {
        return (
            <Button
                className={`report__list-item w-full ${
                    selectedTabUID === report.documentUID ? "report__list-item--selected" : ""
                }`}
                key={report.itemUID}
                text
                draggable
                onDragStart={(e: React.DragEvent<HTMLButtonElement>) =>
                    handleDragStart(e, report, collectionId)
                }
                onClick={(event) => {
                    event.preventDefault();
                    handleAccordionTabChange(report);
                }}
            >
                <p className='report-item__name'>{report.name}</p>
            </Button>
        );
    };

    const handleChangeReportOrder = async (
        updatedReports: ReportDocument[],
        collectionId: string
    ) => {
        const promises = updatedReports.map((report) => {
            return setReportOrder(collectionId, report.itemUID, report.order);
        });

        const responses = await Promise.all(promises);

        responses.forEach((response, index) => {
            if (response && response.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail:
                        response.error ||
                        `Error while updating report order for "${updatedReports[index].name}"`,
                    life: TOAST_LIFETIME,
                });
            }
        });

        toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Report order updated successfully!",
            life: TOAST_LIFETIME,
        });
    };

    const handleChangeListOrder = async (
        event: { value: ReportDocument[] },
        collectionId: string
    ) => {
        const updatedReports = event.value.map((report, index) => {
            return {
                ...report,
                order: index,
            };
        });

        setCollections((prevCollections) =>
            prevCollections.map((collection) => {
                if (collection.itemUID === collectionId) {
                    return { ...collection, documents: updatedReports };
                }
                return collection;
            })
        );

        await handleChangeReportOrder(updatedReports, collectionId);
    };

    const handleDragStart = (
        e: React.DragEvent,
        report: ReportDocument,
        sourceCollectionId: string
    ) => {
        setDraggedReport({ report, sourceCollectionId });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const reportMove = async (
        report: ReportDocument,
        sourceCollectionId: string,
        targetCollectionId: string
    ) => {
        const response = await moveReportToCollection(
            sourceCollectionId,
            report.documentUID,
            targetCollectionId
        );

        if (response && response.status === Status.ERROR) {
            toast.current?.show({
                severity: "error",
                summary: Status.ERROR,
                detail: response.error || "Error while moving report to collection",
                life: TOAST_LIFETIME,
            });
        } else {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Report moved successfully!",
                life: TOAST_LIFETIME,
            });
            handleGetUserReportCollections(authUser?.useruid!);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCollectionId: string) => {
        e.preventDefault();
        if (!draggedReport) return;

        const { report, sourceCollectionId } = draggedReport;
        if (sourceCollectionId === targetCollectionId) {
        } else {
            setCollections((prevCollections) => {
                let updatedCollections = [...prevCollections];

                updatedCollections = updatedCollections.map((collection) => {
                    if (collection.itemUID === sourceCollectionId) {
                        return {
                            ...collection,
                            documents: collection.documents?.filter(
                                (doc) => doc.documentUID !== report.documentUID
                            ),
                        };
                    }
                    return collection;
                });

                updatedCollections = updatedCollections.map((collection) => {
                    if (collection.itemUID === targetCollectionId) {
                        return {
                            ...collection,
                            documents: [...(collection.documents || []), report],
                        };
                    }
                    return collection;
                });

                return updatedCollections;
            });

            reportMove(report, sourceCollectionId, targetCollectionId);
        }

        setDraggedReport(null);
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
                        <h2 className='report__title uppercase m-0'>
                            {id ? "Edit" : "Create custom"} report
                        </h2>
                        {id && (
                            <Button
                                outlined
                                className='button-rounded ml-3'
                                onClick={() => navigate("/dashboard/reports/create")}
                            >
                                Create new report
                            </Button>
                        )}
                    </div>
                    <div className='card-content report__card grid'>
                        <div className='col-4'>
                            <Accordion
                                activeIndex={activeIndex}
                                onTabChange={(e) => setActiveIndex(e.index as number[])}
                                multiple
                                className='report__accordion'
                            >
                                {[...favoriteCollections, ...collections].map(
                                    ({
                                        itemUID,
                                        name,
                                        documents,
                                        collections: nestedCollections,
                                    }: ReportCollection) => (
                                        <AccordionTab
                                            key={itemUID}
                                            header={
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, itemUID)}
                                                >
                                                    {name}
                                                </div>
                                            }
                                            disabled={
                                                !documents?.length && !nestedCollections?.length
                                            }
                                            className={`report__accordion-tab ${
                                                selectedTabUID === itemUID
                                                    ? "report__list-item--selected"
                                                    : ""
                                            }`}
                                        >
                                            <div className='report__list-wrapper'>
                                                {nestedCollections && (
                                                    <Accordion
                                                        multiple
                                                        className='nested-accordion'
                                                    >
                                                        {nestedCollections.map(
                                                            (nestedCollection) => (
                                                                <AccordionTab
                                                                    key={nestedCollection.itemUID}
                                                                    header={
                                                                        <div
                                                                            onDragOver={
                                                                                handleDragOver
                                                                            }
                                                                            onDrop={(e) =>
                                                                                handleDrop(
                                                                                    e,
                                                                                    nestedCollection.itemUID
                                                                                )
                                                                            }
                                                                        >
                                                                            {nestedCollection.name}
                                                                        </div>
                                                                    }
                                                                    disabled={
                                                                        !nestedCollection.documents
                                                                            ?.length
                                                                    }
                                                                    className={`nested-accordion-tab ${
                                                                        selectedTabUID ===
                                                                        nestedCollection.itemUID
                                                                            ? "report__list-item--selected"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <div className='report__list-wrapper'>
                                                                        {nestedCollection.documents && (
                                                                            <OrderList
                                                                                value={
                                                                                    nestedCollection.documents
                                                                                }
                                                                                itemTemplate={(
                                                                                    item
                                                                                ) =>
                                                                                    listItemTemplate(
                                                                                        item,
                                                                                        nestedCollection.itemUID
                                                                                    )
                                                                                }
                                                                                dragdrop
                                                                                onChange={(e) =>
                                                                                    handleChangeListOrder(
                                                                                        e,
                                                                                        nestedCollection.itemUID
                                                                                    )
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </AccordionTab>
                                                            )
                                                        )}
                                                    </Accordion>
                                                )}
                                                {documents && (
                                                    <OrderList
                                                        key={itemUID}
                                                        itemTemplate={(item) =>
                                                            listItemTemplate(item, itemUID)
                                                        }
                                                        value={documents}
                                                        dragdrop
                                                        onChange={(e) =>
                                                            handleChangeListOrder(e, itemUID)
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </AccordionTab>
                                    )
                                )}
                            </Accordion>
                        </div>
                        <ReportEditForm />
                    </div>
                    <ReportFooter
                        onRefetch={() => {
                            handleGetUserReportCollections(authUser!.useruid);
                            setActiveIndex([1]);
                        }}
                    />
                </div>
            </div>
        </div>
    );
});
