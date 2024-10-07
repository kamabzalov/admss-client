import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement } from "react";
import { ContactsAddressInfo } from "dashboard/contacts/form/general-info/tabs/address";
import { ContactsGeneralInfo } from "dashboard/contacts/form/general-info/tabs/general";
import { ContactsIdentificationInfo } from "dashboard/contacts/form/general-info/tabs/identification";
import { ContactsOfacCheck } from "dashboard/contacts/form/general-info/tabs/ofac-check";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";

export const ContactsBuyerInfo = observer((): ReactElement => {
    return (
        <div className='col-12'>
            <TabView className='contact-form__tabs'>
                <TabPanel header='General'>
                    <ContactsGeneralInfo type={GENERAL_CONTACT_TYPE.BUYER} />
                </TabPanel>
                <TabPanel header='Address'>
                    <ContactsAddressInfo type={GENERAL_CONTACT_TYPE.BUYER} />
                </TabPanel>
                <TabPanel header='Identification'>
                    <ContactsIdentificationInfo type={GENERAL_CONTACT_TYPE.BUYER} />
                </TabPanel>
                <TabPanel header='OFAC CHECK'>
                    <ContactsOfacCheck type={GENERAL_CONTACT_TYPE.BUYER} />
                </TabPanel>
            </TabView>
        </div>
    );
});
