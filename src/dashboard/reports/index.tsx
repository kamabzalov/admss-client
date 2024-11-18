import React, { ReactElement, useEffect, useState } from "react";
import {
    createReportCollection,
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Accordion, AccordionTab, AccordionTabChangeEvent } from "primereact/accordion";
import "./index.css";
import { BaseResponseError } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Panel } from "primereact/panel";
import { ReportCollection, ReportDocument } from "common/models/reports";
import { useStore } from "store/hooks";
import { CollectionPanelContent } from "dashboard/reports/common/panel-content";
import {
    ReportsPanelHeader,
    ReportsAccordionHeader,
} from "dashboard/reports/common/report-headers";
import { ActionButtons } from "dashboard/reports/common/report-buttons";
import { useNavigate } from "react-router-dom";
import { ReportParameters } from "./common/report-parameters";

export default function Reports(): ReactElement {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [reportSearch, setReportSearch] = useState<string>("");
    const [reportCollections, setReportCollections] = useState<ReportCollection[]>([]);
    const [customCollections, setCustomCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");
    const [newCollectionsReports, setNewCollectionsReports] = useState<ReportDocument[]>([]);
    const [selectedReports, setSelectedReports] = useState<ReportDocument[]>([]);
    const [isCollectionEditing, setIsCollectionEditing] = useState<string | null>(null);
    const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
    const [customActiveIndex, setCustomActiveIndex] = useState<number[]>([]);
    const [isParametersEditing, setIsParametersEditing] = useState<ReportDocument | null>(null);
    const [defaultReportsCount, setDefaultReportsCount] = useState<number>(0);

    const toast = useToast();

    const getReportCollections = () => {
        const qry = reportSearch;
        const params = {
            qry,
        };
        return getUserReportCollectionsContent(
            authUser!.useruid,
            qry.length ? params : undefined
        ).then((response) => {
            const { error } = response as BaseResponseError;
            if (error && toast.current) {
                return toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error,
                    life: TOAST_LIFETIME,
                });
            }
            if (Array.isArray(response)) {
                const collectionsWithoutFavorite = response.filter(
                    (collection: ReportCollection) => collection.description !== "Favorites"
                );
                const customCollections = collectionsWithoutFavorite
                    ?.flatMap((collection) => collection.collections)
                    ?.filter(Boolean);

                const [customCollectionsDefaultsCount] = collectionsWithoutFavorite ?? [];
                const innerCollectionsDefaultsCount =
                    customCollectionsDefaultsCount?.collections?.flatMap(
                        (collection: ReportCollection) => collection?.documents || []
                    );
                setDefaultReportsCount(
                    (customCollectionsDefaultsCount?.documents?.length || 0) +
                        (innerCollectionsDefaultsCount?.length || 0)
                );

                setReportCollections(collectionsWithoutFavorite);
                setCustomCollections(customCollections);
            } else {
                setReportCollections([]);
            }
        });
    };

    const getFavoriteReportCollections = () => {
        return getUserFavoriteReportList(authUser!.useruid).then((response) => {
            if (Array.isArray(response)) {
                setFavoriteCollections(response);
            }
        });
    };

    const handleGetUserReportCollections = async () => {
        await getFavoriteReportCollections();
        await getReportCollections();
    };

    useEffect(() => {
        if (authUser) {
            handleGetUserReportCollections();
        }
    }, [toast, authUser]);

    const handleCreateCollection = () => {
        if (collectionName) {
            createReportCollection(authUser!.useruid, {
                name: collectionName,
                documents: newCollectionsReports,
            }).then((response) => {
                const { error } = response as BaseResponseError;
                if (error && toast.current) {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    handleGetUserReportCollections();
                    toast.current?.show({
                        severity: "success",
                        summary: "Success",
                        detail: "New collection is successfully created!",
                        life: TOAST_LIFETIME,
                    });
                    setCollectionName("");
                    setNewCollectionsReports([]);
                }
            });
        }
    };

    const handleUpdateCollection = (itemuid: string, editCollectionName?: string) => {
        if (collectionName || editCollectionName) {
            createReportCollection(authUser!.useruid, {
                name: collectionName || editCollectionName,
                documents: selectedReports,
                itemuid,
            }).then((response) => {
                const { error } = response as BaseResponseError;
                if (error && toast.current) {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    handleGetUserReportCollections();
                    toast.current?.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Collection is successfully updated!",
                        life: TOAST_LIFETIME,
                    });
                    setCollectionName("");
                    setSelectedReports([]);
                    setIsCollectionEditing(null);
                }
            });
        }
    };

    const handleTabChange = (e: AccordionTabChangeEvent, isCustomTab: boolean = false) => {
        if (isCustomTab) return setCustomActiveIndex(e.index as number[]);
        setActiveIndexes(e.index as number[]);
    };

    const handleCustomEditCollection = (
        event: React.MouseEvent<HTMLElement>,
        id: string,
        index: number
    ) => {
        if (event.target instanceof HTMLElement) {
            if (
                event.target.classList.contains("reports-actions__button") ||
                event.target.classList.contains("p-button-label")
            ) {
                event.stopPropagation();
                setCustomActiveIndex([index]);
                setIsCollectionEditing(id);
            } else {
                return;
            }
        }
    };

    const handleOpenParameters = (event: React.MouseEvent<HTMLElement>, report: ReportDocument) => {
        if (event.target instanceof HTMLElement) {
            if (!event.target.classList.contains("reports__list-item--inner")) return;
        }
        event.stopPropagation();
        event.preventDefault();
        if (isParametersEditing?.itemUID === report.itemUID) {
            setIsParametersEditing(null);
        } else {
            setIsParametersEditing(report);
        }
    };

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card reports'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Reports</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-12'>
                                <Panel
                                    headerTemplate={(options) =>
                                        ReportsPanelHeader({
                                            options,
                                            navigatePath: "create",
                                            state: reportSearch,
                                            isConfirm:
                                                !!selectedReports.length || !!collectionName.length,
                                            setStateAction: setReportSearch,
                                        })
                                    }
                                    className='edit-collection w-full'
                                    collapsed
                                    toggleable
                                >
                                    <CollectionPanelContent
                                        collectionName={collectionName}
                                        collections={reportCollections}
                                        selectedReports={newCollectionsReports}
                                        setCollectionName={setCollectionName}
                                        setSelectedReports={setNewCollectionsReports}
                                        handleCreateCollection={handleCreateCollection}
                                    />
                                </Panel>
                            </div>
                            <div className='col-12'>
                                <Accordion
                                    multiple
                                    className='reports__accordion'
                                    activeIndex={activeIndexes}
                                    onTabChange={handleTabChange}
                                >
                                    {reportCollections &&
                                        [...favoriteCollections, ...reportCollections].map(
                                            (
                                                {
                                                    itemUID,
                                                    name,
                                                    documents,
                                                    userUID,
                                                }: ReportCollection,
                                                index: number
                                            ) => {
                                                const isContainsSearchedValue =
                                                    reportSearch &&
                                                    documents?.some((report) =>
                                                        report.name
                                                            .toLowerCase()
                                                            .includes(reportSearch.toLowerCase())
                                                    );
                                                return (
                                                    <AccordionTab
                                                        key={itemUID}
                                                        header={
                                                            <ReportsAccordionHeader
                                                                title={name}
                                                                label={
                                                                    documents?.some(
                                                                        (report) => report.isNew
                                                                    )
                                                                        ? "New"
                                                                        : ""
                                                                }
                                                                selected={
                                                                    isContainsSearchedValue || false
                                                                }
                                                                info={
                                                                    index === 1
                                                                        ? `(${
                                                                              customCollections?.length ||
                                                                              0
                                                                          } collections / ${defaultReportsCount} reports)
                                                                `
                                                                        : `(${
                                                                              documents?.length || 0
                                                                          } reports)`
                                                                }
                                                            />
                                                        }
                                                        className='reports__accordion-tab opacity-100'
                                                    >
                                                        {index === 1 && (
                                                            <Accordion
                                                                multiple
                                                                activeIndex={customActiveIndex}
                                                                onTabChange={(event) =>
                                                                    handleTabChange(event, true)
                                                                }
                                                                className='reports__accordion reports__accordion--inner'
                                                            >
                                                                {customCollections?.map(
                                                                    (
                                                                        {
                                                                            itemUID,
                                                                            name,
                                                                            isfavorite,
                                                                            documents,
                                                                            userUID,
                                                                        }: ReportCollection,
                                                                        idx: number
                                                                    ) => {
                                                                        const isContainsSearchedValue =
                                                                            reportSearch &&
                                                                            documents?.some(
                                                                                (report) =>
                                                                                    report.name
                                                                                        .toLowerCase()
                                                                                        .includes(
                                                                                            reportSearch.toLowerCase()
                                                                                        )
                                                                            );
                                                                        return (
                                                                            <AccordionTab
                                                                                key={itemUID}
                                                                                header={
                                                                                    <ReportsAccordionHeader
                                                                                        title={
                                                                                            name ||
                                                                                            itemUID
                                                                                        }
                                                                                        label={
                                                                                            documents?.some(
                                                                                                (
                                                                                                    report
                                                                                                ) =>
                                                                                                    report.isNew
                                                                                            )
                                                                                                ? "New"
                                                                                                : ""
                                                                                        }
                                                                                        selected={
                                                                                            isContainsSearchedValue ||
                                                                                            false
                                                                                        }
                                                                                        info={`(${
                                                                                            documents?.length ||
                                                                                            0
                                                                                        } reports)`}
                                                                                        actionButton={
                                                                                            userUID ===
                                                                                                authUser?.useruid &&
                                                                                            !isfavorite ? (
                                                                                                <Button
                                                                                                    label='Edit'
                                                                                                    className='reports-actions__button cursor-pointer'
                                                                                                    outlined
                                                                                                    onClick={(
                                                                                                        e
                                                                                                    ) =>
                                                                                                        handleCustomEditCollection(
                                                                                                            e,
                                                                                                            itemUID,
                                                                                                            idx
                                                                                                        )
                                                                                                    }
                                                                                                />
                                                                                            ) : (
                                                                                                <>

                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                }
                                                                                className='reports__accordion-tab opacity-100'
                                                                            >
                                                                                {isCollectionEditing ===
                                                                                    itemUID &&
                                                                                userUID ===
                                                                                    authUser?.useruid ? (
                                                                                    <div className='edit-collection p-panel'>
                                                                                        <div className='p-panel-content relative'>
                                                                                            <CollectionPanelContent
                                                                                                handleClosePanel={() => {
                                                                                                    setIsCollectionEditing(
                                                                                                        null
                                                                                                    );
                                                                                                    handleGetUserReportCollections();
                                                                                                }}
                                                                                                collectionuid={
                                                                                                    itemUID
                                                                                                }
                                                                                                collectionName={
                                                                                                    name
                                                                                                }
                                                                                                collections={
                                                                                                    reportCollections
                                                                                                }
                                                                                                selectedReports={
                                                                                                    documents ||
                                                                                                    []
                                                                                                }
                                                                                                setCollectionName={
                                                                                                    setCollectionName
                                                                                                }
                                                                                                setSelectedReports={
                                                                                                    setSelectedReports
                                                                                                }
                                                                                                handleCreateCollection={() =>
                                                                                                    handleUpdateCollection(
                                                                                                        itemUID,
                                                                                                        name
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    documents &&
                                                                                    documents.map(
                                                                                        (
                                                                                            report
                                                                                        ) => (
                                                                                            <React.Fragment
                                                                                                key={
                                                                                                    report.itemUID
                                                                                                }
                                                                                            >
                                                                                                <div
                                                                                                    className='reports__list-item reports__list-item--inner'
                                                                                                    key={
                                                                                                        report.itemUID
                                                                                                    }
                                                                                                    onDoubleClick={() => {
                                                                                                        navigate(
                                                                                                            `/dashboard/reports/${report.documentUID}`
                                                                                                        );
                                                                                                    }}
                                                                                                    onClick={(
                                                                                                        event
                                                                                                    ) =>
                                                                                                        handleOpenParameters(
                                                                                                            event,
                                                                                                            report
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <p
                                                                                                        className={
                                                                                                            reportSearch &&
                                                                                                            report.name
                                                                                                                .toLowerCase()
                                                                                                                .includes(
                                                                                                                    reportSearch.toLowerCase()
                                                                                                                )
                                                                                                                ? "searched-item"
                                                                                                                : ""
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            report.name
                                                                                                        }
                                                                                                    </p>
                                                                                                    <ActionButtons
                                                                                                        report={
                                                                                                            report
                                                                                                        }
                                                                                                        collectionList={[
                                                                                                            ...customCollections,
                                                                                                            ...reportCollections,
                                                                                                        ].filter(
                                                                                                            (
                                                                                                                collection
                                                                                                            ) =>
                                                                                                                collection.itemUID !==
                                                                                                                itemUID
                                                                                                        )}
                                                                                                        refetchCollectionsAction={
                                                                                                            handleGetUserReportCollections
                                                                                                        }
                                                                                                    />
                                                                                                </div>
                                                                                                {isParametersEditing?.documentUID ===
                                                                                                    report.documentUID && (
                                                                                                    <ReportParameters
                                                                                                        report={
                                                                                                            isParametersEditing
                                                                                                        }
                                                                                                    />
                                                                                                )}
                                                                                            </React.Fragment>
                                                                                        )
                                                                                    )
                                                                                )}
                                                                            </AccordionTab>
                                                                        );
                                                                    }
                                                                )}
                                                            </Accordion>
                                                        )}
                                                        {documents &&
                                                            documents.map((report) => (
                                                                <React.Fragment
                                                                    key={report.itemUID}
                                                                >
                                                                    <div
                                                                        className='reports__list-item'
                                                                        key={report.itemUID}
                                                                        onClick={(event) =>
                                                                            handleOpenParameters(
                                                                                event,
                                                                                report
                                                                            )
                                                                        }
                                                                        onDoubleClick={() => {
                                                                            navigate(
                                                                                `/dashboard/reports/${report.documentUID}`
                                                                            );
                                                                        }}
                                                                    >
                                                                        <p
                                                                            className={
                                                                                reportSearch &&
                                                                                report.name
                                                                                    .toLowerCase()
                                                                                    .includes(
                                                                                        reportSearch.toLowerCase()
                                                                                    )
                                                                                    ? "searched-item"
                                                                                    : ""
                                                                            }
                                                                        >
                                                                            {report.name}
                                                                        </p>
                                                                        <ActionButtons
                                                                            report={report}
                                                                            tooltip={
                                                                                name === "Favorites"
                                                                                    ? "Add to Collection"
                                                                                    : !!report.isdefault
                                                                                      ? "Copy to Collection"
                                                                                      : "Move to Collection"
                                                                            }
                                                                            collectionList={[
                                                                                ...customCollections,
                                                                                ...reportCollections,
                                                                            ].filter(
                                                                                (collection) =>
                                                                                    collection.itemUID !==
                                                                                    itemUID
                                                                            )}
                                                                            refetchCollectionsAction={
                                                                                handleGetUserReportCollections
                                                                            }
                                                                        />
                                                                    </div>
                                                                    {isParametersEditing?.itemUID ===
                                                                        report.itemUID && (
                                                                        <ReportParameters
                                                                            report={
                                                                                isParametersEditing
                                                                            }
                                                                        />
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                    </AccordionTab>
                                                );
                                            }
                                        )}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
