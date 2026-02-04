import { BaseResponseError, Status } from "common/models/base-response";
import { ComboBox } from "dashboard/common/form/dropdown";
import { deleteInventory, getInventoryDeleteReasonsList } from "http/services/inventory-service";
import { observer } from "mobx-react-lite";
import { DropdownProps } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { ListData } from "common/models";
import { INVENTORY_PAGE } from "common/constants/links";
import { useToastMessage } from "common/hooks";

interface DeleteFormProps extends DropdownProps {
    isDeleteConfirm: boolean;
    attemptedSubmit?: boolean;
}

export const DeleteForm = observer(
    ({ isDeleteConfirm, attemptedSubmit }: DeleteFormProps): ReactElement => {
        const userStore = useStore().userStore;
        const { authUser } = userStore;
        const navigate = useNavigate();
        const { id } = useParams();
        const store = useStore().inventoryStore;
        const { showError, showSuccess } = useToastMessage();

        const { deleteReason } = store;

        const [deleteReasonsList, setDeleteReasonsList] = useState<ListData[]>([]);
        const [comment, setComment] = useState<string>("");

        const handleGetDeleteReasonsList = async () => {
            const res = await getInventoryDeleteReasonsList(authUser!.useruid);
            Array.isArray(res) && setDeleteReasonsList(res);
        };

        useEffect(() => {
            handleGetDeleteReasonsList();
        }, []);

        const handleDeleteInventory = async () => {
            if (id && deleteReason) {
                const response = await deleteInventory(id, { reason: deleteReason, comment });
                if (response?.status === Status.ERROR) {
                    const { error } = response as BaseResponseError;
                    showError(error || "Error while deleting inventory");
                } else {
                    navigate(INVENTORY_PAGE.MAIN);
                    showSuccess("Inventory deleted successfully");
                }
            }
        };

        useEffect(() => {
            if (isDeleteConfirm) {
                handleDeleteInventory();
            }
        }, [isDeleteConfirm]);

        return (
            <div className='inventory-form'>
                <div className='inventory-form__title inventory-form__title--danger uppercase'>
                    Delete inventory
                </div>
                <div className='grid'>
                    <div className='col-6 relative'>
                        <ComboBox
                            optionLabel='name'
                            optionValue='name'
                            value={deleteReason}
                            required
                            onChange={({ value }) => {
                                store.deleteReason = value;
                            }}
                            options={deleteReasonsList}
                            className={`w-full vehicle-general__dropdown ${
                                attemptedSubmit && !deleteReason ? "p-invalid" : ""
                            }`}
                            label='Reason (required)'
                        />

                        {attemptedSubmit && !deleteReason && (
                            <small className='p-error'>Data is required</small>
                        )}
                    </div>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <InputTextarea
                                className='w-full'
                                value={comment}
                                pt={{
                                    root: {
                                        style: {
                                            height: "110px",
                                        },
                                    },
                                }}
                                onChange={({ target: { value } }) => {
                                    setComment(value);
                                }}
                            />
                            <label className='float-label'>Comment</label>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);
