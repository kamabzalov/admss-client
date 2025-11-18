import { ReactElement } from "react";
import { Button } from "primereact/button";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { SETTINGS_PAGE } from "common/constants/links";
import { useNavigate } from "react-router-dom";
import "./index.css";

interface UsersHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onAddNew: () => void;
    onPrint: () => void;
    onDownload: () => void;
}

export default function UsersHeader({
    searchValue,
    onSearchChange,
    onAddNew,
    onPrint,
    onDownload,
}: UsersHeaderProps): ReactElement {
    const navigate = useNavigate();
    return (
        <div className='flex flex-wrap gap-3 justify-content-between align-items-center mb-3'>
            <GlobalSearchInput
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <Button
                className='table-header-button table-new-button'
                icon='icon adms-add-item'
                severity='success'
                type='button'
                tooltip='Add new user'
                onClick={onAddNew}
            >
                New
            </Button>
            <Button
                className='table-header-button'
                severity='success'
                type='button'
                icon='icon adms-print'
                tooltip='Print users form'
                onClick={onPrint}
            />
            <Button
                className='table-header-button'
                severity='success'
                type='button'
                icon='icon adms-download'
                tooltip='Download users form'
                onClick={onDownload}
            />
            <Button
                className='table-roles-button ml-auto'
                severity='success'
                type='button'
                icon='icon adms-roles'
                label='Roles'
                onClick={() => navigate(SETTINGS_PAGE.ROLES())}
            />
        </div>
    );
}
