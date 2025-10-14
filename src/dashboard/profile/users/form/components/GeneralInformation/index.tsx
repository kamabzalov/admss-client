import { ReactElement, useState } from "react";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { Splitter } from "dashboard/common/display";
import { DashboardRadio, PhoneInput } from "dashboard/common/form/inputs";
import { RadioButtonProps } from "primereact/radiobutton";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { generateNewPassword } from "http/services/users";
import { GenerateNewPasswordResponse } from "common/models/users";
import { useToastMessage } from "common/hooks";

const ROLE_OPTIONS: RadioButtonProps[] = [
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
    const { user } = usersStore;
    const { showError, showSuccess } = useToastMessage();
    const [firstName, setFirstName] = useState<string>("");
    const [middleName, setMiddleName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [login, setLogin] = useState<string>(user?.username || "");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const handleGeneratePassword = async () => {
        if (!authUser) return;
        const response = await generateNewPassword(authUser.useruid);
        if (response && !response.error) {
            const data = response as GenerateNewPasswordResponse;
            setPassword(data.password);
            setConfirmPassword(data.password);
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
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <label className='float-label'>First Name (required)</label>
                    </span>
                </div>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                        />
                        <label className='float-label'>Middle Name</label>
                    </span>
                </div>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <label className='float-label'>Last Name (required)</label>
                    </span>
                </div>
            </div>
            <Splitter title='Role' className='my-5' />
            <div className='grid'>
                <div className='col-9 mt-1'>
                    <DashboardRadio
                        radioArray={ROLE_OPTIONS}
                        initialValue={""}
                        onChange={() => {}}
                    />
                </div>
            </div>
            <Splitter title='Contact & Login Information' className='my-5' />
            <div className='grid'>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                        <label className='float-label'>Login (required)</label>
                    </span>
                </div>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label className='float-label'>Email</label>
                    </span>
                </div>
                <div className='col-4'>
                    <PhoneInput
                        name='Phone Number (required)'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
            </div>
            <Splitter title='Password Setup' className='my-5' />
            <div className='grid'>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <Password
                            name='Password'
                            value={password}
                            className='w-full'
                            autoComplete='new-password'
                            inputClassName='w-full'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label className='float-label'>Password (required)</label>
                    </span>
                </div>
                <div className='col-4'>
                    <span className='p-float-label'>
                        <Password
                            name='Verify Password'
                            className='w-full'
                            autoComplete='new-password'
                            inputClassName='w-full'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label className='float-label'>Verify Password (required)</label>
                    </span>
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
