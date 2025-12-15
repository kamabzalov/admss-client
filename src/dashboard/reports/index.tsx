import React, { ReactElement, useEffect, useState, useCallback, useRef } from "react";
import {
    createReportCollection,
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
    moveReportToCollection,
    setCollectionOrder,
    setReportOrder,
    updateCollection,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { BaseResponseError, Status } from "common/models/base-response";
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
import { buildTreeNodes, transformLabel } from "./common/drag-and-drop";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ReportsUserSettings, ServerUserSettings } from "common/models/user";
import "./index.css";
import { typeGuards } from "common/utils";
import { useToastMessage } from "common/hooks";
import { CREATE_ID, REPORTS_PAGE } from "common/constants/links";

const EDIT_COLLECTION_CLASSES: Readonly<string[]> = ["reports-actions__button", "p-button-label"];
const OPEN_PARAMETERS_CLASSES: Readonly<string[]> = [
    "reports__list-item--inner",
    "reports__list-item",
    "reports__list-name",
];

export const Reports = (): ReactElement => {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const { showError, showSuccess } = useToastMessage();

    const [reportSearch, setReportSearch] = useState<string>("");
    const [reportCollections, setReportCollections] = useState<ReportCollection[]>([]);
    const [customCollections, setCustomCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");

    const [newCollectionsReports, setNewCollectionsReports] = useState<ReportDocument[]>([]);
    const [selectedReports, setSelectedReports] = useState<ReportDocument[]>([]);
    const [isCollectionEditing, setIsCollectionEditing] = useState<string | null>(null);
    const [isParametersEditing, setIsParametersEditing] = useState<ReportDocument | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});
    const latestExpandedKeys = useRef<{ [key: string]: boolean }>({});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const savedScrollTopRef = useRef<number | null>(null);
    const latestScrollTopRef = useRef<number>(0);

    const saveReportsSettings = useCallback(async () => {
        if (!authUser) return;

        const scrollTop = latestScrollTopRef.current;

        const response = await getUserSettings(authUser.useruid);
        let allSettings: ServerUserSettings = {} as ServerUserSettings;

        if (response?.profile) {
            try {
                allSettings = JSON.parse(response.profile);
            } catch {
                allSettings = {} as ServerUserSettings;
            }
        }

        const currentReportsSettings: ReportsUserSettings = allSettings.reports || {};

        const updatedSettings: ServerUserSettings = {
            ...allSettings,
            reports: {
                ...currentReportsSettings,
                scrollTop,
                expandedKeys: latestExpandedKeys.current,
            },
        };

        await setUserSettings(authUser.useruid, updatedSettings);
    }, [authUser]);

    const getReportCollections = useCallback(async () => {
        const response = await getUserReportCollectionsContent(authUser!.useruid);
        const { error } = response as BaseResponseError;
        if (error) {
            showError(error);
        }
        if (Array.isArray(response)) {
            const collectionsWithoutFavorite = response.filter(
                (c) => c.description !== "Favorites"
            );
            const customCols = collectionsWithoutFavorite
                ?.flatMap((col) => col.collections)
                ?.filter(Boolean);
            setReportCollections(collectionsWithoutFavorite);
            setCustomCollections(customCols);
        } else {
            setReportCollections([]);
        }
    }, [authUser]);

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

    useEffect(() => {
        const loadSettings = async () => {
            if (!authUser) return;

            const response = await getUserSettings(authUser.useruid);
            if (response?.profile?.length) {
                let allSettings: ServerUserSettings = {} as ServerUserSettings;

                if (response.profile) {
                    try {
                        allSettings = JSON.parse(response.profile);
                    } catch {
                        allSettings = {} as ServerUserSettings;
                    }
                }

                if (allSettings.reports?.expandedKeys) {
                    setExpandedKeys(allSettings.reports.expandedKeys);
                }

                if (typeGuards.isNumber(allSettings.reports?.scrollTop)) {
                    savedScrollTopRef.current = allSettings.reports?.scrollTop ?? 0;
                }
            }
        };

        loadSettings();
    }, [authUser]);

    useEffect(() => {
        latestExpandedKeys.current = expandedKeys;
    }, [expandedKeys]);

    useEffect(() => {
        if (savedScrollTopRef.current != null && containerRef.current) {
            const value = savedScrollTopRef.current;
            savedScrollTopRef.current = null;

            window.requestAnimationFrame(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = value;
                }
            });
        }
    }, [reportCollections, favoriteCollections]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const handleScroll = () => {
            latestScrollTopRef.current = element.scrollTop;
        };

        handleScroll();
        element.addEventListener("scroll", handleScroll);

        return () => {
            element.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        return () => {
            void saveReportsSettings();
        };
    }, [saveReportsSettings]);

    const allNodes: TreeNode[] = [
        ...buildTreeNodes(favoriteCollections, true),
        ...buildTreeNodes(reportCollections, true),
    ];

    const handleCreateCollection = async () => {
        if (!collectionName) return;
        const response = await createReportCollection(authUser!.useruid, {
            name: collectionName,
            documents: newCollectionsReports,
        });
        const { error } = response as BaseResponseError;
        if (error) {
            showError(error);
        } else {
            await handleGetUserReportCollections();
            showSuccess("New collection is successfully created!");
            setCollectionName("");
            setNewCollectionsReports([]);
        }
    };

    const handleUpdateCollection = useCallback(
        async (collectionUid: string, editCollectionName?: string) => {
            const finalName = collectionName || editCollectionName;
            if (!finalName) return;

            const response = await updateCollection(authUser!.useruid, {
                name: finalName,
                documents: selectedReports,
                itemuid: collectionUid,
            });
            const { error } = response as BaseResponseError;
            if (error) {
                showError(error);
            } else {
                await handleGetUserReportCollections();
                showSuccess("Collection is successfully updated!");
                setCollectionName("");
                setSelectedReports([]);
                setIsCollectionEditing(null);
            }
        },
        [authUser, collectionName, selectedReports, handleGetUserReportCollections]
    );

    const handleCustomEditCollection = useCallback(
        (event: React.MouseEvent<HTMLElement>, collectionUid: string) => {
            const target = event.target as HTMLElement;
            if (EDIT_COLLECTION_CLASSES.some((cls) => target.classList.contains(cls))) {
                event.stopPropagation();
                const currentCollection = [...reportCollections, ...customCollections].find(
                    (col) => col.itemUID === collectionUid
                );
                if (currentCollection?.documents) {
                    setSelectedReports(currentCollection.documents as ReportDocument[]);
                }
                setIsCollectionEditing(collectionUid);
            }
        },
        [reportCollections, customCollections]
    );

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

        let dropIndex = 0;
        if (dropNode?.type === NODE_TYPES.COLLECTION) {
            const children = dropNode.children || [];
            const documentChildren = children.filter(
                (node) => (node as TreeNodeEvent).type === NODE_TYPES.DOCUMENT
            );
            const documentKeys = documentChildren.map((node) => node.key);

            if (event.dropIndex >= children.length) {
                dropIndex = documentChildren.length;
            } else {
                const dropChild = children[event.dropIndex];
                if (dropChild) {
                    const idx = documentKeys.indexOf(dropChild.key);
                    if (idx !== -1) {
                        dropIndex = dragNode?.key === dropChild.key ? idx : idx - 1;
                    }
                }
            }
        }

        if (dragNode?.type === NODE_TYPES.COLLECTION) {
            if (event.dropNode && event.dropNode.children) {
                const collectionChildren = event.dropNode.children.filter(
                    (child) => (child as TreeNodeEvent).type === NODE_TYPES.COLLECTION
                );
                const dropPosition = event.dropIndex;

                if (dropPosition >= event.dropNode.children.length) {
                    dropIndex = collectionChildren.length;
                } else {
                    let collectionCount = 0;
                    for (let i = 0; i < dropPosition; i++) {
                        const child = event.dropNode.children[i];
                        if ((child as TreeNodeEvent).type === NODE_TYPES.COLLECTION) {
                            collectionCount++;
                        }
                    }
                    dropIndex = collectionCount;
                }
            } else {
                dropIndex = event.dropIndex;
            }
        }

        if (!dropNode) return;

        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            dragNode?.data?.collectionId !== dropNode?.data?.collection?.itemUID &&
            (!!dropNode?.data?.collection?.isdefault || !!dropNode?.data?.collection?.isfavorite)
        ) {
            showError(TOAST_MESSAGES.MOVE_INTO_DEFAULT_ERROR);
            return;
        }

        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            dropNode?.type === NODE_TYPES.COLLECTION &&
            dragNode?.data?.document?.isdefault &&
            dragNode?.data?.collectionId !== dropNode?.data?.collection?.itemUID
        ) {
            showError(TOAST_MESSAGES.ERROR_CANNOT_MOVE_FROM_DEFAULT_COLLECTION);
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

        const dragData = dragNode?.data;
        const dropData = dropNode?.data;

        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            dragData?.document &&
            dragNode?.data?.collectionId === dropNode?.data?.collection?.itemUID
        ) {
            const collectionId = dragData.collectionId;

            if (dropIndex !== undefined && collectionId && dragData.document.documentUID != null) {
                const response = await setReportOrder(
                    collectionId,
                    dragData.document.documentUID,
                    dropIndex
                );
                if (response?.error) {
                    showError(response.error);
                } else {
                    showSuccess(TOAST_MESSAGES.REPORT_MOVED_SUCCESS);
                    await updateDocumentOrderInCollection(collectionId);
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

        await handleGetUserReportCollections();
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

        if (nodeType === NODE_TYPES.COLLECTION) {
            const currentCollection: ReportCollection = data.collection;
            const handleEditClick = (ev: React.MouseEvent<HTMLElement>) => {
                handleCustomEditCollection(ev, currentCollection.itemUID);
            };
            const hasNewDocs = currentCollection.documents?.some((doc) => doc.isNew);
            const isMatchedBySearch =
                reportSearch &&
                currentCollection.name?.toLowerCase().includes(reportSearch.toLowerCase());
            const isEditing = currentCollection.itemUID === isCollectionEditing;
            return (
                <>
                    <div className='reports__list-item'>
                        <div className={isMatchedBySearch ? "searched-item" : "reports__list-name"}>
                            {typeof node.label === "string"
                                ? transformLabel(node.label)
                                : node.label}
                        </div>
                        {hasNewDocs && <div className='reports-tree-header__label ml-2'>New</div>}
                        {currentCollection.userUID === authUser?.useruid &&
                            !currentCollection.isfavorite &&
                            currentCollection.name !== REPORT_TYPES.CUSTOM && (
                                <Button
                                    label='Edit'
                                    className='reports-actions__button cursor-pointer'
                                    outlined
                                    onClick={handleEditClick}
                                />
                            )}
                    </div>
                    {isEditing && (
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
                                    selectedReports={currentCollection?.documents || []}
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
                    )}
                </>
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
                        onClick={(event) => handleOpenParameters(event, currentReport)}
                        onDoubleClick={async (event: React.MouseEvent<HTMLElement>) => {
                            event.stopPropagation();
                            const target = event.target as HTMLElement;
                            if (
                                OPEN_PARAMETERS_CLASSES.some((cls) =>
                                    target.classList.contains(cls)
                                )
                            ) {
                                await saveReportsSettings();
                                navigate(REPORTS_PAGE.EDIT(currentReport.documentUID));
                            }
                        }}
                    >
                        <p className={isMatchedBySearch ? "searched-item" : "reports__list-name"}>
                            {currentReport.name}
                        </p>
                        {currentReport.isNew ? (
                            <div className='reports-tree-header__label ml-2'>New</div>
                        ) : null}
                        <ActionButtons
                            report={currentReport}
                            collectionList={[reportCollections[0], ...customCollections].filter(
                                (col) => col.itemUID !== data.parentCollectionUID
                            )}
                            refetchCollectionsAction={handleGetUserReportCollections}
                            currentCollectionUID={data.parentCollectionUID}
                            onBeforeEdit={saveReportsSettings}
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
        <div className='card reports' ref={containerRef}>
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
                                    navigatePath: CREATE_ID,
                                    state: reportSearch,
                                    isConfirm: !!selectedReports.length || !!collectionName.length,
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
                            expandedKeys={expandedKeys}
                            onToggle={(e) => {
                                setExpandedKeys(e.value);
                            }}
                            filter={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
