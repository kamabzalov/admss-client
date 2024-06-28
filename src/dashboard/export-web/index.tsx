import { ReactElement } from "react";
import { ExportWeb } from "./export";
import "./index.css";
import { TabPanel, TabView } from "primereact/tabview";
import { ExportSchedule } from "./schedule";
import { ExportHistory } from "./history";

interface TabItem {
    tabName: string;
    component: ReactElement;
}

export const ExportToWeb = (): ReactElement => {
    const tabItems: TabItem[] = [
        { tabName: "Export to web", component: <ExportWeb /> },
        { tabName: "Schedule", component: <ExportSchedule /> },
        { tabName: "History", component: <ExportHistory /> },
    ];
    return (
        <div className='grid export-web'>
            <div className='col-12'>
                <TabView className='card'>
                    {tabItems.map(({ tabName, component }) => {
                        return (
                            <TabPanel
                                header={tabName}
                                headerClassName='card-header export-web__header uppercase m-0'
                                children={component}
                                key={tabName}
                            />
                        );
                    })}
                </TabView>
            </div>
        </div>
    );
};
