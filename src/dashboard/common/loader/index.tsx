import { ReactElement } from "react";
import "./index.css";

export const Loader = ({ overlay }: { overlay?: boolean }): ReactElement => {
    return (
        <div className={`loader-wrapper ${overlay && "loader-wrapper--overlay"}`}>
            <div className='loader'></div>
            <div className='loader-text'>Loading, please wait...</div>
        </div>
    );
};
