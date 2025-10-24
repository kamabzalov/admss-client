import { useToastMessage } from "common/hooks";
import { News } from "common/models/tasks";
import { DashboardDialog } from "dashboard/common/dialog";
import { getLatestNews, markNewsAsRead } from "http/services/tasks.service";
import { Column } from "primereact/column";
import { DataTableValue, DataTableRowClickEvent, DataTable } from "primereact/datatable";
import { DialogProps } from "primereact/dialog";
import { ReactElement, useState, useEffect } from "react";
import { useStore } from "store/hooks";
import { MAX_NEWS_COUNT_ON_PAGE } from "dashboard/home/latest-updates";
import { parseDateFromServer } from "common/helpers";
import { TruncatedText } from "dashboard/common/display";

interface LatestUpdatesDialogProps extends DialogProps {
    totalCount: number;
    selectedNews?: News | null;
}

export const LatestUpdatesDialog = ({
    visible,
    onHide,
    totalCount,
    selectedNews,
}: LatestUpdatesDialogProps): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const [newsData, setNewsData] = useState<News[]>([]);
    const [expandedRows, setExpandedRows] = useState<DataTableValue[]>([]);
    const { showError } = useToastMessage();

    const handleGetNews = async () => {
        if (!authUser) return;
        try {
            const newsResponse = await getLatestNews(authUser.useruid, {
                top: MAX_NEWS_COUNT_ON_PAGE,
            });

            if (newsResponse && Array.isArray(newsResponse)) {
                setNewsData(newsResponse);
            }
        } catch (error) {
            showError(String(error));
        }
    };

    useEffect(() => {
        handleGetNews();
    }, []);

    useEffect(() => {
        if (visible && selectedNews && newsData.length > 0) {
            const fullNewsData = newsData.find((news) => news.itemuid === selectedNews.itemuid);
            if (fullNewsData) {
                if (!fullNewsData.read) {
                    markNewsAsRead(fullNewsData.itemuid);
                }
                setExpandedRows([fullNewsData]);
            }
        } else if (visible && !selectedNews) {
            setExpandedRows([]);
        }
    }, [visible, selectedNews, newsData]);

    const rowExpansionTemplate = (data: News) => {
        return (
            <div className='datatable-hidden news-description'>
                <b>Description:</b> {data.description}
            </div>
        );
    };

    const handleRowClick = async (e: DataTableRowClickEvent) => {
        const rowData = e.data;
        const isRowExpanded = expandedRows.some((row) => row === rowData);

        if (isRowExpanded) {
            if (!rowData.read) {
                await markNewsAsRead(rowData.itemuid);
            }
            setExpandedRows(expandedRows.filter((row) => row !== rowData));
        } else {
            setExpandedRows([...expandedRows, rowData]);
        }
    };

    const newsIndicatorTemplate = (news: News) => {
        const isNew = !news.read;
        return (
            <div className='datatable-news__indicator'>
                <i className={`pi pi-circle-fill pi-circle-fill--${isNew ? "new" : "read"}`} />
            </div>
        );
    };

    const newsDescriptionTemplate = (news: News) => {
        return (
            <TruncatedText
                className={`datatable-news__description datatable-news__description--${news.index <= MAX_NEWS_COUNT_ON_PAGE ? "new" : "read"}`}
                withTooltip
                text={news.description}
            />
        );
    };

    const newsDateTemplate = (news: News) => {
        return (
            <span
                className={`datatable-news__date datatable-news__date--${news.index <= MAX_NEWS_COUNT_ON_PAGE ? "new" : "read"}`}
            >
                {parseDateFromServer(news.created, "date-with-time")}
            </span>
        );
    };

    return (
        <DashboardDialog
            className='dialog-news'
            header='Latest updates'
            visible={visible}
            onHide={onHide}
        >
            <DataTable
                className='datatable-news'
                value={newsData}
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e: DataTableRowClickEvent) => setExpandedRows([e.data])}
                onRowClick={handleRowClick}
                rowHover
                scrollable
            >
                <Column
                    body={newsIndicatorTemplate}
                    pt={{
                        root: {
                            style: {
                                width: "10px",
                            },
                        },
                        bodyCell: {
                            className: "datatable-news__indicator-cell",
                        },
                    }}
                />
                <Column field='description' header='Title' body={newsDescriptionTemplate} />
                <Column
                    field='created'
                    header='Date'
                    body={newsDateTemplate}
                    pt={{ root: { style: { width: "200px" } } }}
                />
            </DataTable>
        </DashboardDialog>
    );
};
