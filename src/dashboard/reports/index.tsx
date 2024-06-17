import { ReactElement, useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import {
    createReportCollection,
    getReportsList,
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
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { MultiSelect } from "primereact/multiselect";
import { ReportCollectionContent, ReportDocument } from "common/models/reports";

interface Report {
    id: string;
    name: string;
}

export default function Reports(): ReactElement {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [reportSearch, setReportSearch] = useState<string>("");
    // eslint-disable-next-line
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [collections, setCollections] = useState<ReportCollectionContent[]>([]);
    const [collectionName, setCollectionName] = useState<string>("");
    const [selectedReports, setSelectedReports] = useState<Report[]>([]);

    const toast = useToast();

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    const handleGetReportList = (useruid: string) =>
        getReportsList(useruid).then((response) => {
            const { error } = response as BaseResponseError;
            if (error && toast.current) {
                return toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error,
                    life: TOAST_LIFETIME,
                });
            }
            const document = response as ReportDocument[];
            setReports(document);
        });

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
            const collections = response as ReportCollectionContent[];
            setCollections(collections);
        });

    useEffect(() => {
        if (user) {
            handleGetReportList(user.useruid);
            handleGetUserReportCollections(user.useruid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast, user]);

    // eslint-disable-next-line
    const ActionButtons = ({ reportuid }: { reportuid: string }): ReactElement => {
        return (
            <div className='reports-actions flex gap-3'>
                <Button className='p-button' icon='pi pi-plus' outlined />
                <Button className='p-button' icon='pi pi-heart' outlined />
                <Button className='p-button reports-actions__button' outlined>
                    Preview
                </Button>
                <Button className='p-button reports-actions__button' outlined>
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
                <Button className='reports-header__button'>Custom Report</Button>
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

    // eslint-disable-next-line
    const handleReportGroupSelect = (items: Report[]) => {
        const allItemsSelected = items.every((item) =>
            selectedReports.some((selected) => selected.id === item.id)
        );

        if (allItemsSelected) {
            setSelectedReports(
                selectedReports.filter((report) => !items.some((item) => item.id === report.id))
            );
        } else {
            const newSelectedReports = items.filter(
                (item) => !selectedReports.some((selected) => selected.id === item.id)
            );
            setSelectedReports([...selectedReports, ...newSelectedReports]);
        }
    };

    const handleCreateCollection = () => {
        if (collectionName) {
            createReportCollection(user!.useruid, collectionName).then((response) => {
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
                                                options={reports}
                                                className='w-full new-collection__multiselect'
                                                placeholder='Select reports'
                                                showSelectAll={false}
                                                value={selectedReports}
                                                display='chip'
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
                                        collections.map(({ itemUID, name }) => (
                                            <AccordionTab
                                                key={itemUID}
                                                header={
                                                    <ReportsAccordionHeader
                                                        title={name}
                                                        info={`(0 reports)`}
                                                    />
                                                }
                                                className='reports__accordion-tab'
                                            ></AccordionTab>
                                        ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
