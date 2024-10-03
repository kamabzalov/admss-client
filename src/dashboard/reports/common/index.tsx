import { Status } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { ReportAccess, ReportACL, ReportCollection, ReportDocument } from "common/models/reports";
import { TOAST_LIFETIME } from "common/settings";
import { DashboardDialog } from "dashboard/common/dialog";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { TextInput } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import {
    deleteReportCollection,
    getReportAccessList,
    moveReportToCollection,
    setReportAccessList,
    updateReportInfo,
} from "http/services/reports.service";
import { Button, ButtonProps } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { PanelHeaderTemplateOptions } from "primereact/panel";
import { ChangeEvent, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TableColumnProps extends ColumnProps {
    field: keyof ReportAccess;
}

export type TableColumnsList = Pick<TableColumnProps, "header" | "field">;

const renderColumnsData: TableColumnsList[] = [
    { field: "username", header: "User name" },
    { field: "userrole", header: "Role" },
    { field: "enabled", header: "Access" },
];

interface EditAccessDialogProps {
    visible: boolean;
    onHide: () => void;
    reportuid: string;
}

enum ROLE {
    ALL = "All_roles",
    ADMIN = "admin.role",
    MANAGER = "manager.role",
    SALES = "sales.role",
}

enum ACCESS {
    ALL = "All_access",
    GRANTED = "granted.access",
    DENIED = "denied.access",
}

const filterOptions = [
    {
        label: "Role",
        items: [
            { name: "All roles", value: ROLE.ALL },
            { name: "Admin", value: ROLE.ADMIN },
            { name: "Manager", value: ROLE.MANAGER },
            { name: "Sales person", value: ROLE.SALES },
        ],
    },
    {
        label: "Access",
        items: [
            { name: "All access", value: ACCESS.ALL },
            { name: "Denied", value: ACCESS.DENIED },
            { name: "Granted", value: ACCESS.GRANTED },
        ],
    },
];

export const EditAccessDialog = ({
    visible,
    onHide,
    reportuid,
}: EditAccessDialogProps): ReactElement => {
    const toast = useToast();
    const [accessList, setAccessList] = useState<ReportAccess[]>([]);
    const [selectedRole, setSelectedRole] = useState<(ROLE | ACCESS)[]>([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [search, setSearch] = useState<string>("");

    const handleGetReportAccessList = (params?: QueryParams) => {
        getReportAccessList(reportuid, params).then((response) => {
            if (response?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response?.error || "Error while fetching report access list",
                    life: TOAST_LIFETIME,
                });
            } else {
                const { acl } = response as ReportACL;
                if (Array.isArray(acl)) {
                    const newAccessList = acl.filter(Boolean);
                    setAccessList(newAccessList);
                }
            }
        });
    };

    useEffect(() => {
        if (visible) {
            handleGetReportAccessList();
        }
        return () => {
            setIsButtonDisabled(true);
        };
    }, [visible, reportuid]);

    useEffect(() => {
        let qry: string = search;

        if (selectedRole) {
            const selectedFilters: string = [...selectedRole]
                .filter((item) => !item.includes(ROLE.ALL || ACCESS.ALL))
                .join("+");
            if (selectedFilters.length) {
                qry = `${search ? `${qry}+` : ""}${selectedFilters}`;
            }
        }
        handleGetReportAccessList({ qry });
    }, [search, selectedRole]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleRoleSelection = (selectData: MultiSelectChangeEvent) => {
        const selectedValue: { name: string; value: ROLE | ACCESS } = selectData.selectedOption;
        let newSelectedValues: (ROLE | ACCESS)[] = [...selectedRole];

        const allRoles: ROLE[] = [ROLE.ADMIN, ROLE.MANAGER, ROLE.SALES];
        const allAccess: ACCESS[] = [ACCESS.GRANTED, ACCESS.DENIED];

        if (selectedValue.value === ROLE.ALL) {
            const isAllRolesSelected = newSelectedValues.includes(ROLE.ALL);

            if (isAllRolesSelected) {
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => !allRoles.includes(value as ROLE)
                );
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => value !== ROLE.ALL
                );
            } else {
                newSelectedValues = Array.from(
                    new Set([...newSelectedValues, ...allRoles, ROLE.ALL])
                );
            }
        } else if (selectedValue.value === ACCESS.ALL) {
            const isAllAccessSelected = newSelectedValues.includes(ACCESS.ALL);

            if (isAllAccessSelected) {
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => !allAccess.includes(value as ACCESS)
                );
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => value !== ACCESS.ALL
                );
            } else {
                newSelectedValues = Array.from(
                    new Set([...newSelectedValues, ...allAccess, ACCESS.ALL])
                );
            }
        } else {
            const isItemSelected = newSelectedValues.includes(selectedValue.value);

            if (isItemSelected) {
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => value !== selectedValue.value
                );
            } else {
                newSelectedValues.push(selectedValue.value);
            }

            const allRolesSelected = allRoles.every((role) => newSelectedValues.includes(role));

            if (allRolesSelected) {
                if (!newSelectedValues.includes(ROLE.ALL)) {
                    newSelectedValues.push(ROLE.ALL);
                }
            } else {
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => value !== ROLE.ALL
                );
            }

            const allAccessSelected = allAccess.every((access) =>
                newSelectedValues.includes(access)
            );

            if (allAccessSelected) {
                if (!newSelectedValues.includes(ACCESS.ALL)) {
                    newSelectedValues.push(ACCESS.ALL);
                }
            } else {
                newSelectedValues = newSelectedValues.filter(
                    (value: ROLE | ACCESS) => value !== ACCESS.ALL
                );
            }
        }

        setSelectedRole(newSelectedValues.filter(Boolean));
    };

    const accessField = (data: ReportAccess): ReactElement => {
        const accessBlock = (
            <label
                className={`access-field ${
                    !!data.enabled ? "access-field--green row--selected" : ""
                }`}
            >
                <Checkbox
                    className='access-field__checkbox'
                    onClick={() => {
                        const newList = accessList.map((item: any) => {
                            if (item.username === data.username) {
                                setIsButtonDisabled(false);
                                return { ...item, enabled: !!item.enabled ? 0 : 1 };
                            }
                            return item;
                        });

                        setAccessList(newList);
                    }}
                    checked={!!data.enabled}
                />
                {!!data.enabled ? "Granted" : "Denied"}
            </label>
        );
        return accessBlock;
    };

    const handleSaveAccess = () => {
        setReportAccessList(reportuid, { reportuid, acl: accessList }).then((response) => {
            if (response?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response?.error || "Access update failed",
                    life: TOAST_LIFETIME,
                });
            } else {
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Access updated successfully!",
                    life: TOAST_LIFETIME,
                });
                onHide();
            }
        });
    };

    return (
        <DashboardDialog
            className='edit-access'
            action={handleSaveAccess}
            footer='Update'
            header='Edit Access'
            visible={visible}
            onHide={onHide}
            buttonDisabled={isButtonDisabled}
        >
            <div className='grid'>
                <div className='col-5'>
                    <MultiSelect
                        optionLabel='name'
                        options={filterOptions}
                        className='w-full'
                        optionGroupChildren='items'
                        optionGroupLabel='label'
                        showSelectAll={false}
                        value={selectedRole}
                        display='chip'
                        panelHeaderTemplate={<></>}
                        onChange={(event) => {
                            event.stopPropagation();
                            handleRoleSelection(event);
                        }}
                        pt={{
                            wrapper: {
                                className: "edit-collection__multiselect-wrapper",
                                style: {
                                    maxHeight: "550px",
                                },
                            },
                        }}
                    />
                </div>
                <div className='col-4 ml-auto'>
                    <span className='p-input-icon-right'>
                        <i className='pi pi-search' />
                        <InputText
                            placeholder='Search'
                            className='w-full'
                            value={search}
                            onChange={handleSearch}
                        />
                    </span>
                </div>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        value={accessList}
                        emptyMessage='User not found.'
                        scrollable
                        pt={{
                            wrapper: {
                                className: "edit-collection__table-wrapper",
                                style: {
                                    maxHeight: "590px",
                                },
                            },
                        }}
                    >
                        {renderColumnsData.map((column) => (
                            <Column
                                key={column.field}
                                field={column.field}
                                header={column.header}
                                body={(data) => {
                                    if (column.field === "enabled") {
                                        return accessField(data);
                                    } else {
                                        return data[column.field];
                                    }
                                }}
                            />
                        ))}
                    </DataTable>
                </div>
            </div>
        </DashboardDialog>
    );
};

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
                command: () => {
                    moveReportToCollection(collection.itemUID, report.documentUID).then(
                        (response) => {
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
                    );
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

interface ReportsAccordionHeaderProps {
    title: string;
    info: string;
    actionButton?: ReactElement;
    label?: string | false;
    selected?: boolean;
}

export const ReportsAccordionHeader = ({
    title,
    info,
    actionButton,
    label,
    selected,
}: ReportsAccordionHeaderProps): ReactElement => {
    return (
        <div className='reports-accordion-header'>
            <div className='flex gap-1'>
                <div className='reports-accordion-header__title'>{title}</div>
                <div
                    className={`reports-accordion-header__info ${selected ? "searched-item" : ""}`}
                >
                    {info}
                </div>
                {label && <div className='reports-accordion-header__label'>{label}</div>}
            </div>
            {actionButton}
        </div>
    );
};

interface ReportsPanelHeaderProps extends ButtonProps {
    options: PanelHeaderTemplateOptions;
    state: string;
    navigatePath: string;
    isConfirm: boolean;
    setStateAction: (state: string) => void;
}

export const ReportsPanelHeader = ({
    options,
    state,
    navigatePath,
    isConfirm,
    setStateAction,
}: ReportsPanelHeaderProps): ReactElement => {
    const navigate = useNavigate();
    const [isConfirmVisible, setIsConfirmVisible] =
        useState<React.MouseEvent<HTMLButtonElement> | null>(null);

    const handleClosePanel = () => {
        options.onTogglerClick(isConfirmVisible as React.MouseEvent<HTMLButtonElement>);
    };

    return (
        <div className='reports-header col-12 px-0 pb-3'>
            {!options.collapsed && (
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={(e) =>
                        isConfirm ? setIsConfirmVisible(e) : options.onTogglerClick(e)
                    }
                />
            )}
            <Button
                icon='pi pi-plus'
                className='reports-header__button'
                onClick={options.onTogglerClick}
            >
                New collection
            </Button>
            <Button className='reports-header__button' onClick={() => navigate(navigatePath)}>
                Custom Report
            </Button>
            <span className='p-input-icon-right reports-header__search'>
                <i
                    className={`pi pi-${!state ? "search" : "times cursor-pointer"}`}
                    onClick={() => setStateAction("")}
                />
                <InputText
                    value={state}
                    placeholder='Search'
                    onChange={(e) => setStateAction(e.target.value)}
                />
            </span>
            {isConfirm && isConfirmVisible && (
                <ConfirmModal
                    visible={!!isConfirmVisible}
                    title='Quit Editing?'
                    icon='pi-exclamation-triangle'
                    bodyMessage='
                Are you sure you want to cancel creating a new collection?
                All unsaved data will be lost.'
                    confirmAction={handleClosePanel}
                    draggable={false}
                    rejectLabel='Cancel'
                    acceptLabel='Confirm'
                    className='schedule-confirm-dialog'
                    onHide={() => setIsConfirmVisible(null)}
                />
            )}
        </div>
    );
};

interface CollectionPanelContentProps {
    collectionName: string;
    collectionuid?: string;
    collections: ReportCollection[];
    selectedReports: ReportDocument[];
    setCollectionName: (name: string) => void;
    setSelectedReports: (reports: ReportDocument[]) => void;
    handleCreateCollection: () => void;
    handleClosePanel?: () => void;
}

export const CollectionPanelContent = ({
    collectionName,
    collectionuid,
    collections,
    selectedReports,
    setCollectionName,
    setSelectedReports,
    handleCreateCollection,
    handleClosePanel,
}: CollectionPanelContentProps): ReactElement => {
    const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
    const [collectionNameInput, setCollectionNameInput] = useState<string>(collectionName);
    const [confirmMessage, setConfirmMessage] = useState<string>("");
    const [confirmTitle, setConfirmTitle] = useState<string>("");
    const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
    const toast = useToast();
    const [initialCollectionName, setInitialCollectionName] = useState<string>(collectionName);
    const [initialSelectedReports, setInitialSelectedReports] =
        useState<ReportDocument[]>(selectedReports);
    const [panelSelectedReports, setPanelSelectedReports] =
        useState<ReportDocument[]>(selectedReports);

    useEffect(() => {
        setInitialCollectionName(collectionName);
        setInitialSelectedReports(selectedReports);
    }, [collectionuid]);

    const reportsAreEqual = (reports1: ReportDocument[], reports2: ReportDocument[]) => {
        if (reports1.length !== reports2.length) return false;
        const sorted1 = [...reports1].sort((a, b) => a.itemUID.localeCompare(b.itemUID));
        const sorted2 = [...reports2].sort((a, b) => a.itemUID.localeCompare(b.itemUID));
        return sorted1.every((item, idx) => item.itemUID === sorted2[idx].itemUID);
    };

    const selectedItemTemplate = (item: ReportDocument): ReactElement => {
        return <span className='multiselect-label'>{item?.name || ""}</span>;
    };

    const handleDeleteCollection = () => {
        collectionuid &&
            deleteReportCollection(collectionuid).then((response) => {
                if (response?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: response?.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    handleClosePanel?.();
                    setCollectionNameInput("");
                }
            });
    };

    const handleCloseClick = () => {
        if (isUpdateDisabled) {
            handleClosePanel?.();
        } else {
            setConfirmTitle("Quit Editing?");
            setConfirmMessage(
                "Are you sure you want to cancel editing? All unsaved data will be lost."
            );
            setConfirmAction(() => handleClosePanel!);
            setIsConfirmVisible(true);
        }
    };

    const handleDeleteClick = () => {
        setConfirmTitle("Delete Collection?");
        setConfirmMessage("Are you sure you want to delete this collection?");
        setConfirmAction(() => handleDeleteCollection);
        setIsConfirmVisible(true);
    };

    const isUpdateDisabled = useMemo(() => {
        return (
            !collectionNameInput ||
            (collectionNameInput === initialCollectionName &&
                reportsAreEqual(panelSelectedReports, initialSelectedReports))
        );
    }, [collectionNameInput, initialCollectionName, panelSelectedReports, initialSelectedReports]);

    return (
        <>
            <h3 className='edit-collection__title'>
                {collectionuid ? "Edit" : "Add new"} collection
            </h3>
            {handleClosePanel && (
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={handleCloseClick}
                />
            )}
            <div className='grid edit-collection__form mt-3'>
                <TextInput
                    name='Collection name'
                    colWidth={4}
                    height={50}
                    value={collectionNameInput}
                    onChange={(e) => {
                        setCollectionNameInput(e.target.value);
                        setCollectionName(e.target.value);
                    }}
                />
                <div className='col-8'>
                    <span className='p-float-label'>
                        <MultiSelect
                            filter
                            optionLabel='name'
                            options={collections.filter((collection) => collection.documents)}
                            optionGroupChildren='documents'
                            optionGroupLabel='name'
                            className='w-full edit-collection__multiselect'
                            selectedItemTemplate={(item) => {
                                return selectedItemTemplate(item);
                            }}
                            maxSelectedLabels={4}
                            placeholder='Select reports'
                            showSelectAll={false}
                            value={panelSelectedReports || []}
                            onChange={(e) => {
                                e.stopPropagation();
                                setPanelSelectedReports(e.value);
                                setSelectedReports(e.value);
                            }}
                            pt={{
                                wrapper: {
                                    className: "edit-collection__multiselect-wrapper",
                                    style: {
                                        maxHeight: "550px",
                                    },
                                },
                            }}
                        />
                        <label className='float-label'>Select reports</label>
                    </span>
                </div>
                <div className='col-12 flex justify-content-end gap-3'>
                    {collectionuid && (
                        <Button
                            className='edit-collection__button'
                            type='button'
                            severity='danger'
                            outlined
                            onClick={handleDeleteClick}
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        className='edit-collection__button'
                        disabled={isUpdateDisabled}
                        severity={isUpdateDisabled ? "secondary" : "success"}
                        type='button'
                        onClick={handleCreateCollection}
                        outlined
                    >
                        {collectionuid ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
            <ConfirmModal
                visible={!!isConfirmVisible}
                title={confirmTitle}
                icon='pi-exclamation-triangle'
                bodyMessage={confirmMessage}
                confirmAction={confirmAction}
                draggable={false}
                rejectLabel='Cancel'
                acceptLabel='Confirm'
                className='schedule-confirm-dialog'
                onHide={() => setIsConfirmVisible(false)}
            />
        </>
    );
};
