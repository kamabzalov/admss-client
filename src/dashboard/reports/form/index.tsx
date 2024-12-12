import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
    setReportOrder,
    moveReportToCollection,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
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

interface TreeNodeEvent extends TreeNode {
    type: string;
}

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

    const buildTreeNodes = (collectionsData: ReportCollection[]): TreeNode[] => {
        return collectionsData
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((col) => {
                let children: TreeNode[] = [];
                if (col.collections && col.collections.length) {
                    children = children.concat(buildTreeNodes(col.collections));
                }
                if (col.documents && col.documents.length) {
                    const docNodes = col.documents
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((doc) => ({
                            key: doc.itemUID,
                            label: doc.name,
                            type: "document",
                            data: { document: doc, collectionId: col.itemUID, order: doc.order },
                        }));
                    children = children.concat(docNodes);
                }
                return {
                    key: col.itemUID,
                    label: col.name,
                    type: "collection",
                    data: { collection: col, order: col.order },
                    children,
                };
            });
    };

    const allNodes = [
        ...favoriteCollections.map((collection) => ({
            key: collection.itemUID,
            label: collection.name,
            type: "collection",
            data: { collection: collection, order: collection.order },
            children:
                collection.documents
                    ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((doc) => ({
                        key: doc.itemUID,
                        label: doc.name,
                        type: "document",
                        data: { document: doc, collectionId: collection.itemUID, order: doc.order },
                    })) || [],
        })),
        ...buildTreeNodes(collections),
    ];

    const handleSelection = (node: any) => {
        const { type, data } = node;
        if (type === "document") {
            const doc: ReportDocument = data.document;
            reportStore.report = doc as any;
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

    const convertTreeNodesToCollections = (
        nodes: TreeNodeEvent[],
        parentCollection?: ReportCollection
    ): ReportCollection[] => {
        return nodes.map((node, index) => {
            const data = node.data || {};
            const isCollection = node.type === "collection";
            if (isCollection) {
                const collectionData: ReportCollection = {
                    ...data.collection,
                    order: index,
                    documents: [],
                    collections: [],
                };
                if (node.children && node.children.length) {
                    const docs: ReportDocument[] = [];
                    const cols: ReportCollection[] = [];
                    for (let i = 0; i < node.children.length; i++) {
                        const child = node.children[i] as TreeNodeEvent;
                        if (child.type === "document") {
                            const docData = child.data || {};
                            docs.push({
                                ...docData.document,
                                order: i,
                            });
                        } else if (child.type === "collection") {
                            const subCols = convertTreeNodesToCollections([child], collectionData);
                            cols.push(...subCols);
                        }
                    }
                    collectionData.documents = docs;
                    collectionData.collections = cols;
                }
                return collectionData;
            } else {
                return parentCollection!;
            }
        });
    };

    const handleDragDrop = async (event: TreeDragDropEvent) => {
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
        const dragNode = event.dragNode as TreeNodeEvent | undefined;
        const dropNode = event.dropNode as TreeNodeEvent | undefined;
        if (dragNode && dropNode) {
            const dragData = dragNode.data;
            const dropData = dropNode.data;
            if (dragNode.type === "document" && dropNode.type === "document") {
                const collectionId = dragData?.collectionId;
                const currentCollectionsLength =
                    collections.find((col) => col.itemUID === collectionId)?.collections?.length ||
                    0;
                const response = await setReportOrder(
                    collectionId,
                    dragData.document.documentUID,
                    event.dropIndex - currentCollectionsLength
                );
                if (response?.error) {
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: response.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    handleGetUserReportCollections(authUser?.useruid!);
                }
                if (collectionId && collectionId === dropData?.collectionId) {
                    await updateDocumentOrderInCollection(collectionId);
                }
            }
            if (dragNode.type === "document" && dropNode.type === "collection") {
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
                        toast.current?.show({
                            severity: "error",
                            summary: "Error",
                            detail: response.error,
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
                                expandedKeys={{}}
                                nodeTemplate={(node) => (
                                    <Button
                                        onClick={() => handleSelection(node)}
                                        className='report__list-item w-full'
                                        text
                                    >
                                        {node.label}
                                    </Button>
                                )}
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
