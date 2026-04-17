import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { MultiSelect, MultiSelectProps } from "primereact/multiselect";
import "./index.css";

export type ChipMultiSelectProps = MultiSelectProps & {
    overflowCount?: number | null;
    floatLabel?: boolean;
    label?: ReactNode;
    floatClassName?: string;
};

export function ChipMultiSelect({
    overflowCount,
    floatLabel = false,
    label,
    floatClassName,
    className,
    display = "chip",
    showClear,
    value,
    ...rest
}: ChipMultiSelectProps) {
    const shellRef = useRef<HTMLSpanElement | null>(null);
    const [countLeft, setCountLeft] = useState<number | null>(null);
    const showCount = overflowCount != null && overflowCount > 0;
    const hasValue = Array.isArray(value)
        ? value.length > 0
        : value !== undefined && value !== null && value !== "";
    const showFloatLabel = floatLabel && label != null;
    const showPlainLabel = !floatLabel && label != null && !hasValue;
    const msClassName = ["chip-multiselect", className].filter(Boolean).join(" ");
    const shellClassName = [
        "chip-multiselect-shell",
        showFloatLabel ? "p-float-label" : "",
        floatClassName,
    ]
        .filter(Boolean)
        .join(" ");

    useEffect(() => {
        if (!showCount) {
            setCountLeft(null);
            return;
        }

        const updateCountPosition = () => {
            const shellElement = shellRef.current;
            if (!shellElement) return;

            const tokenElement = shellElement.querySelector(
                ".chip-multiselect .p-multiselect-token"
            ) as HTMLElement | null;
            if (!tokenElement) {
                setCountLeft(null);
                return;
            }

            const shellRect = shellElement.getBoundingClientRect();
            const tokenRect = tokenElement.getBoundingClientRect();
            const nextLeft = Math.max(0, Math.round(tokenRect.right - shellRect.left + 5));
            setCountLeft((prevLeft) => (prevLeft === nextLeft ? prevLeft : nextLeft));
        };

        const frameId = window.requestAnimationFrame(updateCountPosition);
        window.addEventListener("resize", updateCountPosition);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateCountPosition);
        };
    }, [showCount, value]);

    return (
        <span className={shellClassName} ref={shellRef}>
            <MultiSelect
                {...rest}
                value={value}
                display={display}
                showClear={showClear ?? true}
                className={msClassName}
            />
            {showCount && countLeft != null ? (
                <span className='chip-multiselect__count' style={{ left: `${countLeft}px` }}>
                    +{overflowCount}
                </span>
            ) : null}
            {showFloatLabel ? <label className='float-label'>{label}</label> : null}
            {showPlainLabel ? <span className='chip-multiselect__label'>{label}</span> : null}
        </span>
    );
}
