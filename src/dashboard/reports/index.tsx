import { ReactElement, useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { getCommonReportsList, getReportById, getReportsList } from "http/services/reports.service";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { BaseResponseError, Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";

const mockReportsGroup = [
    {
        id: 1,
        name: "Favorites",
    },
    {
        id: 2,
        name: "AR Reports",
    },
    {
        id: 3,
        name: "BHPH Reports",
    },
    {
        id: 4,
        name: "Custom Collections",
    },
    {
        id: 5,
        name: "Custom Reports",
    },
    {
        id: 6,
        name: "Inventory Reports",
    },
    {
        id: 7,
        name: "Miscellaneous",
    },
    {
        id: 8,
        name: "Sales Reports",
    },
];

const getMockReports = () => {
    return Array.from({ length: Math.random() * 7 + 1 }, (_, i) => ({
        id: i.toString(),
        name: `report ${i + 1}`,
    }));
};

export default function Reports(): ReactElement {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [reportSearch, setReportSearch] = useState<string>("");

    const toast = useToast();

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    useEffect(() => {
        if (user) {
            getReportsList(user.useruid, { total: 1 }).then((response) => {});
            getCommonReportsList().then((response) => {
                if (response.status === Status.ERROR && toast.current) {
                    const { error } = response as BaseResponseError;
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                        life: TOAST_LIFETIME,
                    });
                }
            });
        }
    }, [toast, user]);

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

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card reports'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Reports</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='reports-header col-12'>
                                <Button icon='pi pi-plus' className='reports-header__button'>
                                    New collection
                                </Button>
                                <Button className='reports-header__button'>Custom Report</Button>
                                <span className='p-input-icon-right reports-header__search'>
                                    <i
                                        className={`pi pi-${
                                            !reportSearch ? "search" : "times cursor-pointer"
                                        }`}
                                        onClick={() => setReportSearch("")}
                                    />
                                    <InputText
                                        value={reportSearch}
                                        placeholder='Search'
                                        onChange={(e) => setReportSearch(e.target.value)}
                                    />
                                </span>
                            </div>
                            <div className='col-12'>
                                <Accordion
                                    multiple
                                    activeIndex={[0]}
                                    className='reports__accordion'
                                >
                                    {mockReportsGroup.map((group) => {
                                        const mockReports = getMockReports();
                                        return (
                                            <AccordionTab
                                                key={group.id}
                                                header={
                                                    <ReportsAccordionHeader
                                                        title={group.name}
                                                        info={`(${mockReports.length} reports)`}
                                                    />
                                                }
                                                className='reports__accordion-tab'
                                            >
                                                {mockReports.map((report) => (
                                                    <div
                                                        className='reports__list-item'
                                                        key={report.id}
                                                        onClick={() => getReportById(report.id)}
                                                    >
                                                        <p>{`${group.name} ${report.name}`}</p>
                                                        <ActionButtons reportuid={report.id} />
                                                    </div>
                                                ))}
                                            </AccordionTab>
                                        );
                                    })}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
