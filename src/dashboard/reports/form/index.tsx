import {
    NODE_TYPES,
    ReportCollection,
    ReportDocument,
    TOAST_MESSAGES,
} from "common/models/reports";
import {
    getUserFavoriteReportList,
    setReportOrder,
    moveReportToCollection,
    setCollectionOrder,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useStore } from "store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css";
import { ReportEditForm } from "./edit";
import { observer } from "mobx-react-lite";
import { ReportFooter } from "./common";
import { Tree, TreeDragDropEvent } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Status } from "common/models/base-response";
import { buildTreeNodes } from "../common/drag-and-drop";
import { TreeNodeEvent } from "common/models";
import { useFormExitConfirmation, useToastMessage } from "common/hooks";
import { REPORTS_PAGE } from "common/constants/links";
import { TruncatedText } from "dashboard/common/display";

const COLLECTION_DRAG_DELAY = 1000;
const DEEPLY_NESTED_LEVEL = 3;

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
    const [isDeeplyNested, setIsDeeplyNested] = useState(false);

    const isNew = !!node.data?.document?.isNew;
    const isSimpleNode = node.type === NODE_TYPES.DOCUMENT;

    const getNestingLevel = (element: Element | null): number => {
        const INCREMENT_LEVEL = 1;
        if (!element) return 0;
        const parent = element.closest(".p-treenode");
        if (!parent) return 0;
        return INCREMENT_LEVEL + getNestingLevel(parent.parentElement);
    };

    useEffect(() => {
        const element = ref.current?.closest(".p-treenode-content");

        const isDeeplyNestedNode =
            node.type === NODE_TYPES.DOCUMENT && element
                ? getNestingLevel(element) >= DEEPLY_NESTED_LEVEL
                : false;
        setIsDeeplyNested(isDeeplyNestedNode);
    }, [node.type]);

    useEffect(() => {
        const parent = ref?.current?.closest(".p-treenode-content");
        if (parent) {
            if (isTogglerVisible) {
                parent.classList.add("report__list-item--toggler-visible");
            }
            if (isSelected) {
                parent.classList.add("report__list-item--selected-container");
            } else {
                parent.classList.remove("report__list-item--selected-container");
            }
            if (isSimpleNode) {
                parent.classList.add("simple-node");
            }
            if (isDeeplyNested) {
                parent.classList.add("deeply-nested-node");
            }
        }
    }, [isSelected, isTogglerVisible, isSimpleNode, isDeeplyNested]);

    return (
        <div className='w-full' ref={ref}>
            <Button
                onClick={onClick}
                className={`report__list-item w-full min-w-0 ${isNew ? "report__list-item--new" : ""} ${isDeeplyNested ? "deeply-nested" : ""}`}
                text
            >
                <TruncatedText text={node.label || ""} withTooltip />
            </Button>
        </div>
    );
};

