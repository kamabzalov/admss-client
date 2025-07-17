import { Card } from "primereact/card";
import { InterestIncome } from "dashboard/deals/form/washout/interest-profit/interest-income";
import { AccountWash } from "dashboard/deals/form/washout/interest-profit/account-wash";
import "./index.css";

export const InterestProfit = () => {
    return (
        <div className='interest-profit'>
            <Card className='profit-card interest-income'>
                <div className='profit-card__header'>Interest Income</div>
                <div className='profit-card__body'>
                    <InterestIncome />
                </div>
            </Card>

            <Card className='profit-card account-wash'>
                <div className='profit-card__header'>Account Wash</div>
                <div className='profit-card__body'>
                    <AccountWash />
                </div>
            </Card>
        </div>
    );
};
