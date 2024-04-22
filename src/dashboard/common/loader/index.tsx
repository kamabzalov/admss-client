import { ReactElement } from "react";
import "./index.css";

export const Loader = (): ReactElement => {
    return (
        <div className='loader-wrapper'>
            <div className='loader'></div>
            <div className='loader-text'>Loading, please wait...</div>
        </div>
    );
};
