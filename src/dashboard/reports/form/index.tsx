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
    const { id } = useParams<{ id: string }>();
    const { authUser } = userStore;
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [selectedTabUID, setSelectedTabUID] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number[]>(!id ? [1] : []);

    const handleGetUserReportCollections = async (useruid: string) => {
        const response = await getUserReportCollectionsContent(useruid);
        if (Array.isArray(response)) {
            const collectionsWithoutFavorite = response.filter(
                (collection: ReportCollection) => collection.description !== REPORT_TYPES.FAVORITES
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
    };

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

    useEffect(() => {
        if (id && collections) {
            const allCollections = [...favoriteCollections, ...collections];

            const findReportInCollections = (
                targetId: string
            ): { mainIndex: number; nestedIndex?: number } | null => {
                const mainIndex = allCollections?.findIndex((collection) => {
                    if (collection.documents?.some((doc) => doc.documentUID === targetId)) {
                        return true;
                    }

                    return collection.collections?.some((nestedCollection) => {
                        if (
                            nestedCollection.documents?.some((doc) => doc.documentUID === targetId)
                        ) {
                            return true;
                        }
                        return false;
                    });
                });

                if (mainIndex !== -1) {
                    const nestedIndex = allCollections[mainIndex]?.collections?.findIndex(
                        (nestedCollection) =>
                            nestedCollection?.documents?.some(
                                (doc) => doc?.documentUID === targetId
                            )
                    );
                    return { mainIndex, nestedIndex: nestedIndex !== -1 ? nestedIndex : undefined };
                }

                return null;
            };

            const foundIndices = findReportInCollections(id);

            if (foundIndices) {
                const { mainIndex } = foundIndices;

                setActiveIndex([mainIndex]);
                setSelectedTabUID(id);
            } else {
                setActiveIndex([1]);
            }
        }
    }, [id, collections, favoriteCollections]);

    const handleAccordionTabChange = (report: ReportDocument) => {
        if (report.documentUID === id) return;
        reportStore.report = report;
        reportStore.reportName = report.name;
        setSelectedTabUID(report.itemUID);
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
                            <Accordion
                                activeIndex={activeIndex}
                                onTabChange={(e) => setActiveIndex(e.index as number[])}
                                multiple
                                className='report__accordion'
                            >
                                {[...favoriteCollections, ...collections].map(
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
                                                <Accordion multiple className='nested-accordion'>
                                                    {nestedCollections.map((nestedCollection) => (
                                                        <AccordionTab
                                                            key={nestedCollection.itemUID}
                                                            header={nestedCollection.name}
                                                            disabled={
                                                                !nestedCollection.documents?.length
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
                                                                                report.documentUID
                                                                                    ? "report__list-item--selected"
                                                                                    : ""
                                                                            }`}
                                                                            key={report.itemUID}
                                                                            text
                                                                            onClick={(event) => {
                                                                                event.preventDefault();
                                                                                handleAccordionTabChange(
                                                                                    report
                                                                                );
                                                                            }}
                                                                        >
                                                                            <p className='report-item__name'>
                                                                                {report.name}
                                                                            </p>
                                                                        </Button>
                                                                    )
                                                                )}
                                                        </AccordionTab>
                                                    ))}
                                                </Accordion>
                                            )}
                                            {documents &&
                                                documents.map((report) => (
                                                    <Button
                                                        className={`report__list-item report-item w-full ${
                                                            selectedTabUID === report.documentUID
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
