import { ReactElement, useState } from "react";
import { ExportWeb } from "./export";
import "./index.css";
import { TabPanel, TabView } from "primereact/tabview";
import { ExportSchedule } from "./schedule";
import { ExportHistory } from "./history";

interface TabItem {
    tabName: string;
    component: ReactElement;
    headerCount?: boolean;
}

interface TabHeaderProps {
    tabName: string;
    count?: number;
    isActive: boolean;
}

export const ExportToWeb = (): ReactElement => {
    const [selectedInventories, setSelectedInventories] = useState<number>(0);
    const tabItems: TabItem[] = [
        {
            tabName: "Export to web",
            component: <ExportWeb countCb={setSelectedInventories} />,
            headerCount: true,
        },
        { tabName: "Schedule", component: <ExportSchedule /> },
        { tabName: "History", component: <ExportHistory /> },
    ];

    const TabHeader = ({ tabName, count, isActive }: TabHeaderProps): ReactElement => (
        <>
            {tabName}
            {count !== undefined && (
                <span
                    className={`export-web__header-count ${
                        isActive ? "export-web__header-count--active" : ""
                    }`}
                >
                    ({count})
                </span>
            )}
        </>
    );

    return (
        <div className='grid export-web'>
            <div className='col-12'>
                <TabView className='card'>
                    {tabItems.map(({ tabName, component, headerCount }) => {
                        return (
                            <TabPanel
                                header={
                                    headerCount ? (
                                        <TabHeader
                                            tabName={tabName}
                                            count={selectedInventories}
                                            isActive={selectedInventories > 0}
                                        />
                                    ) : (
                                        tabName
                                    )
                                }
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
