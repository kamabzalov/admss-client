import { Status } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { ReportAccess, ReportACL, ReportCollection, ReportDocument } from "common/models/reports";
import { TOAST_LIFETIME } from "common/settings";
import { DashboardDialog } from "dashboard/common/dialog";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { TextInput } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import {
    getReportAccessList,
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
import { MultiSelect } from "primereact/multiselect";
import { PanelHeaderTemplateOptions } from "primereact/panel";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
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

const filterOptions = [
    {
        label: "Role",
        items: [
            { name: "All roles", value: "All_roles" },
            { name: "Admin", value: "admin.role" },
            { name: "Manager", value: "manager.role" },
            { name: "Sales person", value: "sales.role" },
        ],
    },
    {
        label: "Access",
        items: [
            { name: "All access", value: "All_access" },
            { name: "Denied", value: "denied.access" },
            { name: "Granted", value: "granted.access" },
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
    const [selectedRole, setSelectedRole] = useState<string[]>([]);
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
                .filter((item) => !item.includes("All_"))
                .join("+");
            if (selectedFilters.length) {
                qry = `${search ? `${qry}+` : ""}${selectedFilters}`;
            }
        }
        qry.length && handleGetReportAccessList({ qry });
    }, [search, selectedRole]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleRoleSelection = (selectedValues: string[]) => {
        let newSelectedValues = [...selectedValues];

        const allRolesSelected = selectedValues.includes("All_roles");
        const allAccessSelected = selectedValues.includes("All_access");

        if (allRolesSelected) {
            const allRoles = filterOptions[0].items.map((item) => item.value);
            newSelectedValues = Array.from(new Set([...newSelectedValues, ...allRoles]));
        }

        if (allAccessSelected) {
            const allAccess = filterOptions[1].items.map((item) => item.value);
            newSelectedValues = Array.from(new Set([...newSelectedValues, ...allAccess]));
        }

        setSelectedRole(newSelectedValues);
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
                        onChange={(e) => {
                            e.stopPropagation();
                            handleRoleSelection(e.value);
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
    refetchAction: () => void;
}

export const ActionButtons = ({
    report,
    refetchAction,
    collectionList,
}: ActionButtonsProps): ReactElement => {
    const [editAccessActive, setEditAccessActive] = useState(false);
    const toast = useToast();
    const menu = useRef<Menu>(null!);

    const handleEditAccess = () => {
        setEditAccessActive(true);
    };

    const items: MenuItem[] = [
        {
            items: collectionList?.map((collection) => ({
                label: collection.name,
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
                refetchAction && refetchAction();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail,
                    life: TOAST_LIFETIME,
                });
            }
        });
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
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={(e) => (isConfirm ? setIsConfirmVisible(e) : options.onTogglerClick(e))}
            />
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

    const selectedItemTemplate = (item: ReportDocument): ReactElement => {
        return <span className='multiselect-label'>{item?.name || ""}</span>;
    };
    return (
        <>
            <h3 className='edit-collection__title'>Add new collection</h3>
            {handleClosePanel && (
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={() => setIsConfirmVisible(true)}
                />
            )}
            <div className='grid edit-collection__form mt-3'>
                <TextInput
                    name='Collection name'
                    colWidth={4}
                    height={50}
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
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
                            value={selectedReports || []}
                            onChange={(e) => {
                                e.stopPropagation();
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
                            onClick={handleClosePanel}
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        className='edit-collection__button'
                        disabled={!collectionName}
                        severity={!collectionName ? "secondary" : "success"}
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
                onHide={() => setIsConfirmVisible(false)}
            />
        </>
    );
};
