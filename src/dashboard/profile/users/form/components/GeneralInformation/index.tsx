import { ReactElement, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import { Splitter } from "dashboard/common/display";
import { DashboardRadio, EmailInput, PhoneInput } from "dashboard/common/form/inputs";
import { RadioButtonProps } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { generateNewPassword } from "http/services/users";
import { GenerateNewPasswordResponse } from "common/models/users";
import { useToastMessage } from "common/hooks";
import { PasswordInput } from "dashboard/common/form/inputs/password";
import InfoIcon from "assets/images/info-icon.svg";
import { SETTINGS_PAGE } from "common/constants/links";

const INFO_MESSAGE = `At least one contact method is required - phone number or email. Without this information, two-factor authentication cannot be set up for the user in the future. If both fields are filled in, the user will be able to choose their preferred two-factor authentication method.`;

interface RoleOption extends RadioButtonProps {
    roleuid: string;
    apiRoleName: string;
}

export const ROLE_MAPPING = [
    { keyword: "owner", displayTitle: "Owner (Admin)", displayName: "Owner" },
    { keyword: "manager", displayTitle: "Manager", displayName: "Manager" },
    { keyword: "sales", displayTitle: "Sales Person", displayName: "Salesman" },
];

export const SALES_PERSON_ROLE = ROLE_MAPPING[2];

export const GeneralInformation = observer((): ReactElement | null => {
    const navigate = useNavigate();
    const usersStore = useStore().usersStore;
    const authUserStore = useStore().userStore;
    const { authUser } = authUserStore;
    const { user, changeUserData, password, availableRoles, isLoading } = usersStore;
    const { showSuccess } = useToastMessage();
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordsMismatch, setPasswordsMismatch] = useState<boolean>(false);

    const hasEmail = !!user?.email1;
    const hasPhone = !!user?.phone1;

    const roleOptions: RoleOption[] = ROLE_MAPPING.map((mapping, index) => {
        const apiRole = availableRoles.find((role) =>
            role.rolename.toLowerCase().includes(mapping.keyword)
        );
        return apiRole
            ? {
                  name: mapping.displayName,
                  title: mapping.displayTitle,
                  value: index,
                  roleuid: apiRole.roleuid,
                  apiRoleName: apiRole.rolename,
              }
            : null;
    }).filter(Boolean) as RoleOption[];

    const handlePasswordsBlur = () => {
        const bothFilled = password.length > 0 && confirmPassword.length > 0;
        if (bothFilled) {
            const mismatch = password !== confirmPassword;
            setPasswordsMismatch(mismatch);
            usersStore.passwordMismatch = mismatch;
        } else {
            setPasswordsMismatch(false);
            usersStore.passwordMismatch = false;
        }
    };

    const handleGeneratePassword = async () => {
        if (!authUser) return;
        const response = await generateNewPassword(authUser.useruid);
        if (response && !response.error) {
            const data = response as GenerateNewPasswordResponse;
            usersStore.password = data.password;
            setConfirmPassword(data.password);
            setPasswordsMismatch(false);
            usersStore.passwordMismatch = false;
            showSuccess(`Password generated successfully: ${data.password}`);
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password);
        showSuccess("Password copied to clipboard");
    };

    const handleCustomRoleClick = () => {
        navigate(SETTINGS_PAGE.ROLES_CREATE());
    };

    return (
        <div className='user-form general-information'>
            <h3 className='general-information__title user-form__title'>General Information</h3>
            <Splitter title='Personal Data' className='my-4' />
            <div className='grid'>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={user?.firstName || ""}
                            onChange={(e) => changeUserData("firstName", e.target.value)}
                        />
                        <label className='float-label'>First Name (required)</label>
                    </span>
                </div>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={user?.middleName || ""}
                            onChange={(e) => changeUserData("middleName", e.target.value)}
                        />
                        <label className='float-label'>Middle Name</label>
                    </span>
                </div>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={user?.lastName || ""}
                            onChange={(e) => changeUserData("lastName", e.target.value)}
                        />
                        <label className='float-label'>Last Name (required)</label>
                    </span>
                </div>
            </div>
            <div className='general-information__role-header'>
                <div className='general-information__role-title'>
                    <Splitter title='Role' />
                </div>
                <div className='general-information__custom-role' onClick={handleCustomRoleClick}>
                    Custom role
                </div>
            </div>
            {isLoading ? (
                <div className='grid'>
                    <div className='col-3'>
                        <Skeleton height='50px' />
                    </div>
                    <div className='col-3'>
                        <Skeleton height='50px' />
                    </div>
                    <div className='col-3'>
                        <Skeleton height='50px' />
                    </div>
                </div>
            ) : (
                <div className='grid'>
                    <div className='col-12'>
                        <DashboardRadio
                            radioArray={roleOptions}
                            justifyContent='start'
                            initialValue={(() => {
                                const roleIndex = roleOptions.findIndex(
                                    (option) =>
                                        option.roleuid === user?.roleuid ||
                                        option.title === user?.rolename
                                );
                                return roleIndex >= 0 ? roleIndex.toString() : "";
                            })()}
                            onChange={(value) => {
                                const selectedOption = roleOptions[parseInt(value as string)];
                                changeUserData([
                                    ["rolename", selectedOption.title as string],
                                    ["roleuid", selectedOption.roleuid as string],
                                ]);
                            }}
                        />
                    </div>
                </div>
            )}
            <Splitter title='Contact & Login Information' className='my-4' />
            <div className='grid'>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={user?.loginName || ""}
                            onChange={(e) => changeUserData("loginName", e.target.value)}
                        />
                        <label className='float-label'>Login (required)</label>
                    </span>
                </div>
                <div className='col-4'>
                    <EmailInput
                        name={`Email ${!hasPhone ? "(required)" : ""}`}
                        value={user?.email1 || ""}
                        onChange={(e) => changeUserData("email1", e.target.value)}
                    />
                </div>
                <div className='col-4'>
                    <PhoneInput
                        name={`Phone Number ${!hasEmail ? "(required)" : ""}`}
                        value={user?.phone1 || ""}
                        onChange={(e) => changeUserData("phone1", e.target.value)}
                    />
                </div>
                <div className='col-12 user-profile-info-message'>
                    <img src={InfoIcon} alt='info' className='user-profile-info-message__icon' />
                    <span className='user-profile-info-message__text'>{INFO_MESSAGE}</span>
                </div>
            </div>
            <Splitter title='Password Setup' className='my-4' />
            <div className='grid'>
                <div className='col-4'>
                    <PasswordInput
                        password={password}
                        setPassword={(password) => (usersStore.password = password)}
                        error={passwordsMismatch}
                        onBlur={handlePasswordsBlur}
                    />
                </div>
                <div className='col-4'>
                    <PasswordInput
                        label='Verify Password (required)'
                        password={confirmPassword}
                        setPassword={setConfirmPassword}
                        error={passwordsMismatch}
                        onBlur={handlePasswordsBlur}
                    />
                </div>
                <div className='col-4 flex gap-3'>
                    <Button
                        tooltip='Generate Password'
                        icon='icon adms-generate-password'
                        onClick={handleGeneratePassword}
                    />
                    <Button
                        tooltip='Copy Password'
                        icon='icon adms-copy'
                        onClick={handleCopyPassword}
                    />
                </div>
            </div>
        </div>
    );
});
