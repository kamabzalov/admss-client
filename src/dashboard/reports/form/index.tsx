import {
    NODE_TYPES,
    REPORT_TYPES,
    ReportCollection,
    ReportDocument,
    TOAST_MESSAGES,
} from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
    setReportOrder,
    moveReportToCollection,
    setCollectionOrder,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState, useCallback, useRef } from "react";
import { useStore } from "store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css";
import { ReportEditForm } from "./edit";
import { observer } from "mobx-react-lite";
import { ReportFooter } from "./common";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Status } from "common/models/base-response";
import { buildTreeNodes, convertTreeNodesToCollections } from "../common/drag-and-drop";
import { TreeNodeEvent } from "common/models";

export const NodeContent = ({
    node,
    isSelected,
    onClick,
    isTogglerVisible,
}: {
    node: TreeNodeEvent;
    isSelected: boolean;
    onClick: () => void;
    isTogglerVisible?: boolean;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const parent = ref.current?.closest(".p-treenode-content");
        if (parent) {
            if (isTogglerVisible) {
                parent.classList.add("report__list-item--toggler-visible");
            }
            if (isSelected) {
                parent.classList.add("report__list-item--selected-container");
            } else {
                parent.classList.remove("report__list-item--selected-container");
            }
        }
    }, [isSelected, isTogglerVisible]);

    return (
        <div className='w-full' ref={ref}>
            <Button onClick={onClick} className={`report__list-item w-full`} text>
                {node.label}
            </Button>
        </div>
    );
};

export const ReportForm = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const reportStore = useStore().reportStore;
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { authUser } = userStore;
    const toast = useToast();
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});
    const expandedForId = useRef<string | null>(null);

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

    const allNodes = [
        ...favoriteCollections.map((collection) => ({
            key: collection.itemUID,
            label: collection.name,
            type: NODE_TYPES.COLLECTION,
            data: { collection: collection, order: collection.order },
            children:
                collection.documents
                    ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((doc) => ({
                        key: doc.itemUID,
                        label: doc.name,
                        type: NODE_TYPES.DOCUMENT,
                        data: {
                            document: doc,
                            collectionId: collection.itemUID,
                            order: doc.order,
                        },
                    })) || [],
        })),
        ...buildTreeNodes(collections),
    ];

    const findPathToDocument = useCallback(
        (nodes: TreeNode[], docId: string, path: string[] = []): string[] | null => {
            for (let node of nodes) {
                const nodeData = node as TreeNodeEvent;
                if (
                    nodeData.type === NODE_TYPES.DOCUMENT &&
                    nodeData.data.document?.documentUID === docId
                ) {
                    return path;
                }

                if (
                    nodeData.type === NODE_TYPES.COLLECTION &&
                    node.children &&
                    node.children.length > 0
                ) {
                    const newPath = [...path, node.key as string];
                    const result = findPathToDocument(node.children, docId, newPath);
                    if (result) return result;
                }
            }
            return null;
        },
        []
    );

    useEffect(() => {
        if (id && allNodes.length > 0 && expandedForId.current !== id) {
            const path = findPathToDocument(allNodes, id);
            if (path) {
                const newExpandedKeys: { [key: string]: boolean } = {};
                path.forEach((key) => (newExpandedKeys[key] = true));
                setExpandedKeys((prev) => ({ ...prev, ...newExpandedKeys }));
                expandedForId.current = id;
            }
        }
    }, [id, allNodes, findPathToDocument]);

    const handleSelection = (node: TreeNode) => {
        const { type, key, data } = node as TreeNodeEvent;
        if (type === NODE_TYPES.COLLECTION) {
            setExpandedKeys((prev) => {
                const newKeys = { ...prev };
                if (newKeys[key!]) {
                    delete newKeys[key!];
                } else {
                    newKeys[key!] = true;
                }
                return newKeys;
            });
        }
        if (type === NODE_TYPES.DOCUMENT && data.document) {
            const doc: ReportDocument = data.document;
            reportStore.report = doc;
            reportStore.reportName = doc.name;
            navigate(`/dashboard/reports/${doc.documentUID}`);
        }
    };

    const updateDocumentOrderInCollection = async (collectionId: string) => {
        const collection = collections.find((col) => col.itemUID === collectionId);
        if (!collection || !collection.documents) return;
        const updatedReports = collection.documents.map((doc, index) => ({
            ...doc,
            order: index,
        }));
        setCollections((prev) =>
            prev.map((col) =>
                col.itemUID === collectionId ? { ...col, documents: updatedReports } : col
            )
        );
    };

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
        const favoriteNode = updatedNodes.find((node) => node.label === REPORT_TYPES.FAVORITES);
        const otherNodes = updatedNodes.filter((node) => node.label !== REPORT_TYPES.FAVORITES);
        let newFavoriteCollections: ReportCollection[] = [];
        let newCollections: ReportCollection[] = [];
        if (favoriteNode) {
            const favCols = convertTreeNodesToCollections([favoriteNode as TreeNodeEvent]);
            if (favCols.length > 0) {
                newFavoriteCollections = favCols;
            }
        }
        const converted = convertTreeNodesToCollections(otherNodes as TreeNodeEvent[]);
        newCollections = converted;
        setFavoriteCollections(newFavoriteCollections);
        setCollections(newCollections);

        const dragData = dragNode?.data;
        const dropData = dropNode?.data;

        if (
            dragNode?.type === NODE_TYPES.DOCUMENT &&
            dragData?.document &&
            dropNode?.type !== NODE_TYPES.COLLECTION
        ) {
            const collectionId = dragData.collectionId;
            const currentCollectionsLength =
                collections.find((col) => col.itemUID === collectionId)?.collections?.length || 0;

            if (collectionId && dragData.document.documentUID != null && dropIndex != null) {
                const response = await setReportOrder(
                    collectionId,
                    dragData.document.documentUID,
                    dropIndex - currentCollectionsLength
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
            if (sourceCollectionId !== targetCollectionId) {
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
                            <Tree
                                value={allNodes}
                                dragdropScope='reports'
                                onDragDrop={handleDragDrop}
                                expandedKeys={expandedKeys}
                                onToggle={(e) => setExpandedKeys(e.value)}
                                nodeTemplate={(node) => {
                                    const nodeData = node as TreeNodeEvent;
                                    const isSelected =
                                        nodeData.type === NODE_TYPES.DOCUMENT &&
                                        nodeData.data.document?.documentUID === id;
                                    return (
                                        <NodeContent
                                            node={nodeData}
                                            isSelected={isSelected}
                                            onClick={() => handleSelection(node)}
                                            isTogglerVisible={
                                                nodeData.type === NODE_TYPES.COLLECTION
                                            }
                                        />
                                    );
                                }}
                            />
                        </div>
                        <ReportEditForm />
                    </div>
                    <ReportFooter
                        onRefetch={() => {
                            handleGetUserReportCollections(authUser!.useruid);
                        }}
                    />
                </div>
            </div>
        </div>
    );
});
