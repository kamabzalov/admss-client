/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement } from "react";
import "./index.css";

interface ContactsOfacCheckProps {
    type?: "buyer" | "co-buyer";
}

export const ContactsOfacCheck = observer(({ type }: ContactsOfacCheckProps): ReactElement => {
    return (
        <div className='grid ofac-check row-gap-2'>
            <div className='col-3 px-0'>
                <Button label='Check' className='ofac-check__button' outlined />
            </div>

            <div className='col-12 ofac-check__field'></div>
        </div>
    );
});
