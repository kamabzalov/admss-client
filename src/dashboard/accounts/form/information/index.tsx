import { ReactElement } from "react";
import { InfoSection } from "./info-section";
import "./index.css";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

export const AccountInformation = observer((): ReactElement => {
    const store = useStore().accountStore;
    const {
        account: { name },
        accountExtData: { APR, Term, Payment_Amt, Curr_Due },
    } = store;

    return (
        <div className='account-info'>
            <h3 className='account-info__title account-title'>Account Information</h3>
            <div className='account-details grid'>
                <div className='col-6'>
                    <InfoSection
                        title='Contact Information'
                        details={[
                            `Full Name: ${name}`,
                            "Work Phone: 631-429-6822",
                            "Mobile: 633-899-1958",
                            "Co-Buyer: Paul Anderson",
                        ]}
                    />

                    <InfoSection
                        title='Selling Dealer'
                        details={[
                            "Full Name: Albert Naumov",
                            "Address: 0540 Marquardt Meadows, Tallahassee",
                        ]}
                    />
                    <InfoSection
                        title='Account Balance'
                        details={[
                            "Starting Balance: $0.00",
                            "Principal Paid: $0.00",
                            "Interest Paid: $0.00",
                            "Total Paid: $0.00",
                            "Total Adjustments: $0.00",
                            "Current Balance: $0.00",
                        ]}
                    />
                </div>
                <div className='col-6'>
                    <InfoSection
                        title='Contact Values'
                        details={[
                            "Atm Financed: $0.00",
                            `APR (%): ${APR?.toFixed(2)} %`,
                            `Term: ${Term} months`,
                            `Payment Amount: $ ${Payment_Amt?.toFixed(2)}`,
                            "Deal's Date: 06/09/2024",
                        ]}
                    />
                    <InfoSection
                        title='Account Standing'
                        details={[
                            `Current Due: $ ${Curr_Due}`,
                            "Down Pmt Balance: $0.00",
                            "Fees: $0.00",
                            "Due Date: 06/10/2024",
                            "Days Overdue: 8",
                            "Last Paid: $0.00",
                            "Last Paid Date: 8",
                        ]}
                    />
                    <Button className='account-info__button' outlined>
                        Calculate Payoff
                    </Button>
                </div>
            </div>
        </div>
    );
});
