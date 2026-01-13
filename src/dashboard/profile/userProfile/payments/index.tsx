import { ReactElement } from "react";
import "./index.css";

export const Payments = (): ReactElement => {
    return (
        <div className='user-profile__content'>
            <div className='user-profile-payment'>
                <div className='user-profile-payment__label'>Next payment</div>
                <div className='user-profile-payment__value'>16 of May, 2023</div>
            </div>
        </div>
    );
};
