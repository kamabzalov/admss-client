import "./index.css";
import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement, useMemo, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { RolesContacts } from "dashboard/profile/generalSettings/roles/form/contacts";
import { RolesDeals } from "dashboard/profile/generalSettings/roles/form/deals";
import { RolesInventory } from "dashboard/profile/generalSettings/roles/form/inventory";
import { RolesAccounts } from "dashboard/profile/generalSettings/roles/form/accounts";
import { RolesReports } from "dashboard/profile/generalSettings/roles/form/reports";
import { RolesSettings } from "dashboard/profile/generalSettings/roles/form/settings";
import { RolesOther } from "dashboard/profile/generalSettings/roles/form/other";
import { useStore } from "store/hooks";
import { CREATE_ID, SETTINGS_PAGE } from "common/constants/links";
import { TruncatedText } from "dashboard/common/display";
import { useToastMessage } from "common/hooks";
import { Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { TextInput } from "dashboard/common/form/inputs";
import { checkRoleName } from "http/services/users";
import { debounce } from "common/helpers";
import { DEBOUNCE_TIME } from "common/settings";

interface TabItem {
    tabName: string;
    component: ReactElement;
}

interface RoleFormValues {
    rolename: string;
}

const getRoleFormSchema = (
    debouncedCheckRoleName: (value: string, resolve: (available: boolean) => void) => void
) =>
    Yup.object().shape({
        rolename: Yup.string()
            .trim()
            .required(ERROR_MESSAGES.REQUIRED)
            .test("is-role-name-available", ERROR_MESSAGES.ROLE_NAME_NOT_UNIQUE, function (value) {
                return new Promise((resolve) => {
                    debouncedCheckRoleName(value || "", resolve);
                });
            }),
    });

const tabItems: TabItem[] = [
    { tabName: "CONTACTS", component: <RolesContacts /> },
    { tabName: "DEALS", component: <RolesDeals /> },
    { tabName: "INVENTORY", component: <RolesInventory /> },
    { tabName: "ACCOUNTS", component: <RolesAccounts /> },
    { tabName: "REPORTS", component: <RolesReports /> },
    { tabName: "SETTINGS", component: <RolesSettings /> },
    { tabName: "OTHER", component: <RolesOther /> },
];

export const UsersRolesForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { usersStore, userStore } = useStore();
    const authUser = userStore.authUser;
    const { showError, showSuccess } = useToastMessage();
    const {
        getCurrentRole,
        currentRole,
        changeCurrentRole,
        saveCurrentRole,
        createNewRole,
        togglePermissionsGroup,
    } = usersStore;
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const formikRef = useRef<FormikProps<RoleFormValues>>(null);
    const initialRolenameRef = useRef<string>("");
    const initialRoleIdRef = useRef<string>("");

    useEffect(() => {
        if (!id || id === CREATE_ID) return;
        if (currentRole?.roleuid !== id) {
            initialRoleIdRef.current = "";
            return;
        }
        if (initialRoleIdRef.current === id) return;
        initialRolenameRef.current = currentRole?.rolename ?? "";
        initialRoleIdRef.current = id;
    }, [id, currentRole?.roleuid, currentRole?.rolename]);

    const debouncedCheckRoleName = useMemo(
        () =>
            debounce(async (value: string, resolve: (available: boolean) => void) => {
                const trimmed = value.trim();
                if (!trimmed || !authUser?.useruid) {
                    resolve(true);
                    return;
                }
                if (id !== CREATE_ID && trimmed === initialRolenameRef.current) {
                    resolve(true);
                    return;
                }
                try {
                    const res = await checkRoleName(
                        authUser.useruid,
                        trimmed,
                        id !== CREATE_ID ? currentRole?.roleuid : undefined
                    );
                    const available = res && "available" in res && res.available;
                    resolve(!!available);
                } catch {
                    resolve(true);
                }
            }, DEBOUNCE_TIME),
        [authUser?.useruid, id, currentRole?.roleuid]
    );

    const roleFormSchema = useMemo(
        () => getRoleFormSchema(debouncedCheckRoleName),
        [debouncedCheckRoleName]
    );

    useEffect(() => {
        if (id === CREATE_ID) {
            createNewRole();
        } else if (id) {
            getCurrentRole(id);
        }
    }, [id]);

    const handleTabChange = (changeEvent: { index: number }) => {
        setActiveTabIndex(changeEvent.index);
    };

    const handleBackClick = () => {
        const newIndex = Math.max(activeTabIndex - 1, 0);
        setActiveTabIndex(newIndex);
        if (newIndex <= 0) {
            navigate(SETTINGS_PAGE.ROLES());
        }
    };

    const handleNextClick = () => {
        const newIndex = Math.min(activeTabIndex + 1, tabItems.length - 1);
        setActiveTabIndex(newIndex);
    };

    const handleSaveClick = async () => {
        if (!currentRole || !formikRef.current) return;

        const errors = await formikRef.current.validateForm();
        formikRef.current.setTouched({ rolename: true });

        if (Object.keys(errors).length > 0) {
            return;
        }

        const response = await saveCurrentRole();
        if (response && response.error) {
            const isNameUnavailable = "available" in response && response.available === false;
            showError(isNameUnavailable ? ERROR_MESSAGES.ROLE_NAME_TAKEN_TOAST : response.error);
        } else {
            showSuccess(
                id === CREATE_ID ? "Role created successfully" : "Role updated successfully"
            );
            navigate(SETTINGS_PAGE.ROLES());
        }
    };

    const handleCloseClick = () => {
        navigate(-1);
    };

    return (
        <Formik
            innerRef={formikRef}
            validationSchema={roleFormSchema}
            initialValues={{
                rolename: currentRole?.rolename || "",
            }}
            enableReinitialize={true}
            onSubmit={handleSaveClick}
        >
            {({ errors, touched, values, setFieldValue, setFieldTouched }) => (
                <Form>
                    <div className='grid role-page relative'>
                        <Button
                            icon='pi pi-times'
                            className='p-button close-button'
                            onClick={handleCloseClick}
                            type='button'
                        />
                        <div className='col-12'>
                            <div className='card'>
                                <div className='card-header'>
                                    <h2 className='card-header__title uppercase m-0'>
                                        {id === CREATE_ID ? "Create new" : "Edit"} Role
                                    </h2>
                                </div>
                                <div className='role-content'>
                                    <div className='role-sidebar'>
                                        <div className='role-list pr-2'>
                                            <TruncatedText
                                                text={
                                                    id === CREATE_ID
                                                        ? "New role"
                                                        : currentRole?.rolename || ""
                                                }
                                                withTooltip={true}
                                                tooltipOptions={{
                                                    position: "mouse",
                                                    content:
                                                        id === CREATE_ID
                                                            ? "New role"
                                                            : currentRole?.rolename,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className='role-main'>
                                        <div className='role-main__header'>
                                            <div className='flex flex-column'>
                                                <TextInput
                                                    name='Role name (required)'
                                                    value={values.rolename}
                                                    onChange={(event) => {
                                                        const newValue = event.target.value;
                                                        setFieldValue("rolename", newValue);
                                                        changeCurrentRole("rolename", newValue);
                                                    }}
                                                    onBlur={() => setFieldTouched("rolename", true)}
                                                    className={`role-main__input ${
                                                        errors.rolename && touched.rolename
                                                            ? "p-invalid"
                                                            : ""
                                                    }`}
                                                    errorMessage={
                                                        errors.rolename
                                                            ? ERROR_MESSAGES.ROLE_NAME_INPUT
                                                            : undefined
                                                    }
                                                />
                                            </div>
                                            <label className='role-main__select-all'>
                                                <input
                                                    type='checkbox'
                                                    onChange={() => togglePermissionsGroup()}
                                                />
                                                <span>Select All</span>
                                            </label>
                                        </div>
                                        <TabView
                                            className='role-main__tabs'
                                            activeIndex={activeTabIndex}
                                            onTabChange={handleTabChange}
                                        >
                                            {tabItems.map(({ tabName, component }) => {
                                                return (
                                                    <TabPanel header={tabName} key={tabName}>
                                                        {component}
                                                    </TabPanel>
                                                );
                                            })}
                                        </TabView>
                                    </div>
                                </div>
                                <div className='role-main__buttons'>
                                    <Button
                                        onClick={handleBackClick}
                                        className='form__button uppercase'
                                        outlined
                                        disabled={activeTabIndex <= 0}
                                        severity={activeTabIndex <= 0 ? "secondary" : "success"}
                                        type='button'
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleNextClick}
                                        disabled={activeTabIndex >= tabItems.length - 1}
                                        severity={
                                            activeTabIndex >= tabItems.length - 1
                                                ? "secondary"
                                                : "success"
                                        }
                                        className='form__button uppercase'
                                        outlined
                                        type='button'
                                    >
                                        Next
                                    </Button>
                                    <Button
                                        onClick={handleSaveClick}
                                        className='form__button uppercase'
                                        type='button'
                                        disabled={Object.keys(errors).length > 0}
                                        severity={
                                            Object.keys(errors).length > 0 ? "secondary" : "success"
                                        }
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
});
