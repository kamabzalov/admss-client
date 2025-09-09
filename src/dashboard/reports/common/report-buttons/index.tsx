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
import { ReactElement, useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditAccessDialog } from "dashboard/reports/common/access-dialog";
import { useStore } from "store/hooks";

interface ActionButtonsProps {
    report: ReportDocument;
    currentCollectionUID?: string;
    collectionList?: ReportCollection[];
    refetchCollectionsAction?: () => void;
}

export const ActionButtons = ({
    report,
    currentCollectionUID,
    refetchCollectionsAction,
    collectionList,
}: ActionButtonsProps): ReactElement => {
    const [editAccessActive, setEditAccessActive] = useState(false);
    const [addedToCollection, setAddedToCollection] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const toast = useToast();
    const menu = useRef<Menu>(null!);
    const navigate = useNavigate();
    const handleEditAccess = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setEditAccessActive(true);
    };
    const userStore = useStore().userStore;
    const { authUser } = userStore;

    const moveTooltipLabel = useMemo(() => {
        switch (report.isdefault) {
            case 1:
                return "Copy to collection";
            case 0:
                return "Move to collection";
            default:
                return "Add to collection";
        }
    }, [report.isdefault]);

    const items: MenuItem[] = collectionList?.length
        ? [
              {
                  items: collectionList.map((collection) => ({
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
                                  setAddedToCollection(true);
                                  refetchCollectionsAction?.();
                                  setTimeout(() => setAddedToCollection(false), 2000);
                              }
                          } else {
                              if (!currentCollectionUID) return;
                              const response = await moveReportToCollection(
                                  currentCollectionUID,
                                  report.documentUID,
                                  collection.itemUID
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
          ]
        : [
              {
                  items: [
                      {
                          label: "No available collection.",
                          disabled: true,
                      },
                  ],
              },
          ];

    const handleChangeIsFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!authUser) return;
        event.stopPropagation();
        updateReportInfo(authUser?.useruid, {
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
                refetchCollectionsAction?.();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail,
                    life: TOAST_LIFETIME,
                });
            }
        });
    };

    const handleEditReport = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        navigate(`/dashboard/reports/${report.documentUID}`);
    };

    const handleAddToCollection = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsMenuVisible(!isMenuVisible);
        menu.current.toggle(event);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const menuElement = menu.current?.getTarget() as Element;
            if (isMenuVisible && menuElement && !menuElement.contains(target)) {
                menu?.current?.hide(event as unknown as React.SyntheticEvent);
            }
        };

        if (isMenuVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuVisible]);

    return (
        <>
            <div className='reports-actions flex'>
                <Menu
                    model={items}
                    popup
                    ref={menu}
                    className='reports-actions__menu'
                    onHide={() => setIsMenuVisible(false)}
                    pt={{
                        root: {
                            style: {
                                width: !collectionList?.length ? "176px" : "240px",
                                maxHeight: "240px",
                                overflowY: !collectionList?.length ? "hidden" : "auto",
                                overflowX: "hidden",
                                paddingTop: 0,
                            },
                            className: collectionList?.length
                                ? "reports-actions__wrapper"
                                : "reports-actions__wrapper-empty",
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
                    icon={`pi ${addedToCollection ? "pi-check" : "pi-plus"}`}
                    tooltip={moveTooltipLabel}
                    tooltipOptions={{ position: "mouse" }}
                    outlined
                    onClick={handleAddToCollection}
                />
                <Button
                    className='p-button reports-actions__button'
                    icon={`pi pi-${!!report.isfavorite ? "heart-fill" : "heart"}`}
                    outlined
                    onClick={handleChangeIsFavorite}
                    tooltip={!!report.isfavorite ? "Remove from Favorites" : "Add to Favorites"}
                    tooltipOptions={!!report.isfavorite ? { position: "left" } : undefined}
                />
                <Button
                    className='p-button reports-actions__button'
                    icon='icon adms-edit-item'
                    outlined
                    tooltip='Edit Report'
                    tooltipOptions={{ position: "mouse" }}
                    onClick={handleEditReport}
                />
                <Button
                    className='p-button reports-actions__button'
                    icon='icon adms-password'
                    outlined={!editAccessActive}
                    tooltip='Edit Access'
                    tooltipOptions={{ position: "mouse" }}
                    onClick={handleEditAccess}
                />
            </div>
            {editAccessActive && (
                <EditAccessDialog
                    visible={editAccessActive}
                    onHide={() => setEditAccessActive(false)}
                    reportuid={report.documentUID}
                />
            )}
        </>
    );
};
