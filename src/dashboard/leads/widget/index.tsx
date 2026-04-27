import { LEADS_PAGE } from "common/constants/links";
import { Deal, TotalDealsList } from "common/models/deals";
import { getDealsList } from "http/services/deals.service";
import { Button } from "primereact/button";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "store/hooks";
import "./index.css";

const DEFAULT_LEADS_SHOW_COUNT = 4;

type LeadStatusTone = "new" | "in-progress" | "completed" | "neutral";

interface LatestLeadsProps {
    leadsShowCount?: number;
}

const getLeadTypeLabel = (dealtype: number): string => (dealtype <= 1 ? "Trade-In" : "Service");

const getLeadStatusToneFromText = (status: string): LeadStatusTone => {
    const normalized = status.trim().toUpperCase();

    if (normalized.includes("FINALIZED") || normalized.includes("COMPLETED")) {
        return "completed";
    }

    if (
        normalized.includes("IN PROGRESS") ||
        normalized.includes("PENDING") ||
        normalized.includes("NOT FINAL") ||
        normalized.includes("IN TRANSIT")
    ) {
        return "in-progress";
    }

    if (normalized.includes("NEW") || normalized.includes("QUOTE")) {
        return "new";
    }

    return "neutral";
};

const getLeadStatusToneFromDealStatus = (dealStatusId: number): LeadStatusTone => {
    switch (dealStatusId) {
        case 3:
            return "completed";
        case 1:
        case 2:
            return "in-progress";
        case 0:
            return "new";
        default:
            return "neutral";
    }
};

const getLeadStatusPresentation = (lead: Deal): { label: string; tone: LeadStatusTone } => {
    const statusText = lead.status?.trim() ?? "";
    const toneFromText = statusText ? getLeadStatusToneFromText(statusText) : "neutral";
    const tone =
        toneFromText !== "neutral"
            ? toneFromText
            : getLeadStatusToneFromDealStatus(lead.dealstatus);

    if (tone === "in-progress") {
        return { label: "IN PROGRESS", tone };
    }

    if (tone === "new") {
        return { label: "NEW", tone };
    }

    if (tone === "completed") {
        return { label: "COMPLETED", tone };
    }

    return { label: statusText.toUpperCase() || "UNKNOWN", tone };
};

const formatCreatedDate = (created: string): string => {
    const parsedDate = new Date(created);
    if (Number.isNaN(parsedDate.getTime())) {
        return created;
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
};

export const LatestLeads = ({
    leadsShowCount = DEFAULT_LEADS_SHOW_COUNT,
}: LatestLeadsProps): ReactElement => {
    const { authUser } = useStore().userStore;
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Deal[]>([]);
    const [allLeadsCount, setAllLeadsCount] = useState<number>(0);

    const handleGetLatestLeads = useCallback(async () => {
        if (!authUser) return;

        const [totalCountResponse, leadsResponse] = await Promise.all([
            getDealsList(authUser.useruid, { total: 1 }),
            getDealsList(authUser.useruid, {
                top: leadsShowCount,
                column: "created",
                type: "desc",
            }),
        ]);

        if (totalCountResponse && !Array.isArray(totalCountResponse)) {
            setAllLeadsCount((totalCountResponse as TotalDealsList).total ?? 0);
        }

        if (leadsResponse && Array.isArray(leadsResponse)) {
            setLeads(leadsResponse);
        }
    }, [authUser, leadsShowCount]);

    useEffect(() => {
        handleGetLatestLeads();
    }, [handleGetLatestLeads]);

    return (
        <section className='latest-leads'>
            <div className='latest-leads__header flex justify-content-between align-items-center'>
                <h2 className='card-content__title uppercase m-0'>Latest Leads</h2>
            </div>
            <div className='card-content latest-leads__content'>
                <div className='latest-leads__table'>
                    <div className='latest-leads__row latest-leads__row--header'>
                        <span className='latest-leads__cell'>Type</span>
                        <span className='latest-leads__cell'>Contact</span>
                        <span className='latest-leads__cell'>Created</span>
                        <span className='latest-leads__cell'>Status</span>
                    </div>
                    {leads.length ? (
                        leads.slice(0, leadsShowCount).map((lead) => {
                            const { label: statusLabel, tone: statusTone } =
                                getLeadStatusPresentation(lead);

                            return (
                                <div key={lead.itemuid} className='latest-leads__row'>
                                    <span className='latest-leads__cell'>
                                        {getLeadTypeLabel(lead.dealtype)}
                                    </span>
                                    <span className='latest-leads__cell'>{lead.contactinfo}</span>
                                    <span className='latest-leads__cell'>
                                        {formatCreatedDate(lead.created)}
                                    </span>
                                    <span className='latest-leads__cell'>
                                        <span
                                            className={`latest-leads__status latest-leads__status--${statusTone}`}
                                        >
                                            {statusLabel}
                                        </span>
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className='latest-leads__empty empty-list'>No leads yet.</div>
                    )}
                </div>
                {allLeadsCount > leadsShowCount && (
                    <div className='card-content__footer latest-leads__footer'>
                        <Button
                            className='latest-leads__button tasks-widget__button messages-more'
                            onClick={() => navigate(LEADS_PAGE.MAIN)}
                            text
                        >
                            See more...
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};
