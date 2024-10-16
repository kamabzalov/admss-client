import { Status } from "common/models/base-response";
import { ReportDocument, ReportCollection } from "common/models/reports";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import {
    addReportToCollection,
    moveReportToCollection,
    updateReportInfo,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { ReactElement, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EditAccessDialog } from "dashboard/reports/common/access-dialog";

interface ActionButtonsProps {
    report: ReportDocument;
    collectionList?: ReportCollection[];
    refetchCollectionsAction?: () => void;
    refetchFavoritesAction?: () => void;
}

export const ActionButtons = ({
    report,
    refetchCollectionsAction,
    refetchFavoritesAction,
    collectionList,
}: ActionButtonsProps): ReactElement => {
    const [editAccessActive, setEditAccessActive] = useState(false);
    const toast = useToast();
    const menu = useRef<Menu>(null!);
    const navigate = useNavigate();

    const handleEditAccess = () => {
        setEditAccessActive(true);
    };

    const items: MenuItem[] = [
        {
            items: collectionList?.map((collection) => ({
                label: collection.name,
                command: async () => {
                    if (!!report.isdefault) {
                        const response = await addReportToCollection(
                            collection.itemUID,
                            report.documentUID
                        );
                        if (response?.status === Status.ERROR) {
                            toast.current?.show({
                                severity: "error",
                                summary: Status.ERROR,
                                detail: response?.error,
                                life: TOAST_LIFETIME,
                            });
                        } else {
                            refetchCollectionsAction?.();
                        }
                    } else {
                        const response = await moveReportToCollection(
                            collection.itemUID,
                            report.documentUID
                        );
                        if (response?.status === Status.ERROR) {
                            toast.current?.show({
                                severity: "error",
                                summary: Status.ERROR,
                                detail: response?.error,
                                life: TOAST_LIFETIME,
                            });
                        } else {
                            refetchCollectionsAction?.();
                        }
                    }
                },
            })),
        },
    ];

    const handleChangeIsFavorite = () => {
        updateReportInfo(report.documentUID, {
            ...report,
            isfavorite: !report.isfavorite ? 1 : 0,
        }).then((response) => {
            if (response && response.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response.error || "Error while changing report favorite status",
                    life: TOAST_LIFETIME,
                });
            } else {
                const detail = !!report.isfavorite
                    ? "Report is successfully removed from Favorites!"
                    : "Report is successfully added to Favorites!";
                refetchFavoritesAction?.();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail,
                    life: TOAST_LIFETIME,
                });
            }
        });
    };

    const handleEditReport = () => {
        navigate(`/dashboard/reports/${report.documentUID}`);
    };

    return (
        <>
            <div className='reports-actions flex'>
                <Menu
                    model={items}
                    popup
                    ref={menu}
                    pt={{
                        root: {
                            style: {
                                width: "240px",
                                maxHeight: "240px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                paddingTop: 0,
                            },
                        },
                        submenuHeader: {
                            className: "reports-actions__submenu-header",
                            style: {
                                padding: 0,
                            },
                        },
                    }}
                />
                <Button
                    className='p-button reports-actions__button reports-actions__add-button'
                    icon='pi pi-plus'
                    tooltip='Add to Collection'
                    outlined
                    onClick={(event) => menu.current.toggle(event)}
                />
                <Button
                    className='p-button reports-actions__button'
                    icon={`pi pi-${!!report.isfavorite ? "heart-fill" : "heart"}`}
                    outlined
                    onClick={handleChangeIsFavorite}
                    tooltip={!!report.isfavorite ? "Remove from Favorites" : "Add to Favorites"}
                />
                <Button
                    className='p-button reports-actions__button'
                    icon='icon adms-edit-item'
                    outlined
                    tooltip='Edit Report'
                    onClick={handleEditReport}
                />
                <Button
                    className='p-button reports-actions__button'
                    icon='icon adms-password'
                    outlined={!editAccessActive}
                    tooltip='Edit Access'
                    onClick={handleEditAccess}
                />
            </div>
            <EditAccessDialog
                visible={editAccessActive}
                onHide={() => setEditAccessActive(false)}
                reportuid={report.documentUID}
            />
        </>
    );
};
