import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { ReportEditForm } from "./edit";
import { observer } from "mobx-react-lite";

export const ReportForm = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const reportStore = useStore().reportStore;
    const { setReport, report } = reportStore;
    const navigate = useNavigate();
    const { authUser } = userStore;
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);

    const handleGetUserReportCollections = (useruid: string) =>
        getUserReportCollectionsContent(useruid).then((response) => {
            if (Array.isArray(response)) {
                const collectionsWithoutFavorite = response.filter(
                    (collection: ReportCollection) => collection.description !== "Favorites"
                );
                setCollections(collectionsWithoutFavorite);
            } else {
                setCollections([]);
            }
        });

    useEffect(() => {
        if (authUser) {
            handleGetUserReportCollections(authUser.useruid);
            getUserFavoriteReportList(authUser.useruid).then((response) => {
                if (Array.isArray(response)) {
                    setFavoriteCollections(response);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    const handleAccordionTabChange = (report: ReportDocument) => {
        setReport(report);
        navigate(`/dashboard/reports/${report.itemUID}`);
    };

    return (
        <div className='grid relative'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={() => navigate("/dashboard/reports")}
            />
            <div className='col-12'>
                <div className='card report'>
                    <div className='card-header flex'>
                        <h2 className='report__title uppercase m-0'>Create custom report</h2>
                    </div>
                    <div className='card-content report__card grid'>
                        <div className='col-4'>
                            <Accordion multiple className='report__accordion'>
                                {collections &&
                                    [...favoriteCollections, ...collections].map(
                                        ({ itemUID, name, documents }: ReportCollection) => (
                                            <AccordionTab
                                                key={itemUID}
                                                header={name}
                                                className='report__accordion-tab'
                                            >
                                                {documents &&
                                                    documents.map((report) => (
                                                        <Button
                                                            className='report__list-item'
                                                            key={report.itemUID}
                                                            text
                                                            onClick={() =>
                                                                handleAccordionTabChange(report)
                                                            }
                                                        >
                                                            <p>{report.name}</p>
                                                        </Button>
                                                    ))}
                                            </AccordionTab>
                                        )
                                    )}
                            </Accordion>
                        </div>
                        <ReportEditForm />
                    </div>
                    <div className='report__footer gap-3 mt-8 mr-3'>
                        <Button
                            className='report__icon-button'
                            icon='icon adms-password'
                            severity='secondary'
                            disabled
                        />
                        <Button
                            className='report__icon-button'
                            icon='icon adms-blank'
                            severity='secondary'
                            disabled
                        />
                        <Button
                            className='report__icon-button'
                            icon='icon adms-trash-can'
                            severity='secondary'
                            disabled
                        />
                        <Button
                            className='ml-auto uppercase px-6 report__button'
                            severity='danger'
                            outlined
                        >
                            Cancel
                        </Button>
                        <Button
                            className='uppercase px-6 report__button'
                            disabled={!report.name}
                            severity={!report.name ? "secondary" : "success"}
                        >
                            {report ? "Update" : "Create"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});
