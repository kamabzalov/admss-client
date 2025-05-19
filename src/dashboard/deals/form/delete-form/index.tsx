import { BaseResponseError, Status } from "common/models/base-response";
import { ComboBox } from "dashboard/common/form/dropdown";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import { deleteDeal, getDealDeleteReasonsList } from "http/services/deals.service";
import { observer } from "mobx-react-lite";
import { DropdownProps } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";

interface DeleteDealFormProps extends DropdownProps {
    isDeleteConfirm: boolean;
    attemptedSubmit?: boolean;
}

export const DeleteDealForm = observer(
    ({ isDeleteConfirm, attemptedSubmit }: DeleteDealFormProps): ReactElement => {
        const toast = useToast();
        const navigate = useNavigate();
        const { id } = useParams();
        const userStore = useStore().userStore;
        const store = useStore().dealStore;
        const { authUser } = userStore;

        const [deleteDealAndRelatedOption, setDeleteDealAndRelatedOption] =
            useState<boolean>(false);
        const [deleteDealOption, setDeleteDealOption] = useState<boolean>(false);
        const [deleteContactOption, setDeleteContactOption] = useState<boolean>(false);
        const [deleteAccountOption, setDeleteAccountOption] = useState<boolean>(false);
        const [deleteInventoryOption, setDeleteInventoryOption] = useState<boolean>(false);
        const [setInventoryAvailableOption, setSetInventoryAvailableOption] =
            useState<boolean>(false);

        const { deleteReason } = store;

        const [deleteReasonsList, setDeleteReasonsList] = useState<string[]>([]);
        const [comment, setComment] = useState<string>("");

        const handleGetDeleteReasonsList = async () => {
            const res = await getDealDeleteReasonsList(authUser!.useruid);
            Array.isArray(res) && setDeleteReasonsList(res);
        };

        useEffect(() => {
            handleGetDeleteReasonsList();
        }, []);

        const handleDeleteDeal = () => {
            if (id && deleteReason) {
                deleteDeal(id, { reason: deleteReason, comment }).then(
                    (response: BaseResponseError | undefined) => {
                        if (response?.status === Status.ERROR) {
                            const { error } = response as BaseResponseError;
                            toast.current?.show({
                                severity: "error",
                                summary: "Error",
                                detail: error || "Error while deleting deal",
                            });
                        } else {
                            navigate("/dashboard/deals");
                        }
                    }
                );
            }
        };

        useEffect(() => {
            if (isDeleteConfirm) {
                handleDeleteDeal();
            }
        }, [isDeleteConfirm]);

        return (
            <div className='deal-form'>
                <div className='deal-form__title deal-form__title--danger uppercase'>
                    Delete deal
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
                            className={`w-full deal-general__dropdown ${
                                attemptedSubmit && !deleteReason ? "p-invalid" : ""
                            }`}
                            label='Reason'
                        />

                        {attemptedSubmit && !deleteReason && (
                            <small className='p-error'>Data is required</small>
                        )}
                    </div>
                    <div className='col-12 splitter my-3'>
                        <h3 className='splitter__title m-0 pr-3'>Delete options</h3>
                        <hr className='splitter__line flex-1' />
                    </div>

                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the deal and everything related to it'
                            checked={deleteDealAndRelatedOption}
                            onChange={({ checked }) => {
                                setDeleteDealAndRelatedOption((prev) => !prev);
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete only the deal'
                            checked={deleteDealOption}
                            onChange={({ checked }) => {
                                setDeleteDealOption((prev) => !prev);
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the contact'
                            checked={deleteContactOption}
                            onChange={({ checked }) => {
                                setDeleteContactOption((prev) => !prev);
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the account'
                            checked={deleteAccountOption}
                            onChange={({ checked }) => {
                                setDeleteAccountOption((prev) => !prev);
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the inventory'
                            checked={deleteInventoryOption}
                            onChange={({ checked }) => {
                                setDeleteInventoryOption((prev) => !prev);
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Set the inventory to "Available for sale"'
                            checked={setInventoryAvailableOption}
                            onChange={({ checked }) => {
                                setSetInventoryAvailableOption((prev) => !prev);
                            }}
                        />
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
