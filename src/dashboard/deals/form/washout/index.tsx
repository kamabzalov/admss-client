import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement, useEffect } from "react";
import { Button } from "primereact/button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "store/hooks";
import "./index.css";
import { observer } from "mobx-react-lite";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { DealProfit } from "dashboard/deals/form/washout/deal-profit";
import { InterestProfit } from "dashboard/deals/form/washout/interest-profit";
import { setDealWashout } from "http/services/deals.service";
import { BUTTON_VARIANTS, ControlButton } from "dashboard/common/button";
import { DEALS_PAGE } from "common/constants/links";
import { Loader } from "dashboard/common/loader";

export enum DealWashoutTabs {
    DEAL_PROFIT = "deal-profit",
    INTEREST_PROFIT = "interest-profit",
}

const EMPTY_INFO_MESSAGE = "N/A";
const CREATE_DEAL_ID = "create";

export const DealWashout = observer((): ReactElement | null => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const store = useStore().dealStore;
    const toast = useToast();
    const { inventory, getDeal, getDealWashout } = store;

    useEffect(() => {
        if (!id || id === CREATE_DEAL_ID) {
            navigate(DEALS_PAGE.CREATE());
            return;
        }

        getDeal(id);
        getDealWashout(id);
    }, [id]);

    if (!id || id === CREATE_DEAL_ID) {
        return null;
    }

    const tabParam = searchParams.get("tab") || DealWashoutTabs.DEAL_PROFIT;

    const activeIndex = (() => {
        switch (tabParam) {
            case DealWashoutTabs.INTEREST_PROFIT:
                return 1;
            case DealWashoutTabs.DEAL_PROFIT:
                return 0;
            default:
                return 0;
        }
    })();

    const handleTabChange = (e: { index: number }) => {
        let newTab: DealWashoutTabs;
        switch (e.index) {
            case 0:
                newTab = DealWashoutTabs.DEAL_PROFIT;
                break;
            case 1:
                newTab = DealWashoutTabs.INTEREST_PROFIT;
                break;
            default:
                newTab = DealWashoutTabs.DEAL_PROFIT;
        }

        setSearchParams({ tab: newTab });
    };

    useEffect(() => {
        const validTabs = Object.values(DealWashoutTabs);
        if (!validTabs.includes(tabParam as DealWashoutTabs)) {
            setSearchParams({ tab: DealWashoutTabs.DEAL_PROFIT });
        }
    }, [tabParam, setSearchParams]);

    const handleSaveWashout = async () => {
        if (!id) return;
        const response = await setDealWashout(id, store.dealWashout);
        if (!response?.error) {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Washout saved",
                life: TOAST_LIFETIME,
            });
            navigate(DEALS_PAGE.EDIT(id));
        } else {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Error on save washout",
                life: TOAST_LIFETIME,
            });
        }
    };

    const handlePrint = () => {};

    const handleDownload = () => {};

    return (
        <div className='grid relative deal-washout'>
            {store.isLoading && <Loader overlay />}
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={() => navigate(DEALS_PAGE.EDIT(id))}
            />
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header flex'>
                        <h2 className='card-header__title uppercase m-0'>Deal Washout</h2>
                        {id && (
                            <div className='card-header-info'>
                                Stock#
                                <span className='card-header-info__data'>
                                    {inventory?.StockNo || EMPTY_INFO_MESSAGE}
                                </span>
                                Make
                                <span className='card-header-info__data'>
                                    {inventory?.Make || EMPTY_INFO_MESSAGE}
                                </span>
                                Model
                                <span className='card-header-info__data'>
                                    {inventory?.Model || EMPTY_INFO_MESSAGE}
                                </span>
                                Year
                                <span className='card-header-info__data'>
                                    {inventory?.Year || EMPTY_INFO_MESSAGE}
                                </span>
                                VIN
                                <span className='card-header-info__data'>{inventory?.VIN}</span>
                            </div>
                        )}
                    </div>
                    <div className='card-content deal-washout__card grid'>
                        <TabView
                            className='deal-washout__tabs'
                            activeIndex={activeIndex}
                            onTabChange={handleTabChange}
                        >
                            <TabPanel
                                header='Deal Profit'
                                headerClassName='deal-washout__tab-header'
                            >
                                <DealProfit />
                            </TabPanel>
                            <TabPanel
                                header='Interest Profit'
                                headerClassName='deal-washout__tab-header'
                            >
                                <InterestProfit />
                            </TabPanel>
                        </TabView>
                    </div>
                    <div className='deal-washout__footer washout-footer form-nav'>
                        <div className='washout-footer__controls'>
                            <ControlButton
                                variant={BUTTON_VARIANTS.PRINT}
                                tooltip='Print'
                                onClick={handlePrint}
                            />
                            <ControlButton
                                variant={BUTTON_VARIANTS.DOWNLOAD}
                                tooltip='Download'
                                onClick={handleDownload}
                            />
                        </div>
                        <div className='washout-footer__buttons'>
                            <Button
                                className='uppercase px-6 form-nav__button deal-washout__button'
                                onClick={() => navigate(-1)}
                                severity='danger'
                                outlined
                            >
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                onClick={handleSaveWashout}
                                severity='success'
                                className='uppercase px-6 form-nav__button deal-washout__button'
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
