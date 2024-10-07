import { observer } from "mobx-react-lite";
import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement } from "react";
import { ContactsAddressInfo } from "dashboard/contacts/form/general-info/tabs/address";
import { ContactsGeneralInfo } from "dashboard/contacts/form/general-info/tabs/general";
import { ContactsIdentificationInfo } from "dashboard/contacts/form/general-info/tabs/identification";
import { ContactsOfacCheck } from "dashboard/contacts/form/general-info/tabs/ofac-check";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";

const { CO_BUYER } = GENERAL_CONTACT_TYPE;

export const ContactsCoBuyerInfo = observer((): ReactElement => {
    return (
        <div className='col-12'>
            <TabView className='contact-form__tabs'>
                <TabPanel header='General'>
                    <ContactsGeneralInfo type={CO_BUYER} />
                </TabPanel>
                <TabPanel header='Address'>
                    <ContactsAddressInfo type={CO_BUYER} />
                </TabPanel>
                <TabPanel header='Identification'>
                    <ContactsIdentificationInfo type={CO_BUYER} />
                </TabPanel>
                <TabPanel header='OFAC CHECK'>
                    <ContactsOfacCheck type={CO_BUYER} />
                </TabPanel>
            </TabView>
        </div>
    );
});
