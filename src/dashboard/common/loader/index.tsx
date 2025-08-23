import { ReactElement } from "react";
import "./index.css";

const LOADER_COLORS = {
    default: "default",
    white: "white",
};

const LOADER_SIZES = {
    small: "small",
    default: "default",
    large: "large",
};

interface LoaderProps {
    overlay?: boolean;
    size?: keyof typeof LOADER_SIZES;
    includeText?: boolean;
    color?: keyof typeof LOADER_COLORS;
    className?: string;
}

export const Loader = ({
    overlay,
    size,
    includeText = true,
    color = "default",
    className,
}: LoaderProps): ReactElement => {
    return (
        <div
            className={`loader-wrapper ${overlay ? "loader-wrapper--overlay" : ""} loader--${color} ${className}`}
        >
            <div className={`loader ${size ? `loader--${size}` : ""}`}></div>
            {includeText && <div className='loader-text'>Loading, please wait...</div>}
        </div>
    );
};
