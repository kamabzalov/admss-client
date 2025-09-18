import { ReactElement, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column, ColumnBodyOptions, ColumnProps } from "primereact/column";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";
import { getUserExportWebList } from "http/services/settings.service";
import { useToastMessage } from "common/hooks";
import { BaseResponseError } from "common/models/base-response";
import { GeneralSettingsWebExport } from "common/models/general-settings";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import "./index.css";

interface TableColumnProps extends ColumnProps {
    field: keyof GeneralSettingsWebExport;
}

const renderColumnsData: TableColumnProps[] = [
    { field: "name", header: "Service" },
    { field: "service_name", header: "Key" },
];

export const SettingsExportWeb = (): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const { showError, showSuccess } = useToastMessage();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
    const [exportWebList, setExportWebList] = useState<GeneralSettingsWebExport[]>([]);

    const isErrorResponse = (
        response: GeneralSettingsWebExport[] | BaseResponseError | undefined
    ): response is BaseResponseError => {
        return Boolean(response && "error" in response);
    };

    const handleGetUserExportWebList = async () => {
        setIsLoading(true);

        const response = await getUserExportWebList(authUser?.useruid);
        if (response && Array.isArray(response) && response.length) {
            setExportWebList(response);
            setSelectedRows(Array(response.length).fill(false));
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
            setSelectedRows(Array(defaultExportWebList.length).fill(false));
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

    const controlColumnHeader = (): ReactElement => (
        <Checkbox
            checked={selectedRows.length > 0 && selectedRows.every((checkbox) => !!checkbox)}
            onClick={({ checked }) => {
                setSelectedRows(selectedRows.map(() => !!checked));
            }}
        />
    );

    const controlColumnBody = (
        _: GeneralSettingsWebExport,
        { rowIndex }: ColumnBodyOptions
    ): ReactElement => {
        return (
            <div className={`flex gap-3 align-items-center`}>
                <Checkbox
                    checked={selectedRows[rowIndex]}
                    onClick={() => {
                        setSelectedRows(
                            selectedRows.map((state, index) =>
                                index === rowIndex ? !state : state
                            )
                        );
                    }}
                />
            </div>
        );
    };

    const dataColumnBody = (
        field: keyof GeneralSettingsWebExport,
        value: string | number,
        rowIndex: number,
        selectedRows: boolean[]
    ): ReactElement => {
        const isSelected = selectedRows[rowIndex];

        if (field === "service_name") {
            const tooltipClass = `settings-export-web__key--tooltip-${rowIndex}`;
            return (
                <>
                    <div
                        className={`settings-export-web__key ${tooltipClass} ${isSelected && "row--selected"}`}
                    >
                        {value}
                    </div>
                    <Tooltip
                        target={`.${tooltipClass}`}
                        content={value as string}
                        position='mouse'
                    />
                </>
            );
        }

        return (
            <div className={`settings-export-web__service ${isSelected && "row--selected"}`}>
                {value}
            </div>
        );
    };

    const actionColumnBody = (serviceName: string, copiedKey: string): ReactElement => {
        const handleCopyData = (key: string) => {
            navigator.clipboard.writeText(key);
            showSuccess(`Service ${serviceName} key copied to clipboard`);
        };

        return (
            <div className='flex gap-3 align-items-center'>
                <Button
                    outlined
                    icon='adms-copy'
                    className='settings-export-web__copy-button'
                    label='Copy'
                    onClick={() => handleCopyData(copiedKey)}
                />
            </div>
        );
    };

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
                        scrollable
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            className='account__table-checkbox'
                            header={exportWebList.length ? controlColumnHeader : ""}
                            body={controlColumnBody}
                            pt={{
                                root: {
                                    style: {
                                        width: exportWebList.length ? "60px" : 0,
                                    },
                                },
                            }}
                        />
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                header={header}
                                key={field}
                                body={({ [field]: value }, { rowIndex }) =>
                                    dataColumnBody(field, value, rowIndex, selectedRows)
                                }
                            />
                        ))}
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            className='account__table-checkbox'
                            body={({ name, service_name }) => actionColumnBody(name, service_name)}
                            pt={{
                                root: {
                                    style: {
                                        width: "100px",
                                        borderLeft: "none",
                                    },
                                },
                            }}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};
