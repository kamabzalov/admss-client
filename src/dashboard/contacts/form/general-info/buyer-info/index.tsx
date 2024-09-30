import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement } from "react";
import { ContactsGeneralInfo } from "../tabs/general";
import { ContactsAddressInfo } from "../tabs/address";
import { ContactsIdentificationInfo } from "../tabs/identification";
import { ContactsOfacCheck } from "../tabs/ofac-check";

export const ContactsBuyerInfo = observer((): ReactElement => {
    return (
        <div className='col-12'>
            <TabView className='contact-form__tabs'>
                <TabPanel header='General'>
                    <ContactsGeneralInfo type='buyer' />
                </TabPanel>
                <TabPanel header='Address'>
                    <ContactsAddressInfo type='buyer' />
                </TabPanel>
                <TabPanel header='Identification'>
                    <ContactsIdentificationInfo type='buyer' />
                </TabPanel>
                <TabPanel header='OFAC CHECK'>
                    <ContactsOfacCheck type='buyer' />
                </TabPanel>
            </TabView>
        </div>
    );
});
