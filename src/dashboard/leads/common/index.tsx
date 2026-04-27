import { Deal } from "common/models/deals";
import {
    DEAL_STATUS_ID,
    LEAD_STATUS_CLASS_MODIFIER,
    LEAD_STATUS_LABEL,
    LEAD_STATUS_TONE,
    LEAD_TYPE_LABEL,
} from "common/constants/lead-options";

export type LeadStatusTone = LEAD_STATUS_TONE;

export const getLeadTypeLabel = (dealType: number | null | undefined): string => {
    if (dealType == null) return "";
    return dealType <= 1 ? LEAD_TYPE_LABEL.TRADE_IN : LEAD_TYPE_LABEL.SERVICE;
};

export const formatCreatedDate = (value: string): string => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
};

const classifyLeadStatusFromDealStatus = (dealStatusId: number): LEAD_STATUS_TONE | null => {
    switch (dealStatusId) {
        case DEAL_STATUS_ID.DEAD_OR_DELETED:
            return LEAD_STATUS_TONE.REJECTED;
        case DEAL_STATUS_ID.SOLD_FINALIZED:
            return LEAD_STATUS_TONE.COMPLETED;
        case DEAL_STATUS_ID.PENDING_OR_IN_TRANSIT:
        case DEAL_STATUS_ID.SOLD_NOT_FINALIZED:
            return LEAD_STATUS_TONE.IN_PROGRESS;
        case DEAL_STATUS_ID.QUOTE_OR_PROSPECT:
            return LEAD_STATUS_TONE.NEW;
        default:
            return null;
    }
};

export const getLeadStatusPresentation = (
    deal: Deal
): { label: string; tone: LeadStatusTone | null } => {
    const tone = classifyLeadStatusFromDealStatus(deal.dealstatus);

    return {
        label: tone ? LEAD_STATUS_LABEL[tone] : "",
        tone,
    };
};

export const getLeadStatusToneModifier = (tone: LeadStatusTone): string =>
    LEAD_STATUS_CLASS_MODIFIER[tone];
