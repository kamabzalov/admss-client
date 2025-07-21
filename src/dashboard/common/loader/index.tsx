import { ReactElement } from "react";
import "./index.css";

interface LoaderProps {
    overlay?: boolean;
    size?: "default" | "large";
    className?: string;
}

export const Loader = ({ overlay, size, className }: LoaderProps): ReactElement => {
    return (
        <div className={`loader-wrapper ${overlay && "loader-wrapper--overlay"} ${className}`}>
            <div className={`loader ${size ? `loader--${size}` : ""}`}></div>
            <div className='loader-text'>Loading, please wait...</div>
        </div>
    );
};
