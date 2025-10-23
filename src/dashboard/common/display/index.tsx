import { useEffect, useId, useRef, useState } from "react";
import { Tooltip, TooltipProps } from "primereact/tooltip";
import "./index.css";

interface TruncatedTextProps {
    text: string;
    className?: string;
    withTooltip?: boolean;
    tooltipOptions?: TooltipProps;
    width?: "auto" | "full";
}

interface SplitterProps {
    title?: string;
    children?: React.ReactNode;
    padding?: string;
    className?: string;
}

export const TruncatedText = ({
    text,
    className,
    withTooltip,
    tooltipOptions,
    width = "full",
}: TruncatedTextProps) => {
    const [isTextTruncated, setIsTextTruncated] = useState<boolean>(false);
    const textRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId();

    useEffect(() => {
        if (textRef.current) {
            const element = textRef.current;
            const isTruncated = element.scrollWidth > element.clientWidth;
            setIsTextTruncated(isTruncated);
        }
    }, [text]);

    return (
        <div
            ref={textRef}
            className={`truncated-text ${width === "auto" ? "w-auto" : "w-full"} ${className ?? ""}`}
            data-tooltip-id={uniqueId}
        >
            {text}
            {isTextTruncated && withTooltip && (
                <Tooltip
                    {...tooltipOptions}
                    target={`[data-tooltip-id="${uniqueId}"]`}
                    content={tooltipOptions?.content || text}
                    position={tooltipOptions?.position || "mouse"}
                />
            )}
        </div>
    );
};

export const Splitter = ({ title, children, padding = "pr-3", className }: SplitterProps) => {
    return (
        <div className={`splitter ${className ?? ""}`}>
            {title && (
                <h3 className={`splitter__title m-0 ${padding ? "" : "pr-3"}`} style={{ padding }}>
                    {title}
                </h3>
            )}
            <hr className={`splitter__line ${title ? "ml-3" : ""} flex-1`} />
            {children}
        </div>
    );
};