export const ReportForm = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const reportStore = useStore().reportStore;
    const { isReportChanged, allCollections, getUserReportCollections, clearReport } = reportStore;
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { authUser } = userStore;
    const { showError, showSuccess } = useToastMessage();
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});
    const expandedForId = useRef<string | null>(null);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [currentNodeOrder, setCurrentNodeOrder] = useState<number | null>(null);

    const { handleExitClick, ConfirmModalComponent } = useFormExitConfirmation({
        isFormChanged: isReportChanged,
        onConfirmExit: () => navigate(REPORTS_PAGE.MAIN),
        className: "report-confirm-dialog",
    });

    const getCollections = useCallback(async () => {
        if (authUser) {
            const response = await getUserFavoriteReportList(authUser.useruid);
            if (response && Array.isArray(response)) {
                setFavoriteCollections(response);
            }
        }
    }, [authUser]);

    useEffect(() => {
        const loadCollections = async () => {
            try {
                await getCollections();
                if (!id) {
                    await getUserReportCollections();
                }
            } catch (error) {
                showError("Failed to load report collections");
            }
        };

        loadCollections();
        return () => {
            clearReport();
        };
    }, [authUser, getCollections, getUserReportCollections, id]);

    const allNodes = useMemo(
        () => [
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
            ...buildTreeNodes(allCollections),
        ],
        [favoriteCollections, allCollections]
    );

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

    const handleDragEnter = (_: React.DragEvent<HTMLDivElement>, node: TreeNode) => {
        const nodeData = node as TreeNodeEvent;
        if (nodeData.data.document && !currentNodeOrder) {
            setCurrentNodeOrder(nodeData.data.document.order);
        }

        if (nodeData.type === NODE_TYPES.COLLECTION && nodeData.children?.length) {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
            }

            hoverTimerRef.current = setTimeout(() => {
                setExpandedKeys((prev) => ({
                    ...prev,
                    [node.key as string]: true,
                }));
            }, COLLECTION_DRAG_DELAY);
        }
    };

    const handleDragLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    };

    const handleDragDrop = async (event: TreeDragDropEvent) => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }

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
                dropIndex = documentChildren.length - 1;
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

            if (dropIndex !== undefined) {
                const response = await setReportOrder(
                    collectionId,
                    dragData.document.documentUID,
                    dropIndex
                );
                if (response?.error) {
                    showError(response.error);
                } else {
                    setCurrentNodeOrder(null);
                    showSuccess(TOAST_MESSAGES.REPORT_MOVED_SUCCESS);
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
                    showError(response.error || "Error while moving report to collection");
                } else {
                    if (dropIndex !== undefined) {
                        const orderResponse = await setReportOrder(
                            targetCollectionId,
                            reportId,
                            dropIndex
                        );
                        if (orderResponse?.error) {
                            showError(orderResponse.error);
                        } else {
                            showSuccess(TOAST_MESSAGES.REPORT_MOVED_SUCCESS);
                        }
                    } else {
                        showSuccess(TOAST_MESSAGES.REPORT_MOVED_SUCCESS);
                    }
                }
            }
        }

        if (dragNode?.type === NODE_TYPES.COLLECTION && dragData?.collection && dropIndex != null) {
            const sourceCollectionId = dragData.collection.itemUID;
            if (sourceCollectionId) {
                const collectionNodes = allNodes.filter(
                    (node) => (node as TreeNodeEvent).type === NODE_TYPES.COLLECTION
                );
                const dropChild = collectionNodes[event.dropIndex];
                if (dropChild) {
                    const idx = collectionNodes.findIndex((node) => node.key === dropChild.key);
                    if (idx !== -1) {
                        dropIndex = idx;
                    }
                }

                const response = await setCollectionOrder(sourceCollectionId, dropIndex);
                if (response && response.status === Status.ERROR) {
                    showError(response.error || "Error while changing collection order");
                } else {
                    showSuccess(TOAST_MESSAGES.COLLECTION_REORDERED_SUCCESS);
                }
            }
        }

        getCollections();
        getUserReportCollections(true);
    };

    return (
        <div className='grid relative'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={handleExitClick}
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
                    <div className='card-content report__card'>
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
                                    <div
                                        onDragEnter={(e) => handleDragEnter(e, node)}
                                        onDragLeave={handleDragLeave}
                                        className='w-full min-w-0 overflow-hidden'
                                    >
                                        <NodeContent
                                            node={nodeData}
                                            isSelected={isSelected}
                                            onClick={() => handleSelection(node)}
                                            isTogglerVisible={
                                                nodeData.type === NODE_TYPES.COLLECTION
                                            }
                                        />
                                    </div>
                                );
                            }}
                        />
                        <ReportEditForm />
                    </div>
                    <ReportFooter onRefetch={() => getUserReportCollections(true)} />
                </div>
            </div>
            <ConfirmModalComponent />
        </div>
    );
});
