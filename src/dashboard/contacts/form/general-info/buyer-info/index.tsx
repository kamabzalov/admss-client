import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement } from "react";
import { ContactsAddressInfo } from "dashboard/contacts/form/general-info/tabs/address";
import { ContactsGeneralInfo } from "dashboard/contacts/form/general-info/tabs/general";
import { ContactsIdentificationInfo } from "dashboard/contacts/form/general-info/tabs/identification";
import { ContactsOfacCheck } from "dashboard/contacts/form/general-info/tabs/ofac-check";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";
import { useNavigate, useLocation } from "react-router-dom";

const { BUYER } = GENERAL_CONTACT_TYPE;

export const ContactsBuyerInfo = observer((): ReactElement => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");

    const tabIndex = tabParam ? parseInt(tabParam, 10) : 0;

    const handleTabChange = (e: { index: number }) => {
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set("tab", e.index.toString());
        navigate({
            pathname: location.pathname,
            search: newSearchParams.toString(),
        });
    };

    return (
        <div className='col-12'>
            <TabView
                className='contact-form__tabs'
                activeIndex={tabIndex}
                onTabChange={handleTabChange}
            >
                <TabPanel header='General'>
                    <ContactsGeneralInfo type={BUYER} />
                </TabPanel>
                <TabPanel header='Address'>
                    <ContactsAddressInfo type={BUYER} />
                </TabPanel>
                <TabPanel header='Identification'>
                    <ContactsIdentificationInfo type={BUYER} />
                </TabPanel>
                <TabPanel header='OFAC CHECK'>
                    <ContactsOfacCheck type={BUYER} />
                </TabPanel>
            </TabView>
        </div>
    );
});
