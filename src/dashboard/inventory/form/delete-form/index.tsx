import { LS_APP_USER } from "common/constants/localStorage";
import { BaseResponseError, Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { AuthUser } from "http/services/auth.service";
import { deleteInventory, getInventoryDeleteReasonsList } from "http/services/inventory-service";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKeyValue } from "services/local-storage.service";

interface DeleteFormProps {
    isDeleteConfirm: boolean;
}

export const DeleteForm = ({ isDeleteConfirm }: DeleteFormProps): ReactElement => {
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const [deleteReasonsList, setDeleteReasonsList] = useState<string[]>([]);
    const [reason, setReason] = useState<string>("");
    const [comment, setComment] = useState<string>("");

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            getInventoryDeleteReasonsList(authUser.useruid).then((res) => {
                Array.isArray(res) && setDeleteReasonsList(res);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDeleteInventory = () => {
        if (id && reason) {
            deleteInventory(id, { reason, comment }).then((response) => {
                if (response?.status === Status.ERROR) {
                    const { error } = response as BaseResponseError;
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: error || "Error while deleting inventory",
                    });
                } else {
                    navigate("/dashboard/inventory");
                }
            });
        }
    };

    useEffect(() => {
        if (isDeleteConfirm) {
            handleDeleteInventory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDeleteConfirm]);

    return (
        <div className='inventory-form'>
            <div className='inventory-form__title inventory-form__title--danger uppercase'>
                Delete inventory
            </div>
            <div className='grid'>
                <div className='col-6'>
                    <span className='p-float-label'>
                        <Dropdown
                            optionLabel='name'
                            optionValue='name'
                            value={reason}
                            required
                            filter
                            onChange={({ value }) => {
                                setReason(value);
                            }}
                            options={deleteReasonsList}
                            className='w-full vehicle-general__dropdown'
                        />
                        <label className='float-label'>Reason (required)</label>
                    </span>
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
};