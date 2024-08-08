import { ReportACL } from "common/models/reports";
import { DashboardDialog } from "dashboard/common/dialog";
import { getReportAccessList } from "http/services/reports.service";
import { Button, ButtonProps } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { PanelHeaderTemplateOptions } from "primereact/panel";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface EditAccessDialogProps {
    visible: boolean;
    onHide: () => void;
    reportuid: string;
}

const EditAccessDialog = ({ visible, onHide, reportuid }: EditAccessDialogProps): ReactElement => {
    const [accessList, setAccessList] = useState<ReportACL[]>([]);

    useEffect(() => {
        if (visible) {
            getReportAccessList(reportuid).then((response) => {
                if (Array.isArray(response)) {
                    setAccessList(response);
                }
            });
        }
    }, [visible, reportuid]);

    return (
        <DashboardDialog
            className='edit-access'
            footer='Update'
            header='Edit Access'
            visible={visible}
            onHide={onHide}
        >
            <DataTable showGridlines value={accessList}></DataTable>
        </DashboardDialog>
    );
};

export const ActionButtons = ({ reportuid }: { reportuid: string }): ReactElement => {
    const [editAccessActive, setEditAccessActive] = useState(false);

    const handleEditAccess = () => {
        setEditAccessActive(true);
    };

    return (
        <>
            <div className='reports-actions flex'>
                <Button
                    className='p-button reports-actions__button reports-actions__add-button'
                    icon='pi pi-plus'
                    tooltip='Add to Collection'
                    outlined
                />
                <Button
                    className='p-button reports-actions__button'
                    icon='pi pi-heart'
                    outlined
                    tooltip='Add to Favorites'
                />
                <Button
                    className='p-button reports-actions__button'
                    icon='icon adms-password'
                    outlined
                    tooltip='Edit Access'
                    onClick={handleEditAccess}
                />
            </div>
            <EditAccessDialog
                visible={editAccessActive}
                onHide={() => setEditAccessActive(false)}
                reportuid={reportuid}
            />
        </>
    );
};

interface ReportsAccordionHeaderProps {
    title: string;
    info: string;
    actionButton?: ReactElement;
    label?: string | false;
}

export const ReportsAccordionHeader = ({
    title,
    info,
    actionButton,
    label,
}: ReportsAccordionHeaderProps): ReactElement => {
    return (
        <div className='reports-accordion-header'>
            <div className='flex gap-1'>
                <div className='reports-accordion-header__title'>{title}</div>
                <div className='reports-accordion-header__info'>{info}</div>
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
    setStateAction: (state: string) => void;
}

export const ReportsPanelHeader = ({
    options,
    state,
    navigatePath,
    setStateAction,
}: ReportsPanelHeaderProps): ReactElement => {
    const navigate = useNavigate();
    return (
        <div className='reports-header col-12 px-0 pb-3'>
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
        </div>
    );
};
