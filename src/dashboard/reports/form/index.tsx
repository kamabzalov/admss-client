import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
    moveReportToCollection,
    setReportOrder,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css";
import { ReportEditForm } from "./edit";
import { observer } from "mobx-react-lite";
import { ReportFooter } from "./common";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";

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
        return collectionsData.map((col) => {
            const children: TreeNode[] = [];

            if (col.collections && col.collections.length) {
                children.push(...buildTreeNodes(col.collections));
            }

            if (col.documents && col.documents.length) {
                children.push(
                    ...col.documents.map((doc) => ({
                        key: doc.itemUID,
                        label: doc.name,
                        type: "document",
                        data: { document: doc, collectionId: col.itemUID },
                    }))
                );
            }

            return {
                key: col.itemUID,
                label: col.name,
                type: "collection",
                data: { collection: col },
                children,
            };
        });
    };

    const allNodes = [
        ...favoriteCollections.map((collection) => ({
            key: collection.itemUID,
            label: collection.name,
            type: "collection",
            data: { collection: collection },
            children:
                collection.documents?.map((doc) => ({
                    key: doc.itemUID,
                    label: doc.name,
                    type: "document",
                    data: { document: doc, collectionId: collection.itemUID },
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

    const handleDragDrop = async (event: any) => {
        const dragType = event.dragNode.type;
        const dropType = event.dropNode.type;
        const dragData = event.dragNode.data;
        const dropData = event.dropNode.data;

        if (dragType === "document" && dropType === "collection") {
            const sourceCollectionId = dragData.collectionId;
            const targetCollectionId = dropData.collection.itemUID;

            if (sourceCollectionId !== targetCollectionId) {
                const report: ReportDocument = dragData.document;
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
            }
        } else if (dragType === "document" && dropType === "document") {
            debugger;
        } else if (dragType === "collection" && dropType === "collection") {
            debugger;
        }
        handleGetUserReportCollections(authUser?.useruid!);
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
                                        className={`report__list-item w-full 
                                        `}
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
