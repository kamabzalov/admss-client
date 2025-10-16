import { ReactElement } from "react";
import { Button } from "primereact/button";
import { GlobalSearchInput } from "dashboard/common/form/inputs";

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
    return (
        <div className='flex flex-wrap gap-2 justify-content-between align-items-center mb-3'>
            <div className='flex flex-wrap gap-3 align-items-center'>
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
            </div>
        </div>
    );
}
