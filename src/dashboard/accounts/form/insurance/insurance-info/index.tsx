import { ReactElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccountInsurance, updateAccountInsurance } from "http/services/accounts.service";
import { Checkbox } from "primereact/checkbox";
import { TextInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { AccountInsurance } from "common/models/accounts";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { InsuranceInfoField } from "./insurance-info-item";
import { Status } from "common/models/base-response";
import { useToastMessage } from "common/hooks";
import { Loader } from "dashboard/common/loader";
import { CONTACTS_PAGE } from "common/constants/links";

export interface InsuranceInfoProps {
    onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

enum ToastMessage {
    SUCCESS = "Insurance info updated successfully!",
    REQUIRED = "Insurance userUID is required",
}

export const AccountInsuranceInfo = observer(
    ({ onUnsavedChangesChange }: InsuranceInfoProps): ReactElement => {
        const { id } = useParams();
        const navigate = useNavigate();
        const { showError, showSuccess } = useToastMessage();
        const store = useStore().accountStore;
        const { accountInsurance, setAccountInsurance, changeAccountInsurance } = store;
        const [insuranceEdit, setInsuranceEdit] = useState<boolean>(true);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
        const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

        const {
            accountExtData: { Title_Received, Title_Num },
            changeAccountExtData,
        } = store;

        useEffect(() => {
            onUnsavedChangesChange?.(hasUnsavedChanges);
        }, [hasUnsavedChanges, onUnsavedChangesChange]);

        const handleGetInsuranceHistory = async () => {
            if (!id) return;
            setIsLoading(true);
            const res = await getAccountInsurance(id);
            if (res?.status === Status.ERROR) {
                showError(res.error);
            }
            if (res) {
                if (!hasUnsavedChanges) {
                    setAccountInsurance(res as AccountInsurance);
                }
                setIsLoading(false);
            }
        };

        useEffect(() => {
            if (!accountInsurance || Object.keys(accountInsurance).length === 0) {
                handleGetInsuranceHistory();
            }
        }, [id]);

        const handleChangeInsuranceInfo = async () => {
            if (!accountInsurance || !id) return;

            const res = await updateAccountInsurance(id, accountInsurance);
            if (res?.status === Status.ERROR) {
                showError(res.error);
            } else {
                setIsLoading(true);
                const updatedRes = await getAccountInsurance(id);
                if (updatedRes?.status === Status.ERROR) {
                    showError(updatedRes.error);
                }
                if (updatedRes) {
                    setAccountInsurance(updatedRes as AccountInsurance);
                    setIsLoading(false);
                }

                setInsuranceEdit(true);
                setIsButtonDisabled(true);
                setHasUnsavedChanges(false);

                showSuccess(ToastMessage.SUCCESS);
            }
        };

        const handleChangeInsuranceEdit = () => {
            if (!accountInsurance?.Insurance_userUID) {
                showError(ToastMessage.REQUIRED);
            } else {
                navigate(CONTACTS_PAGE.EDIT(accountInsurance?.Insurance_userUID));
            }
        };

        const handleChangeInsurance = (field: keyof AccountInsurance, value: string) => {
            setIsButtonDisabled(false);
            setHasUnsavedChanges(true);
            changeAccountInsurance(field, value);
        };

        return (
            <div className='insurance-info'>
                <div className='insurance-info__container'>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <>
                            <div className='insurance-info__item insurance-info--splitter'>
                                <InsuranceInfoField
                                    label='Insurance Company'
                                    value={accountInsurance?.Insurance_Company}
                                    onChange={(e) => handleChangeInsurance("Insurance_Company", e)}
                                    editMode={insuranceEdit}
                                />
                                <InsuranceInfoField
                                    label='Insurance Agent'
                                    value={accountInsurance?.Insurance_Agent_Name}
                                    onChange={(e) =>
                                        handleChangeInsurance("Insurance_Agent_Name", e)
                                    }
                                    editMode={insuranceEdit}
                                />
                                <InsuranceInfoField
                                    label='Policy#'
                                    value={accountInsurance?.Insurance_Policy_Number}
                                    onChange={(e) =>
                                        handleChangeInsurance("Insurance_Policy_Number", e)
                                    }
                                    editMode={insuranceEdit}
                                />

                                <div className='insurance-field'>
                                    <Checkbox
                                        inputId='account-insurance-policy'
                                        name='account-insurance-policy'
                                        checked={!!accountInsurance?.Insurance_Policy_Received}
                                        onClick={() => {
                                            setIsButtonDisabled(false);
                                            setHasUnsavedChanges(true);
                                            changeAccountInsurance(
                                                "Insurance_Policy_Received",
                                                !accountInsurance?.Insurance_Policy_Received ? 1 : 0
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor='account-insurance-policy'
                                        className='ml-2 insurance-field__label insurance-field__label--thin'
                                    >
                                        Insurance Policy Received
                                    </label>
                                </div>
                                <InsuranceInfoField
                                    label='Expiration Date'
                                    value={accountInsurance?.Insurance_Exp_Date}
                                    onChange={(e) => handleChangeInsurance("Insurance_Exp_Date", e)}
                                    editMode={insuranceEdit}
                                    inputType='date'
                                />
                            </div>
                            <div className='insurance-info__item'>
                                <div className='insurance-field'>
                                    <Checkbox
                                        inputId='account-insurance-title-received'
                                        name='account-insurance-title-received'
                                        checked={!!Title_Received}
                                        onClick={() => {
                                            setIsButtonDisabled(false);
                                            setHasUnsavedChanges(true);
                                            changeAccountExtData(
                                                "Title_Received",
                                                !Title_Received ? 1 : 0
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor='account-insurance-title-received'
                                        className='insurance-field__label ml-2 insurance-field__label--thin'
                                    >
                                        Title Received
                                    </label>
                                </div>
                                <TextInput
                                    name='Title_Num'
                                    label='Title#'
                                    className='insurance-info__input w-full'
                                    value={Title_Num}
                                    onChange={(e) => {
                                        setIsButtonDisabled(false);
                                        setHasUnsavedChanges(true);
                                        changeAccountExtData("Title_Num", e.target.value);
                                    }}
                                />
                            </div>
                        </>
                    )}
                    <div className='insurance-info__footer'>
                        <Button
                            type='button'
                            className='insurance-info__button'
                            disabled={isButtonDisabled}
                            severity={isButtonDisabled ? "secondary" : "success"}
                            onClick={handleChangeInsuranceInfo}
                        >
                            Save
                        </Button>
                    </div>
                </div>
                <div className='insurance-info__footer'>
                    <Button
                        className='insurance-info__button insurance-info__button--edit'
                        onClick={handleChangeInsuranceEdit}
                        outlined
                    >
                        View/ Edit Contact Information
                    </Button>
                </div>
            </div>
        );
    }
);
