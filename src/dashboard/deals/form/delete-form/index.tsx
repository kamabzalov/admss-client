import { toBinary } from "common/helpers";
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
import { DEAL_DELETE_MESSAGES } from "store/stores/deal";

enum DELETE_OPTION {
    DELETE_EVERYTHING = "deleteEverything",
    DELETE_ONLY_DEAL = "deleteOnlyDeal",
    DELETE_CONTACT = "deleteContact",
    DELETE_ACCOUNT = "deleteAccount",
    DELETE_INVENTORY = "deleteInventory",
    SET_INVENTORY_AVAILABLE = "setInventoryAvailable",
}

interface DeleteDealFormProps extends DropdownProps {
    isDeleteConfirm: boolean;
    attemptedSubmit?: boolean;
}

export const DeleteDealForm = observer(({ isDeleteConfirm }: DeleteDealFormProps): ReactElement => {
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const userStore = useStore().userStore;
    const store = useStore().dealStore;
    const { authUser } = userStore;

    const [deleteDealAndRelatedOption, setDeleteDealAndRelatedOption] = useState<boolean>(false);
    const [deleteDealOption, setDeleteDealOption] = useState<boolean>(true);
    const [deleteContactOption, setDeleteContactOption] = useState<boolean>(false);
    const [deleteAccountOption, setDeleteAccountOption] = useState<boolean>(false);
    const [deleteInventoryOption, setDeleteInventoryOption] = useState<boolean>(false);
    const [setInventoryAvailableOption, setSetInventoryAvailableOption] = useState<boolean>(false);

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
            const deleteParams = {
                reason: deleteReason,
                comment,
                delete_buyer: toBinary(deleteContactOption),
                delete_vehicle: toBinary(deleteInventoryOption),
                send_back: toBinary(setInventoryAvailableOption),
                delete_quote: toBinary(!deleteDealOption),
                delete_trade1: toBinary(deleteDealAndRelatedOption),
                delete_trade2: toBinary(deleteDealAndRelatedOption),
                delete_account: toBinary(deleteAccountOption),
            };

            deleteDeal(id, deleteParams).then((response: BaseResponseError | undefined) => {
                if (response?.status === Status.ERROR) {
                    const { error } = response as BaseResponseError;
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                    });
                } else {
                    navigate("/dashboard/deals");
                    toast.current?.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Deal deleted successfully!",
                    });
                }
            });
        }
    };

    useEffect(() => {
        if (isDeleteConfirm) {
            handleDeleteDeal();
        }
    }, [isDeleteConfirm]);

    const handleCheckboxChange = (option: DELETE_OPTION, checked: boolean) => {
        switch (option) {
            case DELETE_OPTION.DELETE_EVERYTHING:
                setDeleteDealAndRelatedOption(checked);
                if (checked) {
                    setDeleteDealOption(true);
                    setDeleteContactOption(true);
                    setDeleteAccountOption(true);
                    setDeleteInventoryOption(true);
                    setSetInventoryAvailableOption(false);
                    store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL_WITH_OPTIONS;
                } else {
                    setDeleteDealOption(false);
                    setDeleteContactOption(false);
                    setDeleteAccountOption(false);
                    setDeleteInventoryOption(false);
                    store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                }
                break;
            case DELETE_OPTION.DELETE_ONLY_DEAL:
                setDeleteDealOption(checked);
                if (checked) {
                    setDeleteDealAndRelatedOption(false);
                    if (deleteContactOption || deleteAccountOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL_WITH_OPTIONS;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                    }
                } else {
                    if (deleteContactOption || deleteAccountOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                    }
                }
                break;
            case DELETE_OPTION.DELETE_CONTACT:
                setDeleteContactOption(checked);
                if (checked) {
                    setDeleteDealAndRelatedOption(false);
                    if (deleteDealOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL_WITH_OPTIONS;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                    }
                } else {
                    if (deleteDealOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                    }
                }
                break;
            case DELETE_OPTION.DELETE_ACCOUNT:
                setDeleteAccountOption(checked);
                if (checked) {
                    setDeleteDealAndRelatedOption(false);
                    if (deleteDealOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL_WITH_OPTIONS;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                    }
                } else {
                    if (deleteDealOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                    }
                }
                break;
            case DELETE_OPTION.DELETE_INVENTORY:
                setDeleteInventoryOption(checked);
                if (checked) {
                    setDeleteDealAndRelatedOption(false);
                    setDeleteDealOption(false);
                    setSetInventoryAvailableOption(false);
                    store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                } else if (setInventoryAvailableOption) {
                    store.deleteMessage = DEAL_DELETE_MESSAGES.SET_INVENTORY_TO_AVAILABLE_FOR_SALE;
                } else {
                    store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                }
                break;
            case DELETE_OPTION.SET_INVENTORY_AVAILABLE:
                setSetInventoryAvailableOption(checked);
                if (checked) {
                    setDeleteDealAndRelatedOption(false);
                    setDeleteDealOption(false);
                    setDeleteInventoryOption(false);
                    if (deleteContactOption || deleteAccountOption) {
                        store.deleteMessage =
                            DEAL_DELETE_MESSAGES.DELETE_OPTIONS_AVAILABLE_FOR_SALE;
                    } else {
                        store.deleteMessage =
                            DEAL_DELETE_MESSAGES.SET_INVENTORY_TO_AVAILABLE_FOR_SALE;
                    }
                } else {
                    if (deleteContactOption || deleteAccountOption || deleteInventoryOption) {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_SELECTED_OPTIONS;
                    } else {
                        store.deleteMessage = DEAL_DELETE_MESSAGES.DELETE_DEAL;
                    }
                }
                break;
        }
    };

    return (
        <div className='deal-form'>
            <div className='deal-form__title deal-form__title--danger uppercase'>Delete deal</div>
            <div className='grid'>
                <div className='col-6 relative'>
                    <ComboBox
                        optionLabel='name'
                        optionValue='name'
                        value={deleteReason}
                        onChange={({ value }) => {
                            store.deleteReason = value;
                        }}
                        options={deleteReasonsList}
                        className='w-full deal-general__dropdown'
                        label='Reason'
                    />
                </div>
                <div className='col-12 splitter my-3'>
                    <h3 className='splitter__title m-0 pr-3'>Delete options</h3>
                    <hr className='splitter__line flex-1' />
                </div>

                <div className='grid col-12 p-0 row-gap-2 py-3'>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the deal and everything related to it'
                            checked={deleteDealAndRelatedOption}
                            onChange={({ checked }) =>
                                handleCheckboxChange(DELETE_OPTION.DELETE_EVERYTHING, !!checked)
                            }
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete only the deal'
                            checked={deleteDealOption}
                            onChange={({ checked }) =>
                                handleCheckboxChange(DELETE_OPTION.DELETE_ONLY_DEAL, !!checked)
                            }
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the contact'
                            checked={deleteContactOption}
                            onChange={({ checked }) =>
                                handleCheckboxChange(DELETE_OPTION.DELETE_CONTACT, !!checked)
                            }
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the account'
                            checked={deleteAccountOption}
                            onChange={({ checked }) =>
                                handleCheckboxChange(DELETE_OPTION.DELETE_ACCOUNT, !!checked)
                            }
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Delete the inventory'
                            checked={deleteInventoryOption}
                            onChange={({ checked }) => {
                                handleCheckboxChange(DELETE_OPTION.DELETE_INVENTORY, !!checked);
                                if (checked) {
                                    setSetInventoryAvailableOption(false);
                                }
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            name='Set the inventory to "Available for sale"'
                            checked={setInventoryAvailableOption}
                            onChange={({ checked }) => {
                                handleCheckboxChange(
                                    DELETE_OPTION.SET_INVENTORY_AVAILABLE,
                                    !!checked
                                );
                                if (checked) {
                                    setDeleteInventoryOption(false);
                                }
                            }}
                        />
                    </div>
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
});
