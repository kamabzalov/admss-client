import { LEADS_PAGE } from "common/constants/links";
import { Deal, TotalDealsList } from "common/models/deals";
import { Button } from "primereact/button";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "store/hooks";
import {
    formatCreatedDate,
    getLeadStatusPresentation,
    getLeadStatusToneModifier,
    getLeadTypeLabel,
} from "dashboard/leads/common";
import "./index.css";
import { getDealsList } from "http/services/deals.service";

const DEFAULT_LEADS_SHOW_COUNT = 4;
const LEADS_EMPTY_MESSAGE = "No leads yet.";

interface LatestLeadsProps {
    leadsShowCount?: number;
}

export const LatestLeads = ({
    leadsShowCount = DEFAULT_LEADS_SHOW_COUNT,
}: LatestLeadsProps): ReactElement => {
    const { authUser } = useStore().userStore;
    const location = useLocation();
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
                {leads.length ? (
                    <div className='latest-leads__table'>
                        <div className='latest-leads__row latest-leads__row--header'>
                            <span className='latest-leads__cell'>Type</span>
                            <span className='latest-leads__cell'>Contact</span>
                            <span className='latest-leads__cell'>Created</span>
                            <span className='latest-leads__cell'>Status</span>
                        </div>
                        {leads.slice(0, leadsShowCount).map((lead) => {
                            const { label: statusLabel, tone: statusTone } =
                                getLeadStatusPresentation(lead);
                            const statusToneClass = statusTone
                                ? getLeadStatusToneModifier(statusTone)
                                : "";

                            return (
                                <div
                                    key={lead.itemuid}
                                    className='latest-leads__row'
                                    onClick={() =>
                                        navigate(LEADS_PAGE.EDIT(lead.dealuid), {
                                            state: {
                                                lead,
                                                prevPath: `${location.pathname}${location.search}`,
                                            },
                                        })
                                    }
                                >
                                    <span className='latest-leads__cell'>
                                        {getLeadTypeLabel(lead.dealtype)}
                                    </span>
                                    <span className='latest-leads__cell'>{lead.contactinfo}</span>
                                    <span className='latest-leads__cell'>
                                        {formatCreatedDate(lead.created)}
                                    </span>
                                    <span className='latest-leads__cell'>
                                        {statusTone ? (
                                            <span
                                                className={`latest-leads__status latest-leads__status--${statusToneClass}`}
                                            >
                                                {statusLabel}
                                            </span>
                                        ) : (
                                            ""
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className='latest-leads__empty empty-list'>{LEADS_EMPTY_MESSAGE}</div>
                )}
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
