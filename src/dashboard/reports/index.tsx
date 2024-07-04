import { ReactElement, useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import {
    createReportCollection,
    getReportTemplate,
    getUserFavoriteReportList,
    getUserReportCollectionsContent,
} from "http/services/reports.service";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { BaseResponseError, Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { MultiSelect } from "primereact/multiselect";
import { ReportCollection, ReportDocument } from "common/models/reports";
import { useNavigate } from "react-router-dom";

export default function Reports(): ReactElement {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [reportSearch, setReportSearch] = useState<string>("");
    const [collections, setCollections] = useState<ReportCollection[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");
    const [selectedReports, setSelectedReports] = useState<ReportDocument[]>([]);

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
                setCollections(response);
            } else {
                setCollections([]);
            }
        });

    useEffect(() => {
        if (user) {
            handleGetUserReportCollections(user.useruid);
            getUserFavoriteReportList(user.useruid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast, user]);

    const handleOpenReport = async (templateuid: string, preview: boolean = false) => {
        try {
            const response = await getReportTemplate(templateuid);
            if (!response) {
                throw new Error("Server not responding");
            }
            if (response.status === Status.ERROR) {
                throw new Error(response.error);
            }

            setTimeout(() => {
                const url = new Blob([response], { type: "application/pdf" });
                let link = document.createElement("a");
                link.href = window.URL.createObjectURL(url);
                if (!preview) {
                    link.download = `report_${templateuid}.pdf`;
                    link.click();
                } else {
                    window.open(
                        link.href,
                        "_blank",
                        "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                    );
                }
            }, 3000);
        } catch (error) {
            const err = error as BaseResponseError;
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: err.error || String(err),
                life: TOAST_LIFETIME,
            });
        }
    };

    const ActionButtons = ({ reportuid }: { reportuid: string }): ReactElement => {
        return (
            <div className='reports-actions flex gap-3'>
                <Button className='p-button' icon='pi pi-plus' outlined />
                <Button className='p-button' icon='pi pi-heart' outlined />
                <Button
                    className='p-button reports-actions__button'
                    outlined
                    onClick={() => handleOpenReport(reportuid, true)}
                >
                    Preview
                </Button>
                <Button
                    className='p-button reports-actions__button'
                    outlined
                    onClick={() => handleOpenReport(reportuid)}
                >
                    Download
                </Button>
            </div>
        );
    };

    const ReportsAccordionHeader = ({
        title,
        info,
    }: {
        title: string;
        info: string;
    }): ReactElement => {
        return (
            <div className='reports-accordion-header flex gap-1'>
                <div className='reports-accordion-header__title'>{title}</div>
                <div className='reports-accordion-header__info'>{info}</div>
            </div>
        );
    };

    const ReportsPanelHeader = (options: PanelHeaderTemplateOptions) => {
        return (
            <div className='reports-header col-12 px-0 pb-3'>
                <Button
                    icon='pi pi-plus'
                    className='reports-header__button'
                    onClick={options.onTogglerClick}
                >
                    New collection
                </Button>
                <Button className='reports-header__button' onClick={() => navigate("create")}>
                    Custom Report
                </Button>
                <span className='p-input-icon-right reports-header__search'>
                    <i
                        className={`pi pi-${!reportSearch ? "search" : "times cursor-pointer"}`}
                        onClick={() => setReportSearch("")}
                    />
                    <InputText
                        value={reportSearch}
                        placeholder='Search'
                        onChange={(e) => setReportSearch(e.target.value)}
                    />
                </span>
            </div>
        );
    };

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
                                    headerTemplate={ReportsPanelHeader}
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
                                    {collections &&
                                        collections.map(
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


