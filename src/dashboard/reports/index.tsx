import { ReactElement, useEffect, useState } from "react";
import {
    createReportCollection,
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import "./index.css";
import { BaseResponseError } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Panel } from "primereact/panel";
import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    ActionButtons,
    CollectionPanelContent,
    ReportsAccordionHeader,
    ReportsPanelHeader,
} from "dashboard/reports/common";
import { useNavigate } from "react-router-dom";
import { useStore } from "store/hooks";

export default function Reports(): ReactElement {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [reportSearch, setReportSearch] = useState<string>("");
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");
    const [newCollectionsReports, setNewCollectionsReports] = useState<ReportDocument[]>([]);
    const [selectedReports, setSelectedReports] = useState<ReportDocument[]>([]);
    const [isCollectionEditing, setIsCollectionEditing] = useState<string | null>(null);

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
                setCollections(collectionsWithoutFavorite);
            } else {
                setCollections([]);
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

    const handleGetUserReportCollections = () => {
        getFavoriteReportCollections();
        return getReportCollections();
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

    const handleUpdateCollection = (itemuid: string) => {
        if (collectionName) {
            createReportCollection(authUser!.useruid, {
                name: collectionName,
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
                }
            });
        }
    };

    const handleEditCollection = (event: React.MouseEvent<HTMLElement>, id: string) => {
        event.preventDefault();
        setIsCollectionEditing(id);
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
                                        collections={collections}
                                        selectedReports={newCollectionsReports}
                                        setCollectionName={setCollectionName}
                                        setSelectedReports={setNewCollectionsReports}
                                        handleCreateCollection={handleCreateCollection}
                                    />
                                </Panel>
                            </div>
                            <div className='col-12'>
                                <Accordion multiple className='reports__accordion'>
                                    {collections &&
                                        [...favoriteCollections, ...collections].map(
                                            ({
                                                itemUID,
                                                name,
                                                isfavorite,
                                                documents,
                                                userUID,
                                            }: ReportCollection) => {
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
                                                                selected={
                                                                    isContainsSearchedValue || false
                                                                }
                                                                info={`(${
                                                                    documents?.length || 0
                                                                } reports)`}
                                                                actionButton={
                                                                    userUID === authUser?.useruid &&
                                                                    !isfavorite ? (
                                                                        <Button
                                                                            label='Edit'
                                                                            className='reports-actions__button'
                                                                            outlined
                                                                            onClick={(e) =>
                                                                                handleEditCollection(
                                                                                    e,
                                                                                    itemUID
                                                                                )
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <></>
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        className='reports__accordion-tab'
                                                    >
                                                        {isCollectionEditing === itemUID &&
                                                        userUID === authUser?.useruid ? (
                                                            <div className='edit-collection p-panel'>
                                                                <div className='p-panel-content relative'>
                                                                    <CollectionPanelContent
                                                                        handleClosePanel={() => {
                                                                            setIsCollectionEditing(
                                                                                null
                                                                            );
                                                                            handleGetUserReportCollections();
                                                                        }}
                                                                        collectionuid={itemUID}
                                                                        collectionName={name}
                                                                        collections={collections}
                                                                        selectedReports={
                                                                            selectedReports
                                                                        }
                                                                        setCollectionName={
                                                                            setCollectionName
                                                                        }
                                                                        setSelectedReports={
                                                                            setSelectedReports
                                                                        }
                                                                        handleCreateCollection={() =>
                                                                            handleUpdateCollection(
                                                                                itemUID
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            documents &&
                                                            documents.map((report) => (
                                                                <div
                                                                    className='reports__list-item reports__list-item--inner'
                                                                    key={report.itemUID}
                                                                >
                                                                    <p
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/dashboard/reports/${report.itemUID}`
                                                                            )
                                                                        }
                                                                    >
                                                                        {report.name}
                                                                    </p>
                                                                    <ActionButtons
                                                                        report={report}
                                                                        collectionList={collections}
                                                                        refetchCollectionsAction={
                                                                            getReportCollections
                                                                        }
                                                                        refetchFavoritesAction={
                                                                            getFavoriteReportCollections
                                                                        }
                                                                    />
                                                                </div>
                                                            ))
                                                        )}
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
