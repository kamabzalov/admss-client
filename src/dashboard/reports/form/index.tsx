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
import { ReportFooter } from "./common";

export const ReportForm = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const reportStore = useStore().reportStore;
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

                const customReportsCollection = collectionsWithoutFavorite.find(
                    (collection: ReportCollection) => collection.name === "Custom reports"
                );

                if (customReportsCollection) {
                    const nestedDocuments = collectionsWithoutFavorite
                        .flatMap((collection) => collection.collections || [])
                        .flatMap((nestedCollection) => nestedCollection.documents || []);

                    customReportsCollection.documents = [
                        ...(customReportsCollection.documents || []),
                        ...nestedDocuments,
                    ];
                }

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
    }, [authUser]);

    const handleAccordionTabChange = (report: ReportDocument) => {
        reportStore.reportName = report.name;
        navigate(`/dashboard/reports/${report.documentUID}`);
    };

    const handleSave = () => {
        navigate(`/dashboard/reports`);
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
                        <h2 className='report__title uppercase m-0'>
                            {reportStore.report.itemuid ? "Edit" : "Create"} custom report
                        </h2>
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
                                                disabled={!documents?.length}
                                                className='report__accordion-tab'
                                            >
                                                {documents &&
                                                    documents.map((report) => (
                                                        <Button
                                                            className='report__list-item w-full'
                                                            key={report.itemUID}
                                                            text
                                                            onClick={() => {
                                                                reportStore.report = report;
                                                                handleAccordionTabChange(report);
                                                            }}
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
                    <ReportFooter onAction={handleSave} />
                </div>
            </div>
        </div>
    );
});
