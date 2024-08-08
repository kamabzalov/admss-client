import { ReactElement, useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import {
    createReportCollection,
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { BaseResponseError } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Panel } from "primereact/panel";
import { MultiSelect } from "primereact/multiselect";
import { ReportCollection, ReportDocument } from "common/models/reports";
import {
    ActionButtons,
    ReportsAccordionHeader,
    ReportsPanelHeader,
} from "dashboard/reports/common";

export default function Reports(): ReactElement {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [reportSearch, setReportSearch] = useState<string>("");
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [favoriteCollections, setFavoriteCollections] = useState<ReportCollection[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");
    const [selectedReports, setSelectedReports] = useState<ReportDocument[]>([]);
    const [customCollections, setCustomCollections] = useState<ReportCollection[]>([]);

    const toast = useToast();

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    const handleGetUserReportCollections = (useruid: string) =>
        getUserReportCollectionsContent(useruid).then((response) => {
            const { error } = response as BaseResponseError;
            if (error && toast.current) {
                return toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error,
                    life: TOAST_LIFETIME,
                });
            }
            if (Array.isArray(response)) {
                const collectionsWithoutFavorite = response.filter(
                    (collection: ReportCollection) => collection.description !== "Favorites"
                );
                setCollections(collectionsWithoutFavorite);
                setCustomCollections(response.slice(0, 5));
            } else {
                setCollections([]);
            }
        });

    useEffect(() => {
        if (user) {
            handleGetUserReportCollections(user.useruid);
            getUserFavoriteReportList(user.useruid).then((response) => {
                if (Array.isArray(response)) {
                    setFavoriteCollections(response);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast, user]);

    const handleCreateCollection = () => {
        if (collectionName) {
            createReportCollection(user!.useruid, {
                name: collectionName,
                documents: selectedReports,
            }).then((response) => {
                const { error } = response as BaseResponseError;
                if (error && toast.current) {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    user && handleGetUserReportCollections(user.useruid);
                }
            });
        }
    };

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card reports'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Reports</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-12'>
                                <Panel
                                    headerTemplate={(options) =>
                                        ReportsPanelHeader({
                                            options,
                                            navigatePath: "create",
                                            state: reportSearch,
                                            setStateAction: setReportSearch,
                                        })
                                    }
                                    className='new-collection w-full'
                                    collapsed
                                    toggleable
                                >
                                    <h3 className='uppercase new-collection__title'>
                                        Add new collection
                                    </h3>
                                    <div className='grid new-collection__form'>
                                        <div className='col-4'>
                                            <InputText
                                                className='w-full'
                                                value={collectionName}
                                                onChange={(e) => setCollectionName(e.target.value)}
                                                placeholder='Collection name'
                                            />
                                        </div>
                                        <div className='col-8'>
                                            <MultiSelect
                                                filter
                                                optionLabel='name'
                                                options={collections.filter(
                                                    (collection) => collection.documents
                                                )}
                                                optionGroupChildren='documents'
                                                optionGroupLabel='name'
                                                className='w-full new-collection__multiselect'
                                                placeholder='Select reports'
                                                showSelectAll={false}
                                                value={selectedReports || []}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedReports(e.value);
                                                }}
                                                pt={{
                                                    wrapper: {
                                                        style: {
                                                            minHeight: "420px",
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                        <div className='col-12 flex justify-content-end'>
                                            <Button onClick={handleCreateCollection} outlined>
                                                Create collection
                                            </Button>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                            <div className='col-12'>
                                <Accordion multiple className='reports__accordion'>
                                    <AccordionTab
                                        header={
                                            <ReportsAccordionHeader
                                                title='Custom Collections'
                                                info={`(${
                                                    customCollections?.length || 0
                                                } collections/ ${
                                                    customCollections?.reduce(
                                                        (acc, { documents }: ReportCollection) =>
                                                            acc + documents?.length || acc,
                                                        0
                                                    ) || 0
                                                } reports)`}
                                                label='New'
                                            />
                                        }
                                        className='reports__accordion-tab'
                                    >
                                        <Accordion
                                            multiple
                                            className='reports__accordion reports__accordion--inner'
                                        >
                                            {collections &&
                                                [...collections]
                                                    .splice(0, 5)
                                                    .map(
                                                        (
                                                            {
                                                                itemUID,
                                                                name,
                                                                documents,
                                                            }: ReportCollection,
                                                            index: number
                                                        ) => (
                                                            <AccordionTab
                                                                key={itemUID}
                                                                header={
                                                                    <ReportsAccordionHeader
                                                                        title={name}
                                                                        info={`(${
                                                                            documents?.length || 0
                                                                        } reports)`}
                                                                        actionButton={
                                                                            <Button
                                                                                label='Edit'
                                                                                className='reports-actions__button'
                                                                                outlined
                                                                            />
                                                                        }
                                                                        label={index === 1 && "New"}
                                                                    />
                                                                }
                                                                className='reports__accordion-tab'
                                                            >
                                                                {documents &&
                                                                    documents.map((report) => (
                                                                        <div
                                                                            className='reports__list-item reports__list-item--inner'
                                                                            key={report.itemUID}
                                                                        >
                                                                            <p>{report.name}</p>
                                                                            <ActionButtons
                                                                                reportuid={
                                                                                    report.itemUID
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}
                                                            </AccordionTab>
                                                        )
                                                    )}
                                        </Accordion>
                                    </AccordionTab>
                                    {collections &&
                                        [...favoriteCollections, ...collections].map(
                                            ({ itemUID, name, documents }: ReportCollection) => (
                                                <AccordionTab
                                                    key={itemUID}
                                                    header={
                                                        <ReportsAccordionHeader
                                                            title={name}
                                                            info={`(${
                                                                documents?.length || 0
                                                            } reports)`}
                                                        />
                                                    }
                                                    className='reports__accordion-tab'
                                                >
                                                    {documents &&
                                                        documents.map((report) => (
                                                            <div
                                                                className='reports__list-item'
                                                                key={report.itemUID}
                                                            >
                                                                <p>{report.name}</p>
                                                                <ActionButtons
                                                                    reportuid={report.itemUID}
                                                                />
                                                            </div>
                                                        ))}
                                                </AccordionTab>
                                            )
                                        )}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
