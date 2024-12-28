import React, { ReactElement, useEffect, useState, useCallback } from "react";
import {
    createReportCollection,
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
    moveReportToCollection,
    setCollectionOrder,
    setReportOrder,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { BaseResponseError, Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Panel } from "primereact/panel";
import {
    NODE_TYPES,
    REPORT_TYPES,
    ReportCollection,
    ReportDocument,
    TOAST_MESSAGES,
} from "common/models/reports";
import { useStore } from "store/hooks";
import { CollectionPanelContent } from "dashboard/reports/common/panel-content";
import { ReportsPanelHeader } from "dashboard/reports/common/report-headers";
import { ActionButtons } from "dashboard/reports/common/report-buttons";
import { useNavigate } from "react-router-dom";
import { ReportParameters } from "./common/report-parameters";
import { TreeNodeEvent } from "common/models";
import { convertTreeNodesToCollections } from "./common/drag-and-drop";
import "./index.css";

const EDIT_COLLECTION_CLASSES: Readonly<string[]> = ["reports-actions__button", "p-button-label"];
const OPEN_PARAMETERS_CLASSES: Readonly<string[]> = [
    "reports__list-item--inner",
    "reports__list-item",
    "reports__list-name",
];

export default function Reports(): ReactElement {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const toast = useToast();

    const [reportSearch, setReportSearch] = useState<string>("");
    const [reportCollections, setReportCollections] = useState<ReportCollection[]>([]);
    const [customCollections, setCustomCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");

    const [newCollectionsReports, setNewCollectionsReports] = useState<ReportDocument[]>([]);
    const [selectedReports, setSelectedReports] = useState<ReportDocument[]>([]);
    const [isCollectionEditing, setIsCollectionEditing] = useState<string | null>(null);
    const [isParametersEditing, setIsParametersEditing] = useState<ReportDocument | null>(null);
    const [defaultReportsCount, setDefaultReportsCount] = useState<number>(0);

    const getReportCollections = useCallback(async () => {
        const qry = reportSearch;
        const params = { qry };
        const response = await getUserReportCollectionsContent(
            authUser!.useruid,
            qry.length ? params : undefined
        );
        const { error } = response as BaseResponseError;
        if (error && toast.current) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error,
                life: TOAST_LIFETIME,
            });
        }
        if (Array.isArray(response)) {
            const collectionsWithoutFavorite = response.filter(
                (c) => c.description !== "Favorites"
            );
            const customCols = collectionsWithoutFavorite
                ?.flatMap((col) => col.collections)
                ?.filter(Boolean);
            const [firstCollection] = collectionsWithoutFavorite ?? [];
            const nested = firstCollection?.collections?.flatMap(
                (c: ReportCollection) => c?.documents || []
            );
            setDefaultReportsCount(
                (firstCollection?.documents?.length || 0) + (nested?.length || 0)
            );
            setReportCollections(collectionsWithoutFavorite);
            setCustomCollections(customCols);
        } else {
            setReportCollections([]);
        }
    }, [authUser, reportSearch, toast]);

    const getFavoriteReportCollections = useCallback(async () => {
        const response = await getUserFavoriteReportList(authUser!.useruid);
        if (Array.isArray(response)) {
            setFavoriteCollections(response);
        }
    }, [authUser]);

    const handleGetUserReportCollections = useCallback(async () => {
        await getFavoriteReportCollections();
        await getReportCollections();
    }, [getFavoriteReportCollections, getReportCollections]);

    useEffect(() => {
        if (authUser) {
            handleGetUserReportCollections();
        }
    }, [authUser, handleGetUserReportCollections]);

    const showError = (detail: string) => {
        toast.current?.show({
            severity: "error",
            summary: TOAST_MESSAGES.ERROR,
            detail,
            life: TOAST_LIFETIME,
        });
    };

    const showSuccess = (detail: string) => {
        toast.current?.show({
            severity: "success",
            summary: TOAST_MESSAGES.SUCCESS,
            detail,
            life: TOAST_LIFETIME,
        });
    };

    const allNodes: TreeNode[] = [...favoriteCollections, ...reportCollections].map(
        (collection: ReportCollection, index) => {
            const { itemUID, name, documents } = collection;
            let info = `(${documents?.length || 0} reports)`;
            if (index === 1) {
                info = `(${customCollections?.length || 0} collections / ${defaultReportsCount} reports)`;
            }
            const topLevelLabel = `${name} ${info}`;
            const isEditingThis = isCollectionEditing === itemUID;
            let children: TreeNode[] = [];
            if (index === 1 && customCollections?.length) {
                const customNodes = customCollections.map((custCol) => {
                    const isEditingInner = isCollectionEditing === custCol.itemUID;
                    const innerInfo = `(${custCol.documents?.length || 0} reports)`;
                    const customLabel = `${custCol.name} ${innerInfo}`;
                    const docNodes =
                        custCol.documents?.map((doc) => ({
                            key: doc.itemUID,
                            label: doc.name,
                            data: {
                                type: NODE_TYPES.DOCUMENT,
                                document: doc,
                                collectionId: custCol.itemUID,
                                order: doc.order,
                                parentCollectionUID: custCol.itemUID,
                            },
                        })) || [];
                    return {
                        key: custCol.itemUID,
                        label: customLabel,
                        data: {
                            type: NODE_TYPES.COLLECTION,
                            collectionId: custCol.itemUID,
                            order: custCol.order,
                            collection: custCol,
                            isEditing: isEditingInner,
                        },
                        children: docNodes,
                    };
                });
                children = [...customNodes];
            }
            if (!isEditingThis) {
                const docNodes =
                    documents?.map((reportDoc) => ({
                        key: reportDoc.itemUID,
                        label: reportDoc.name,
                        data: {
                            type: NODE_TYPES.DOCUMENT,
                            document: reportDoc,
                            collectionId: itemUID,
                            order: reportDoc.order,
                            parentCollectionUID: itemUID,
                        },
                    })) || [];
                children = [...children, ...docNodes];
            }
            return {
                key: itemUID,
                label: topLevelLabel,
                data: {
                    type: NODE_TYPES.COLLECTION,
                    collectionId: itemUID,
                    order: collection.order,
                    parentCollectionUID: itemUID,
                    collection,
                    isEditing: isEditingThis,
                },
                children,
            };
        }
    );

    const handleCreateCollection = () => {
        if (!collectionName) return;
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
    };

    const handleUpdateCollection = (collectionUid: string, editCollectionName?: string) => {
        const finalName = collectionName || editCollectionName;
        if (!finalName) return;
        createReportCollection(authUser!.useruid, {
            name: finalName,
            documents: selectedReports,
            itemuid: collectionUid,
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
    };

    const handleCustomEditCollection = (
        event: React.MouseEvent<HTMLElement>,
        collectionUid: string
    ) => {
        const target = event.target as HTMLElement;
        if (EDIT_COLLECTION_CLASSES.some((cls) => target.classList.contains(cls))) {
            event.stopPropagation();
            setIsCollectionEditing(collectionUid);
        }
    };

    const handleOpenParameters = (event: React.MouseEvent<HTMLElement>, report: ReportDocument) => {
        const target = event.target as HTMLElement;
        if (!OPEN_PARAMETERS_CLASSES.some((cls) => target.classList.contains(cls))) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        if (isParametersEditing?.itemUID === report.itemUID) {
            setIsParametersEditing(null);
        } else {
            setIsParametersEditing(report);
        }
    };

    const handleDragDrop = async (event: TreeDragDropEvent) => {
        const dragNode = event.dragNode as TreeNodeEvent | undefined;
        const dropNode = event.dropNode as TreeNodeEvent | undefined;
        const dropIndex = event.dropIndex;
        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            (!!dropNode?.data?.collection?.isdefault || !!dropNode?.data?.collection?.isfavorite)
        ) {
            showError(TOAST_MESSAGES.MOVE_INTO_DEFAULT_ERROR);
            return;
        }
        if (
            dropNode?.type === NODE_TYPES.COLLECTION &&
            dragNode?.type !== NODE_TYPES.DOCUMENT &&
            (!!dropNode.data?.collection?.isdefault || !!dropNode.data?.collection?.isfavorite)
        ) {
            showError(TOAST_MESSAGES.CANNOT_MOVE_INTO_DEFAULT_COLLECTION);
            return;
        }
        const updatedNodes = event.value as TreeNode[];
        const favoritesNode = updatedNodes.find((node) => node.label === REPORT_TYPES.FAVORITES);
        const otherNodes = updatedNodes.filter((node) => node.label !== REPORT_TYPES.FAVORITES);
        let newFavoriteCols: ReportCollection[] = [];
        let newCollections: ReportCollection[] = [];
        if (favoritesNode) {
            const favCols = convertTreeNodesToCollections([favoritesNode as TreeNodeEvent]);
            if (favCols.length > 0) {
                newFavoriteCols = favCols;
            }
        }
        const converted = convertTreeNodesToCollections(otherNodes as TreeNodeEvent[]);
        newCollections = converted;
        setFavoriteCollections(newFavoriteCols);
        setReportCollections(newCollections);
        const dragData = dragNode?.data;
        const dropData = dropNode?.data;
        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            dragData?.document &&
            dropNode?.type !== NODE_TYPES.COLLECTION
        ) {
            const currentCollectionId = dragData.collectionId;
            const currentCollLength =
                reportCollections.find((coll) => coll.itemUID === currentCollectionId)?.collections
                    ?.length || 0;
            if (currentCollectionId && dragData.document.documentUID != null && dropIndex != null) {
                const response = await setReportOrder(
                    currentCollectionId,
                    dragData.document.documentUID,
                    dropIndex - currentCollLength
                );
                if (response?.error) {
                    showError(response.error);
                } else {
                    showSuccess(TOAST_MESSAGES.REPORT_MOVED_SUCCESS);
                    await updateDocumentOrderInCollection(currentCollectionId);
                }
            }
        }
        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            dropNode?.type === NODE_TYPES.COLLECTION &&
            dragData?.document
        ) {
            const sourceCollectionId = dragData.collectionId;
            const targetCollectionId = dropData.collection.itemUID;
            const reportId = dragData.document.documentUID;
            if (sourceCollectionId && sourceCollectionId !== targetCollectionId) {
                const response = await moveReportToCollection(
                    sourceCollectionId,
                    reportId,
                    targetCollectionId
                );
                if (response && response.status === Status.ERROR) {
                    showError(response.error);
                } else {
                    showSuccess(TOAST_MESSAGES.REPORT_MOVED_SUCCESS);
                }
            }
        }
        if (dragNode?.type === NODE_TYPES.COLLECTION && dragData?.collection && dropIndex != null) {
            const sourceCollectionId = dragData.collection.itemUID;
            if (sourceCollectionId) {
                const response = await setCollectionOrder(sourceCollectionId, dropIndex);
                if (response && response.status === Status.ERROR) {
                    showError(response.error);
                } else {
                    showSuccess(TOAST_MESSAGES.COLLECTION_REORDERED_SUCCESS);
                }
            }
        }
    };

    const updateDocumentOrderInCollection = async (collectionUid: string) => {
        const foundCollection = reportCollections.find((col) => col.itemUID === collectionUid);
        if (!foundCollection || !foundCollection.documents) return;
        const updatedDocs = foundCollection.documents.map((doc, idx) => ({
            ...doc,
            order: idx,
        }));
        setReportCollections((prev) =>
            prev.map((c) => (c.itemUID === collectionUid ? { ...c, documents: updatedDocs } : c))
        );
    };

    const nodeTemplate = (node: TreeNode) => {
        const data = node.data || {};
        const nodeType = data.type;
        const isEditing = data.isEditing;
        if (nodeType === NODE_TYPES.COLLECTION && isEditing) {
            const currentCollection: ReportCollection = data.collection;
            return (
                <div className='edit-collection p-panel'>
                    <div className='p-panel-content relative'>
                        <CollectionPanelContent
                            handleClosePanel={() => {
                                setIsCollectionEditing(null);
                                handleGetUserReportCollections();
                            }}
                            collectionuid={currentCollection.itemUID}
                            collectionName={currentCollection.name}
                            collections={[...customCollections, ...reportCollections]}
                            selectedReports={currentCollection.documents || []}
                            setCollectionName={setCollectionName}
                            setSelectedReports={setSelectedReports}
                            handleCreateCollection={() =>
                                handleUpdateCollection(
                                    currentCollection.itemUID,
                                    currentCollection.name
                                )
                            }
                        />
                    </div>
                </div>
            );
        }
        if (nodeType === NODE_TYPES.COLLECTION && !isEditing) {
            const currentCollection: ReportCollection = data.collection;
            const handleEditClick = (ev: React.MouseEvent<HTMLElement>) => {
                handleCustomEditCollection(ev, currentCollection.itemUID);
            };
            const hasNewDocs = currentCollection.documents?.some((doc) => doc.isNew);
            const isMatchedBySearch =
                reportSearch &&
                currentCollection.name?.toLowerCase().includes(reportSearch.toLowerCase());
            return (
                <div className='reports__list-item'>
                    <p className={isMatchedBySearch ? "searched-item" : "reports__list-name"}>
                        {node.label}
                    </p>
                    {hasNewDocs && <div className='reports-accordion-header__label ml-2'>New</div>}
                    {currentCollection.userUID === authUser?.useruid &&
                        !currentCollection.isfavorite && (
                            <Button
                                label='Edit'
                                className='reports-actions__button cursor-pointer'
                                outlined
                                onClick={handleEditClick}
                            />
                        )}
                </div>
            );
        }
        if (nodeType === NODE_TYPES.DOCUMENT) {
            const currentReport: ReportDocument = data.document;
            const isMatchedBySearch =
                reportSearch &&
                currentReport.name.toLowerCase().includes(reportSearch.toLowerCase());
            return (
                <>
                    <div
                        className='reports__list-item reports__list-item--inner'
                        onClick={(ev) => handleOpenParameters(ev, currentReport)}
                        onDoubleClick={() => {
                            navigate(`/dashboard/reports/${currentReport.documentUID}`);
                        }}
                    >
                        <p className={isMatchedBySearch ? "searched-item" : "reports__list-name"}>
                            {currentReport.name}
                        </p>
                        {currentReport.isNew && (
                            <div className='reports-accordion-header__label ml-2'>New</div>
                        )}
                        <ActionButtons
                            report={currentReport}
                            collectionList={[reportCollections[0], ...customCollections].filter(
                                (col) => col.itemUID !== data.parentCollectionUID
                            )}
                            refetchCollectionsAction={handleGetUserReportCollections}
                            currentCollectionUID={data.parentCollectionUID}
                        />
                    </div>
                    {isParametersEditing?.documentUID === currentReport.documentUID && (
                        <ReportParameters report={isParametersEditing} />
                    )}
                </>
            );
        }
        return <span>{node.label}</span>;
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
                                        collections={[...customCollections, ...reportCollections]}
                                        selectedReports={newCollectionsReports}
                                        setCollectionName={setCollectionName}
                                        setSelectedReports={setNewCollectionsReports}
                                        handleCreateCollection={handleCreateCollection}
                                    />
                                </Panel>
                            </div>
                            <div className='col-12'>
                                <Tree
                                    className='reports__tree'
                                    dragdropScope='reports'
                                    onDragDrop={handleDragDrop}
                                    value={allNodes}
                                    nodeTemplate={nodeTemplate}
                                    filter={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
