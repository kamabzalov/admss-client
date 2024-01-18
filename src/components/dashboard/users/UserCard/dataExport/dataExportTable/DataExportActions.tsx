import { CustomDropdown } from "components/dashboard/helpers/renderDropdownHelper";
import { deleteUserDataExport, resetUserDataExport } from "../DataExport.service";
import { DataExportRecord } from "common/interfaces/DataExport";
import { Status } from "common/interfaces/ActionStatus";

interface DataExportsActionsProps {
    dataExport: DataExportRecord;
    updateAction?: () => void;
}

export const DataExportsActions = ({ dataExport, updateAction }: DataExportsActionsProps) => {
    const handleDeleteItem = () => {
        deleteUserDataExport(dataExport.taskuid).then((res) => {
            if (res.status === Status.OK && updateAction) updateAction();
        });
    };
    const handleResetItem = () => {
        resetUserDataExport(dataExport.taskuid).then((res) => {
            if (res.status === Status.OK && updateAction) updateAction();
        });
    };

    return (
        <>
            <CustomDropdown
                title='Actions'
                items={[
                    {
                        menuItemName: "Delete",
                        icon: "minus-circle",
                        menuItemAction: handleDeleteItem,
                    },
                    {
                        menuItemName: "Reset",
                        icon: "arrows-circle",
                        menuItemAction: handleResetItem,
                    },
                ]}
            />
        </>
    );
};
