import { ReactElement, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";
import { getUserExportWebList } from "http/services/settings.service";
import { ExportWebList } from "common/models/export-web";
import { useToastMessage } from "common/hooks";
import { BaseResponseError } from "common/models/base-response";

export const SettingsExportWeb = (): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const { showError } = useToastMessage();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [exportWebList, setExportWebList] = useState<ExportWebList[]>([]);

    const isErrorResponse = (
        response: ExportWebList[] | BaseResponseError | undefined
    ): response is BaseResponseError => {
        return Boolean(response && "error" in response);
    };

    const handleGetUserExportWebList = async () => {
        setIsLoading(true);

        const response = await getUserExportWebList(authUser?.useruid);
        if (response && Array.isArray(response) && response.length) {
            setExportWebList(response);
            setIsLoading(false);
            return;
        }

        if (isErrorResponse(response)) {
            showError(response.error || "Unknown error occurred");
            setIsLoading(false);
            return;
        }

        const defaultExportWebList = await getUserExportWebList();
        if (
            defaultExportWebList &&
            Array.isArray(defaultExportWebList) &&
            defaultExportWebList.length
        ) {
            setExportWebList(defaultExportWebList);
        } else if (isErrorResponse(defaultExportWebList)) {
            showError(defaultExportWebList.error || "Unknown error occurred");
        } else {
            setExportWebList([]);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        handleGetUserExportWebList();
    }, [authUser]);

    return (
        <div className='settings-form'>
            {isLoading && <Loader overlay />}
            <div className='settings-form__title'>Export to Web</div>
            <div className='grid settings-export-web p-2'>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='settings-export-web__table'
                        value={exportWebList}
                        emptyMessage='No export web services configured.'
                        reorderableColumns
                        resizableColumns
                        scrollable
                    >
                        <Column
                            field='name'
                            header='Service'
                            alignHeader='left'
                            headerClassName='cursor-move'
                            className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                        />
                        <Column
                            field='itemuid'
                            header='Key'
                            alignHeader='left'
                            headerClassName='cursor-move'
                            className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};
