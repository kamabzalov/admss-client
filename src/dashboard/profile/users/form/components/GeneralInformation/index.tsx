import { ReactElement, useState, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { TextInput } from "dashboard/common/form/inputs";
import { Splitter } from "dashboard/common/display";
import { EmailInput, PhoneInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { MultiSelectChangeEvent } from "primereact/multiselect";
import { ChipMultiSelect } from "dashboard/common/form/chip-multiselect";
import { useStore } from "store/hooks";
import { checkLogin, generateNewPassword } from "http/services/users";
import { GenerateNewPasswordResponse, UserRole } from "common/models/users";
import { useToastMessage } from "common/hooks";
import { PasswordInput } from "dashboard/common/form/inputs/password";
import InfoIcon from "assets/images/info-icon.svg";
import { SETTINGS_PAGE } from "common/constants/links";
import { LOGIN_MIN_LENGTH, LOGIN_MAX_LENGTH, LOGIN_VALID_REGEX } from "common/constants/regex";
import { debounce } from "common/helpers";
import { DEBOUNCE_TIME } from "common/settings";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { typeGuards } from "common/utils";

const INFO_MESSAGE = `At least one contact method is required - phone number or email. Without this information, two-factor authentication cannot be set up for the user in the future. If both fields are filled in, the user will be able to choose their preferred two-factor authentication method.`;

interface RoleSelectOption {
    roleuid: string;
    label: string;
}

interface RoleGroup {
    name: string;
    options: RoleSelectOption[];
}

const GROUP_DEFAULT = "Default Roles";
const GROUP_CUSTOM = "Custom Roles";

function optionLabelForRole(role: UserRole): string {
    const text = (role.rolename || role.name || "").trim();
    return text.length > 0 ? text : role.roleuid;
}

export const GeneralInformation = observer((): ReactElement | null => {
    const navigate = useNavigate();
    const usersStore = useStore().usersStore;
    const authUserStore = useStore().userStore;
    const { authUser } = authUserStore;
    const { user, changeUserData, password, availableRoles } = usersStore;
    const { showSuccess } = useToastMessage();
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordsMismatch, setPasswordsMismatch] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const initialLoginRef = useRef<string>("");
    const initialUseruidRef = useRef<string>("");
    const hasEmail = !!user?.email1;
    const hasPhone = !!user?.phone1;
    const isEditMode = !!user?.useruid;

    const selectedRoleUids = useMemo(() => {
        let raw: string[] = [];
        if (user?.roles?.length) {
            raw = user.roles.filter((roleuid) => !!roleuid?.trim());
        } else if (user?.roleuid?.trim()) {
            raw = [user.roleuid.trim()];
        }
        return [...new Set(raw)];
    }, [user?.roles, user?.roleuid]);

    const roleSelectGroups = useMemo((): RoleGroup[] => {
        const rolesWithUid = availableRoles.filter((role) => role.roleuid);
        const compareOptionsByLabel = (first: RoleSelectOption, second: RoleSelectOption) =>
            first.label.localeCompare(second.label);

        let defaultOptions: RoleSelectOption[] = rolesWithUid
            .filter((role) => role.isDefault === 1)
            .map((role) => ({
                roleuid: role.roleuid,
                label: optionLabelForRole(role),
            }))
            .sort(compareOptionsByLabel);

        let customOptions: RoleSelectOption[] = rolesWithUid
            .filter((role) => role.isDefault !== 1)
            .map((role) => ({
                roleuid: role.roleuid,
                label: optionLabelForRole(role),
            }))
            .sort(compareOptionsByLabel);

        const presentUids = new Set<string>();
        [...defaultOptions, ...customOptions].forEach((option) => presentUids.add(option.roleuid));

        const orphanOptions: RoleSelectOption[] = selectedRoleUids
            .filter((roleuid) => !presentUids.has(roleuid))
            .map((roleuid) => ({ roleuid, label: roleuid }));

        if (orphanOptions.length) {
            if (defaultOptions.length) {
                defaultOptions = [...orphanOptions, ...defaultOptions];
            } else if (customOptions.length) {
                customOptions = [...orphanOptions, ...customOptions];
            } else {
                customOptions = orphanOptions;
            }
        }

        const groups: RoleGroup[] = [];
        if (defaultOptions.length) {
            groups.push({ name: GROUP_DEFAULT, options: defaultOptions });
        }
        if (customOptions.length) {
            groups.push({ name: GROUP_CUSTOM, options: customOptions });
        }
        return groups;
    }, [availableRoles, selectedRoleUids]);

    const extraSelectedRolesCount = Math.max(selectedRoleUids.length - 1, 0);

    useEffect(() => {
        if (!user?.useruid) return;
        if (initialUseruidRef.current !== user.useruid) {
            initialUseruidRef.current = user.useruid;
            initialLoginRef.current = (user.loginName || "").trim();
            return;
        }
        const name = (user.loginName || "").trim();
        if (initialLoginRef.current === "" && name !== "") {
            initialLoginRef.current = name;
        }
    }, [user?.useruid, user?.loginName]);

    useEffect(() => {
        if (!password) {
            setConfirmPassword("");
            setPasswordsMismatch(false);
            setLoginError(null);
        }
    }, [password]);

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

    const validateLoginLength = (value: string): string | null => {
        if (!value) return null;
        if (value.length < LOGIN_MIN_LENGTH) {
            return `Login must be at least ${LOGIN_MIN_LENGTH} characters`;
        }
        if (value.length > LOGIN_MAX_LENGTH) {
            return `Login must not exceed ${LOGIN_MAX_LENGTH} characters`;
        }
        return null;
    };

    const handleLoginChange = (value: string) => {
        const filtered = value.replace(LOGIN_VALID_REGEX, "");
        changeUserData("loginName", filtered);
        debouncedCheckLoginName(filtered);
    };

    const debouncedCheckLoginName = useMemo(
        () =>
            debounce(async (value: string) => {
                const trimmed = value.trim();
                if (!trimmed || !authUser?.useruid) {
                    setLoginError(null);
                    usersStore.loginError = false;
                    return;
                }
                if (!!user?.useruid && trimmed === initialLoginRef.current) {
                    setLoginError(null);
                    usersStore.loginError = false;
                    return;
                }

                const lengthError = validateLoginLength(trimmed);
                if (lengthError) {
                    setLoginError(lengthError);
                    usersStore.loginError = true;
                    return;
                }

                const res = await checkLogin(trimmed);
                if (res && typeGuards.hasProperty(res, "exists")) {
                    if (res.exists) {
                        setLoginError(res.message || ERROR_MESSAGES.LOGIN_NAME_UNIQUE);
                        usersStore.loginError = true;
                    } else {
                        setLoginError(null);
                        usersStore.loginError = false;
                    }
                }
            }, DEBOUNCE_TIME),
        [authUser?.useruid, user?.useruid]
    );

    const handleLoginBlur = () => {
        if (user?.loginName === undefined) return;
        const trimmedValue = user.loginName.trim();
        changeUserData("loginName", trimmedValue);
        debouncedCheckLoginName(trimmedValue);
    };

    const handleRoleChange = (event: MultiSelectChangeEvent) => {
        const chosenRoleUids = (event.value as string[]) ?? [];
        const selectedRoles = availableRoles.filter((role) =>
            chosenRoleUids.includes(role.roleuid)
        );
        changeUserData([
            ["roles", chosenRoleUids],
            ["roleuid", chosenRoleUids[0] || ""],
            ["rolename", selectedRoles.map((role) => role.rolename || role.name).join(", ")],
        ]);
    };

    return (
        <div className='user-form general-information'>
            <h3 className='general-information__title user-form__title'>General Information</h3>
            <Splitter title='Personal Data' className='my-4' />
            <div className='grid'>
                <div className='col-4'>
                    <TextInput
                        name='firstName'
                        label='First Name (required)'
                        className='w-full'
                        value={user?.firstName || ""}
                        onChange={(e) => changeUserData("firstName", e.target.value)}
                    />
                </div>
                <div className='col-4'>
                    <TextInput
                        name='middleName'
                        label='Middle Name'
                        className='w-full'
                        value={user?.middleName || ""}
                        onChange={(e) => changeUserData("middleName", e.target.value)}
                    />
                </div>
                <div className='col-4'>
                    <TextInput
                        name='lastName'
                        label='Last Name (required)'
                        className='w-full'
                        value={user?.lastName || ""}
                        onChange={(e) => changeUserData("lastName", e.target.value)}
                    />
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
            <div className='grid'>
                <div className='col-4'>
                    <ChipMultiSelect
                        floatClassName='w-full'
                        className='w-full general-information__role-dropdown'
                        value={selectedRoleUids}
                        options={roleSelectGroups}
                        optionGroupLabel='name'
                        optionGroupChildren='options'
                        optionLabel='label'
                        optionValue='roleuid'
                        dataKey='roleuid'
                        onChange={handleRoleChange}
                        placeholder='Roles (required)'
                        filter
                        filterBy='label'
                        filterPlaceholder='Search'
                        maxSelectedLabels={1}
                        overflowCount={extraSelectedRolesCount > 0 ? extraSelectedRolesCount : null}
                        showClear
                    />
                </div>
            </div>
            <Splitter title='Contact & Login Information' className='my-4' />
            <div className='grid'>
                <div className='col-4'>
                    <TextInput
                        name='loginName'
                        label='Login (required)'
                        className='w-full general-information__login'
                        value={user?.loginName || ""}
                        error={!!loginError}
                        errorMessage={loginError || null}
                        onChange={(e) => handleLoginChange(e.target.value)}
                        onBlur={handleLoginBlur}
                    />
                </div>
                <div className='col-4'>
                    <EmailInput
                        name={`Email ${!hasPhone ? "(required)" : ""}`}
                        value={user?.email1 || ""}
                        onChange={(e) => changeUserData("email1", e.target.value)}
                    />
                </div>

                <PhoneInput
                    name={`Phone Number ${!hasEmail ? "(required)" : ""}`}
                    colWidth={4}
                    value={user?.phone1 || ""}
                    onChange={(e) => changeUserData("phone1", e.target.value)}
                />
                <div className='col-12 user-profile-info-message'>
                    <img src={InfoIcon} alt='info' className='user-profile-info-message__icon' />
                    <span className='user-profile-info-message__text'>{INFO_MESSAGE}</span>
                </div>
            </div>
            <Splitter title='Password Setup' className='my-4' />
            <div className='grid'>
                <div className='col-4'>
                    <PasswordInput
                        label={`Password ${!isEditMode ? "(required)" : ""}`}
                        password={password}
                        setPassword={(password) => (usersStore.password = password)}
                        error={passwordsMismatch}
                        onBlur={handlePasswordsBlur}
                    />
                </div>
                <div className='col-4'>
                    <PasswordInput
                        label={`Verify Password ${!isEditMode ? "(required)" : ""}`}
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
