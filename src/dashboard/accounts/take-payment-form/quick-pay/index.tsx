import { ReactElement } from "react";
// import { useParams } from "react-router-dom";

import { observer } from "mobx-react-lite";

export const AccountQuickPay = observer((): ReactElement => {
    // const { id } = useParams();

    return <div className='quick-pay'>Quick Pay</div>;
});
