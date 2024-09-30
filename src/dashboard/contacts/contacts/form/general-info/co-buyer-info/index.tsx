import { observer } from "mobx-react-lite";
import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement } from "react";
import { ContactsAddressInfo } from "../tabs/address";
import { ContactsGeneralInfo } from "../tabs/general";
import { ContactsIdentificationInfo } from "../tabs/identification";
import { ContactsOfacCheck } from "../tabs/ofac-check";

export const ContactsCoBuyerInfo = observer((): ReactElement => {
    return (
        <div className='col-12'>
            <TabView className='contact-form__tabs'>
                <TabPanel header='General'>
                    <ContactsGeneralInfo type='co-buyer' />
                </TabPanel>
                <TabPanel header='Address'>
                    <ContactsAddressInfo type='co-buyer' />
                </TabPanel>
                <TabPanel header='Identification'>
                    <ContactsIdentificationInfo type='co-buyer' />
                </TabPanel>
                <TabPanel header='OFAC CHECK'>
                    <ContactsOfacCheck type='co-buyer' />
                </TabPanel>
            </TabView>
        </div>
    );
});
