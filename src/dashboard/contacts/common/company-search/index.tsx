import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { LS_APP_USER } from "common/constants/localStorage";
import { usePermissions } from "common/hooks/usePermissions";
import { ContactType, ContactTypeNameList, ContactUser } from "common/models/contact";
import { QueryParams } from "common/models/query-params";
import { AuthUser } from "common/models/user";
import { getContacts, getContactsTypeList } from "http/services/contacts-service";
import { useState, useEffect } from "react";
import { getKeyValue } from "services/local-storage.service";
import { DropdownChangeEvent, DropdownProps } from "primereact/dropdown";
import { ContactsDataTable } from "dashboard/contacts";
import { ALL_FIELDS, RETURNED_FIELD_TYPE } from "common/constants/fields";

const FIELD: keyof ContactUser = "companyName";

interface CompanySearchProps extends DropdownProps {
    onRowClick?: (companyName: string) => void;
    contactCategory?: ContactTypeNameList | string;
    originalPath?: string;
    returnedField?: RETURNED_FIELD_TYPE<ContactUser>;
    onChangeGetFullInfo?: (contact: ContactUser) => void;
    getFullInfo?: (contact: ContactUser) => void;
}

export const CompanySearch = ({
    name,
    value,
    onRowClick,
    contactCategory,
    onChange,
    originalPath,
    returnedField,
    getFullInfo,
    onChangeGetFullInfo,
    ...props
}: CompanySearchProps) => {
    const { contactPermissions } = usePermissions();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [options, setOptions] = useState<ContactUser[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<number>();

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
        if (contactCategory) {
            getContactsTypeList().then((response) => {
                if (response) {
                    const types = response as ContactType[];
                    const category = types?.find((item) => item.name === contactCategory)?.id;
                    setCurrentCategory(category);
                }
            });
        }
    }, []);

    const handleCompanyInputChange = (searchValue: string): void => {
        if (!searchValue.trim()) {
            return;
        }
        const field = returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD;
        const qry = `${searchValue}.${field}`;
        const params: QueryParams = {
            qry,
            ...(currentCategory && { param: currentCategory }),
        };
        user &&
            getContacts(user.useruid, params).then((response) => {
                if (Array.isArray(response) && response?.length) {
                    const optionsWithName = response.map((contact) => ({
                        ...contact,
                        name:
                            contact.companyName ||
                            contact.businessName ||
                            `${contact.firstName} ${contact.lastName}`,
                    }));
                    setOptions(optionsWithName);
                } else {
                    setOptions([]);
                }
            });
    };

    const handleOnRowClick = (companyName: string) => {
        onRowClick && onRowClick(companyName);
        setDialogVisible(false);
    };

    const handleGetFullInfo = (contact: ContactUser) => {
        getFullInfo && getFullInfo(contact);
        setDialogVisible(false);
    };

    const handleOnChange = (event: DropdownChangeEvent) => {
        const selectedValue = event.value;

        if (returnedField === ALL_FIELDS) {
            const selectedContact = options.find((contact) => contact[FIELD] === selectedValue);

            if (selectedContact && getFullInfo) {
                getFullInfo(selectedContact);
            }
        }

        if (onChangeGetFullInfo) {
            onChangeGetFullInfo(event.target.value);
        }

        if (onChange) {
            onChange(event);
        }
    };

    if (!contactPermissions.canSelectInInputs()) {
        return null;
    }

    return (
        <>
            <SearchInput
                name={name}
                title={name}
                optionValue={returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD}
                optionLabel='name'
                options={options}
                onInputChange={handleCompanyInputChange}
                value={value}
                onChange={handleOnChange}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                {...props}
            />
            <Dialog
                header={<div className='uppercase'>Choose a Contact</div>}
                visible={dialogVisible}
                style={{ width: "75vw", height: "75vh" }}
                maximizable
                modal
                onHide={() => setDialogVisible(false)}
            >
                <ContactsDataTable
                    onRowClick={handleOnRowClick}
                    contactCategory={contactCategory}
                    originalPath={originalPath}
                    returnedField={
                        returnedField === ALL_FIELDS
                            ? undefined
                            : (returnedField as keyof ContactUser)
                    }
                    getFullInfo={handleGetFullInfo}
                />
            </Dialog>
        </>
    );
};
