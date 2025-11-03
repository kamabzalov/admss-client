import { ReactElement, useState } from "react";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { Splitter } from "dashboard/common/display";
import { DashboardRadio, PhoneInput } from "dashboard/common/form/inputs";
import { RadioButtonProps } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { generateNewPassword } from "http/services/users";
import { GenerateNewPasswordResponse } from "common/models/users";
import { useToastMessage } from "common/hooks";
import { PasswordInput } from "dashboard/common/form/inputs/password";

export const ROLE_OPTIONS: RadioButtonProps[] = [
    {
        name: "Owner",
        title: "Owner (Admin)",
        value: 0,
    },
    {
        name: "Manager",
        title: "Manager",
        value: 1,
    },
    {
        name: "Salesman",
        title: "Sales Person",
        value: 2,
    },
];

export const GeneralInformation = observer((): ReactElement => {
    const authUserStore = useStore().userStore;
    const { authUser } = authUserStore;
    const usersStore = useStore().usersStore;
    const { user, changeUserData, password } = usersStore;
    const { showError, showSuccess } = useToastMessage();
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordsMismatch, setPasswordsMismatch] = useState<boolean>(false);

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
        } else {
            showError(response?.error);
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password);
        showSuccess("Password copied to clipboard");
    };

    return (
        <div className='user-form general-information'>
            <h3 className='general-information__title user-form__title'>General Information</h3>
            <Splitter title='Personal Data' className='my-5' />
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
            <Splitter title='Role' className='my-5' />
            <div className='grid'>
                <div className='col-12 mt-1'>
                    <DashboardRadio
                        radioArray={ROLE_OPTIONS}
                        justifyContent='start'
                        initialValue={(() => {
                            const roleIndex = ROLE_OPTIONS.findIndex(
                                (option) => option.title === user?.rolename
                            );
                            return roleIndex >= 0 ? roleIndex.toString() : "";
                        })()}
                        onChange={(value) => {
                            const selectedOption = ROLE_OPTIONS[parseInt(value as string)];
                            changeUserData("rolename", selectedOption.title);
                        }}
                    />
                </div>
            </div>
            <Splitter title='Contact & Login Information' className='my-5' />
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
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={user?.email1 || ""}
                            onChange={(e) => changeUserData("email1", e.target.value)}
                        />
                        <label className='float-label'>Email</label>
                    </span>
                </div>
                <div className='col-4'>
                    <PhoneInput
                        name='Phone Number (required)'
                        value={user?.phone1 || ""}
                        onChange={(e) => changeUserData("phone1", e.target.value)}
                    />
                </div>
            </div>
            <Splitter title='Password Setup' className='my-5' />
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
