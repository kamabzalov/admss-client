import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import "./index.css";
import { ReportEditForm } from "./edit";
import { observer } from "mobx-react-lite";
import { ReportFooter } from "./common";

enum REPORT_TYPES {
    FAVORITES = "Favorites",
    CUSTOM = "Custom reports",
}

export const ReportForm = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const reportStore = useStore().reportStore;
    const navigate = useNavigate();
    const { id } = useParams();
    const { authUser } = userStore;
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [selectedTabUID, setSelectedTabUID] = useState<string | null>(null); // State for selected tab

    const handleGetUserReportCollections = (useruid: string) =>
        getUserReportCollectionsContent(useruid).then((response) => {
            if (Array.isArray(response)) {
                const collectionsWithoutFavorite = response.filter(
                    (collection: ReportCollection) =>
                        collection.description !== REPORT_TYPES.FAVORITES
                );

                const customReportsCollection = collectionsWithoutFavorite.find(
                    (collection: ReportCollection) => collection.name === REPORT_TYPES.CUSTOM
                );

                if (customReportsCollection) {
                    setCollections([
                        customReportsCollection,
                        ...collectionsWithoutFavorite.filter(
                            (collection) => collection.name !== REPORT_TYPES.CUSTOM
                        ),
                    ]);
                } else {
                    setCollections(collectionsWithoutFavorite);
                }
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
        if (report.documentUID === id) return;
        reportStore.report = report;
        reportStore.reportName = report.name;
        setSelectedTabUID(report.itemUID); // Update selected tab UID
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
                            {id ? "Edit" : "Create"} custom report
                        </h2>
                    </div>
                    <div className='card-content report__card grid'>
                        <div className='col-4'>
                            <Accordion multiple className='report__accordion'>
                                {collections &&
                                    [...favoriteCollections, ...collections].map(
                                        ({
                                            itemUID,
                                            name,
                                            documents,
                                            collections: nestedCollections,
                                        }: ReportCollection) => (
                                            <AccordionTab
                                                key={itemUID}
                                                header={name}
                                                disabled={
                                                    !documents?.length && !nestedCollections?.length
                                                }
                                                className={`report__accordion-tab ${
                                                    selectedTabUID === itemUID
                                                        ? "report__list-item--selected"
                                                        : ""
                                                }`}
                                            >
                                                {nestedCollections && (
                                                    <Accordion
                                                        multiple
                                                        className='nested-accordion'
                                                    >
                                                        {nestedCollections.map(
                                                            (nestedCollection) => (
                                                                <AccordionTab
                                                                    key={nestedCollection.itemUID}
                                                                    header={nestedCollection.name}
                                                                    disabled={
                                                                        !nestedCollection.documents
                                                                            ?.length
                                                                    }
                                                                    className={`nested-accordion-tab ${
                                                                        selectedTabUID ===
                                                                        nestedCollection.itemUID
                                                                            ? "report__list-item--selected"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {nestedCollection.documents &&
                                                                        nestedCollection.documents.map(
                                                                            (report) => (
                                                                                <Button
                                                                                    className={`report__list-item w-full ${
                                                                                        selectedTabUID ===
                                                                                        report.itemUID
                                                                                            ? "report__list-item--selected"
                                                                                            : ""
                                                                                    }`}
                                                                                    key={
                                                                                        report.itemUID
                                                                                    }
                                                                                    text
                                                                                    onClick={(
                                                                                        event
                                                                                    ) => {
                                                                                        event.preventDefault();
                                                                                        handleAccordionTabChange(
                                                                                            report
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <p className='report-item__name'>
                                                                                        {
                                                                                            report.name
                                                                                        }
                                                                                    </p>
                                                                                </Button>
                                                                            )
                                                                        )}
                                                                </AccordionTab>
                                                            )
                                                        )}
                                                    </Accordion>
                                                )}
                                                {documents &&
                                                    documents.map((report) => (
                                                        <Button
                                                            className={`report__list-item report-item w-full ${
                                                                selectedTabUID === report.itemUID
                                                                    ? "report__list-item--selected"
                                                                    : ""
                                                            }`}
                                                            key={report.itemUID}
                                                            text
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                handleAccordionTabChange(report);
                                                            }}
                                                        >
                                                            <p className='report-item__name'>
                                                                {report.name}
                                                            </p>
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
