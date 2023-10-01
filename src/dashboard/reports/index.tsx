import React, { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import {
    getReportById,
    getReportsList,
    makeReports,
    printDocumentByUser,
} from "http/services/reports.service";
import { Button } from "primereact/button";

export default function Reports() {
    const [authUser, setUser] = useState<AuthUser | null>(null);

    const printTableData = () => {
        makeReports(authUser?.useruid).then((response) => {
            setTimeout(() => {
                getReportById(response.taskuid).then((response) => {
                    const url = new Blob([response], { type: "application/pdf" });
                    let link = document.createElement("a");
                    link.href = window.URL.createObjectURL(url);
                    link.download = "Report.pdf";
                    link.click();
                });
            }, 5000);
        });
    };

    const printUserDocument = () => {
        // eslint-disable-next-line no-console
        printDocumentByUser(authUser?.useruid).then((document) => console.log(document));
    };

    useEffect(() => {
        const authUser: AuthUser = getKeyValue("admss-client-app-user");
        if (authUser) {
            setUser(authUser);
            getReportsList(authUser.useruid, { total: 1 }).then((response) => {});
        }
    }, []);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Reports</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-6'>
                                <div className='contact-top-controls'>
                                    <Button
                                        severity='success'
                                        label='Print report'
                                        className='m-r-20px'
                                        type='button'
                                        icon='pi pi-print'
                                        onClick={printTableData}
                                    />
                                    <Button
                                        severity='success'
                                        label='Print document'
                                        type='button'
                                        icon='pi pi-print'
                                        onClick={printUserDocument}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
