import { useToastMessage } from "common/hooks";
import { News } from "common/models/tasks";
import { DashboardDialog } from "dashboard/common/dialog";
import { getLatestNews, markNewsAsRead } from "http/services/tasks.service";
import { Column } from "primereact/column";
import { DataTableRowClickEvent, DataTable, DataTableExpandedRows } from "primereact/datatable";
import { DialogProps } from "primereact/dialog";
import { ReactElement, useState, useEffect, useRef } from "react";
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
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const { showError } = useToastMessage();
    const isUpdatingFromClick = useRef(false);

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
        if (isUpdatingFromClick.current) {
            isUpdatingFromClick.current = false;
            return;
        }

        if (visible && selectedNews && newsData.length > 0) {
            const fullNewsData = newsData.find((news) => news.itemuid === selectedNews.itemuid);
            if (fullNewsData) {
                if (!fullNewsData.read) {
                    markNewsAsRead(fullNewsData.itemuid);
                    setNewsData(
                        newsData.map((news) =>
                            news.itemuid === fullNewsData.itemuid ? { ...news, read: true } : news
                        )
                    );
                }
                setExpandedRows({ [fullNewsData.itemuid]: true });
            }
        } else if (visible && !selectedNews) {
            setExpandedRows({});
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
        const isRowExpanded = expandedRows[rowData.itemuid] === true;

        if (isRowExpanded) {
            setExpandedRows({ ...expandedRows, [rowData.itemuid]: undefined });
        } else {
            setExpandedRows({ ...expandedRows, [rowData.itemuid]: true });

            if (!rowData.read) {
                isUpdatingFromClick.current = true;
                await markNewsAsRead(rowData.itemuid);
                setNewsData(
                    newsData.map((news) =>
                        news.itemuid === rowData.itemuid ? { ...news, read: true } : news
                    )
                );
            }
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
                text={news.title}
            />
        );
    };

    const newsDateTemplate = (news: News) => {
        return (
            <span
                className={`datatable-news__date datatable-news__date--${news.read ? "read" : "new"}`}
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
                dataKey='itemuid'
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
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
                <Column field='title' header='Title' body={newsDescriptionTemplate} />
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
