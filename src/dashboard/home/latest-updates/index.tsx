import { News } from "common/models/tasks";
import { TotalListCount } from "common/models/base-response";
import { getLatestNews } from "http/services/tasks.service";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import "./index.css";
import { TruncatedText } from "dashboard/common/display";
import { DateReturnType, parseDateFromServer } from "common/helpers";
import { LatestUpdatesDialog } from "./latest-updates-dialog";

export const MAX_NEWS_COUNT_ON_PAGE = 10;
const DEFAULT_MESSAGES_SHOW_COUNT = 4;

interface LatestUpdatesProps {
    messagesShowCount?: number;
}

export const LatestUpdates = ({
    messagesShowCount = DEFAULT_MESSAGES_SHOW_COUNT,
}: LatestUpdatesProps): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const [dialogActive, setDialogActive] = useState<boolean>(false);
    const [newsData, setNewsData] = useState<News[]>([]);
    const [allNewsCount, setAllNewsCount] = useState<number>(0);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);

    const handleGetLatestNews = async () => {
        if (!authUser) return;
        const [totalCountResponse, newsResponse] = await Promise.all([
            getLatestNews(authUser!.useruid, { total: 1 }),
            getLatestNews(authUser!.useruid, { top: messagesShowCount }),
        ]);

        if (totalCountResponse && !Array.isArray(totalCountResponse)) {
            setAllNewsCount((totalCountResponse as TotalListCount).total ?? 0);
        }

        if (newsResponse && Array.isArray(newsResponse)) {
            setNewsData(newsResponse as News[]);
        }
    };

    useEffect(() => {
        handleGetLatestNews();
    }, [authUser]);

    const handleNewsClick = (news: News) => {
        setSelectedNews(news);
        setDialogActive(true);
    };

    const handleSeeMoreClick = () => {
        setSelectedNews(null);
        setDialogActive(true);
    };

    const handleDialogHide = () => {
        setDialogActive(false);
        setSelectedNews(null);
        handleGetLatestNews();
    };

    return (
        <section className='card h-full latest-updates'>
            <div className='card-header latest-updates__header'>
                <h2 className='card-header__title uppercase m-0'>Latest updates</h2>
            </div>
            <div className='card-content latest-updates__content'>
                <ul className='latest-updates__list'>
                    {newsData.slice(0, messagesShowCount).map((news) => (
                        <li
                            className={`latest-updates__item ${news.read ? "" : "latest-updates__item--new"}`}
                            key={news.itemuid}
                            onClick={() => handleNewsClick(news)}
                        >
                            <span className='latest-updates__item-description'>
                                <TruncatedText withTooltip text={news.title} />
                            </span>
                            <span className='latest-updates__item-created'>
                                {parseDateFromServer(news.created, {
                                    returnType: DateReturnType.DATE,
                                })}
                            </span>
                        </li>
                    ))}
                </ul>
                {allNewsCount > messagesShowCount && (
                    <div className='card-content__footer latest-updates__footer'>
                        <Button
                            onClick={handleSeeMoreClick}
                            className='messages-more latest-updates__button'
                            text
                        >
                            See more...
                        </Button>
                    </div>
                )}
            </div>
            {dialogActive && (
                <LatestUpdatesDialog
                    onHide={handleDialogHide}
                    visible={dialogActive}
                    totalCount={allNewsCount}
                    selectedNews={selectedNews}
                />
            )}
        </section>
    );
};
