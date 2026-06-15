import { TooltipProps } from "primereact/tooltip";
import {
    getTooltipOptions,
    getTooltipTailClassName,
    TooltipOptionsInput,
    TooltipPosition,
} from "dashboard/common/tooltip";

export { getTooltipTailClassName };
export type { TooltipPosition };

export const contactFormTooltipOptions = (options?: TooltipOptionsInput): TooltipProps =>
    getTooltipOptions(options);
