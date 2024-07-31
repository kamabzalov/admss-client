import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement } from "react";
import { AccountQuickPay } from "./quick-pay";
import "./index.css";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { AccountPayOff } from "./pay-off";
import { AccountBalanceAdjustment } from "./balance-adjustment";

export const AccountTakePayment = (): ReactElement => {
    const { id } = useParams();
    const navigate = useNavigate();
    const store = useStore().accountStore;
    const {
        account: { accountnumber, accountstatus },
    } = store;
    return (
        <div className='grid relative take-payment'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={() => navigate(`/dashboard/accounts/${id}`)}
            />
            <div className='col-12'>
                <div className='card account'>
                    <div className='card-header flex'>
                        <h2 className='card-header__title uppercase m-0'>Take Payment</h2>
                        {id && (
                            <div className='card-header-info'>
                                Account Number
                                <span className='card-header-info__data'>{accountnumber}</span>
                                Status
                                <span className='card-header-info__data uppercase'>
                                    {accountstatus}
                                </span>
                                Overdue Status
                                <span className='card-header-info__data'>54</span>
                            </div>
                        )}
                    </div>
                    <div className='card-content account__card grid'>
                        <TabView className='take-payment__tabs'>
                            <TabPanel header='Quick Pay'>
                                <AccountQuickPay />
                            </TabPanel>
                            <TabPanel header='Pay Off'>
                                <AccountPayOff />
                            </TabPanel>
                            <TabPanel header='Balance Adjustment'>
                                <AccountBalanceAdjustment />
                            </TabPanel>
                        </TabView>
                    </div>
                    <div className='account__footer gap-3 ml-auto mr-3'>
                        <Button
                            className='uppercase px-6 account__button'
                            onClick={() => navigate(`/dashboard/accounts/${id}`)}
                            outlined
                        >
                            Cancel
                        </Button>
                        <Button className='uppercase px-6 account__button'>Save</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};