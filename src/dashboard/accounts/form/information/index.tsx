import { ReactElement } from "react";
import { InfoSection } from "./info-section";
import "./index.css";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

export const AccountInformation = observer((): ReactElement => {
    const store = useStore().accountStore;
    const {
        account: { startingballance },
        accountExtData: {
            APR,
            Term,
            Curr_Due,
            buyerName,
            buyerWorkPhone,
            buyerMobile,
            cobuyerName,
            Principal_Paid,
            Interest_Paid,
            Total_Paid,
            Total_Adjustments,
            Balance,
            Con_Amt_To_Finance,
            Con_Pmt_Amt,
            dateeffective,
            Down_Pmt_Balance,
            Fees,
            Next_Pmt_Due,
            DaysOverdue,
            Last_Paid,
            Last_Paid_Date,
        },
    } = store;
    const navigate = useNavigate();

    return (
        <div className='account-info'>
            <h3 className='account-info__title account-title'>Account Information</h3>
            <div className='account-details grid'>
                <div className='col-6'>
                    <InfoSection
                        title='Contact Information'
                        details={[
                            `Full Name: ${buyerName}`,
                            `Work Phone: ${buyerWorkPhone}`,
                            `Mobile: ${buyerMobile}`,
                            `Co-Buyer: ${cobuyerName}`,
                        ]}
                    />

                    <InfoSection
                        title='Selling Dealer'
                        details={[
                            `Full Name: Selling Dealer Name`,
                            "Address: 0540 Marquardt Meadows, Tallahassee",
                        ]}
                    />
                    <InfoSection
                        title='Account Balance'
                        details={[
                            `Starting Balance: ${startingballance}`,
                            `Principal Paid: $${Principal_Paid?.toFixed(2)}`,
                            `Interest Paid: $${Interest_Paid?.toFixed(2)}`,
                            `Total Paid: $${Total_Paid?.toFixed(2)}`,
                            `Total Adjustments: $${Total_Adjustments?.toFixed(2)}`,
                            `Current Balance: $${Balance?.toFixed(2)}`,
                        ]}
                    />
                </div>
                <div className='col-6'>
                    <InfoSection
                        title='Contact Values'
                        details={[
                            `Atm Financed: $ ${Con_Amt_To_Finance?.toFixed(2)}`,
                            `APR (%): ${APR?.toFixed(2)} %`,
                            `Term: ${Term} months`,
                            `Payment Amount: $ ${Con_Pmt_Amt?.toFixed(2)}`,
                            `Deal's Date: ${dateeffective}`,
                        ]}
                    />
                    <InfoSection
                        title='Account Standing'
                        details={[
                            `Current Due: $ ${Curr_Due}`,
                            `Down Pmt Balance: $${Down_Pmt_Balance}`,
                            `Fees: $${Fees}`,
                            `Due Date: ${Next_Pmt_Due}`,
                            `Days Overdue: ${DaysOverdue}`,
                            `Last Paid: $${Last_Paid}`,
                            `Last Paid Date: ${Last_Paid_Date}`,
                        ]}
                    />
                    <Button
                        className='account-info__button'
                        onClick={() => navigate(`take-payment`)}
                        outlined
                    >
                        Calculate Payoff
                    </Button>
                </div>
            </div>
        </div>
    );
});
