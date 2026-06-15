import { TooltipProps } from "primereact/tooltip";

export type TooltipPosition = NonNullable<TooltipProps["position"]> | "center";

interface TooltipPositionConfig {
    position: NonNullable<TooltipProps["position"]>;
    tailClassName: string;
    my?: string;
    at?: string;
}

const TOOLTIP_POSITION_CONFIG: Record<TooltipPosition, TooltipPositionConfig> = {
    top: { position: "top", tailClassName: "tooltip-tail-bottom" },
    bottom: { position: "bottom", tailClassName: "tooltip-tail-top" },
    left: { position: "left", tailClassName: "tooltip-tail-right" },
    right: { position: "right", tailClassName: "tooltip-tail-left" },
    mouse: { position: "mouse", tailClassName: "tooltip-tail-left" },
    center: {
        position: "right",
        tailClassName: "tooltip-tail-left",
        my: "left center",
        at: "center center",
    },
};

export const getTooltipTailClassName = (position: TooltipPosition = "top"): string =>
    TOOLTIP_POSITION_CONFIG[position]?.tailClassName ?? "tooltip-tail-bottom";

export interface TooltipOptionsInput extends Omit<TooltipProps, "position"> {
    position?: TooltipPosition;
}

export const getTooltipOptions = (options?: TooltipOptionsInput): TooltipProps => {
    const requestedPosition = options?.position ?? "top";
    const config = TOOLTIP_POSITION_CONFIG[requestedPosition] ?? TOOLTIP_POSITION_CONFIG.top;
    const className = [options?.className, config.tailClassName].filter(Boolean).join(" ");

    return {
        showOnDisabled: true,
        style: { maxWidth: "490px" },
        ...options,
        position: config.position,
        my: options?.my ?? config.my,
        at: options?.at ?? config.at,
        className,
    };
};
