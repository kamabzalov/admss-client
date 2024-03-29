import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { LS_APP_USER } from "common/constants/localStorage";
import { ContactUser } from "common/models/contact";
import { QueryParams } from "common/models/query-params";
import { AuthUser } from "http/services/auth.service";
import { getContacts } from "http/services/contacts-service";
import { useState, useEffect } from "react";
import { getKeyValue } from "services/local-storage.service";
import { DropdownProps } from "primereact/dropdown";
import { ContactsDataTable } from "dashboard/contacts";

const FIELD: keyof ContactUser = "companyName";

interface CompanySearchProps extends DropdownProps {
    onRowClick?: (companyName: string) => void;
}

export const CompanySearch = ({
    name,
    value,
    onRowClick,
    onChange,
    ...props
}: CompanySearchProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [options, setOptions] = useState<ContactUser[]>([]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    const handleCompanyInputChange = (searchValue: string): void => {
        const params: QueryParams = {
            qry: `${searchValue}.${FIELD}`,
        };
        user &&
            getContacts(user.useruid, params).then((response) => {
                if (response?.length) {
                    setOptions(response);
                } else {
                    setOptions([]);
                }
            });
    };

    const handleOnRowClick = (companyName: string) => {
        onRowClick && onRowClick(companyName);
        setDialogVisible(false);
    };
    return (
        <>
            <SearchInput
                name={name}
                title={name}
                optionValue={FIELD}
                optionLabel={FIELD}
                options={options}
                onInputChange={handleCompanyInputChange}
                value={value}
                onChange={onChange}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                {...props}
            />
            <Dialog
                header={<div className='uppercase'>Choose a Contact</div>}
                visible={dialogVisible}
                style={{ width: "75vw" }}
                maximizable
                modal
                onHide={() => setDialogVisible(false)}
            >
                <ContactsDataTable onRowClick={handleOnRowClick} />
            </Dialog>
        </>
    );
};
