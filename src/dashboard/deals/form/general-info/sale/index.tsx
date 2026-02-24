import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import { TextInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import {
    getDealInventoryStatuses,
    getDealStatuses,
    getDealTypes,
    getHowToKnowList,
    getSaleTypes,
} from "http/services/deals.service";
import { HowToKnow, IndexedDealList } from "common/models/deals";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { InventorySearch } from "dashboard/inventory/common/inventory-search";
import { useFormikContext } from "formik";
import { PartialDeal } from "dashboard/deals/form";
import { ContactUser } from "common/models/contact";
import { Inventory } from "common/models/inventory";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ComboBox } from "dashboard/common/form/dropdown";
import { Button } from "primereact/button";
import { parseDateFromServer } from "common/helpers";
import { DEALS_PAGE } from "common/constants/links";
import { useToastMessage, usePermissions } from "common/hooks";

export const DealGeneralSale = observer((): ReactElement => {
    const { values, errors, setFieldValue, getFieldProps } = useFormikContext<PartialDeal>();
    const { id } = useParams();
    const store = useStore().dealStore;
    const userStore = useStore().userStore;
    const { showError } = useToastMessage();
    const { dealPermissions } = usePermissions();
    const location = useLocation();
    const currentPath = location.pathname + location.search;
    const navigate = useNavigate();
    const { authUser } = userStore;
    const { deal, changeDeal, changeDealExtData } = store;

    const [dealTypesList, setDealTypesList] = useState<IndexedDealList[]>([]);
    const [saleTypesList, setSaleTypesList] = useState<IndexedDealList[]>([]);
    const [dealStatusesList, setDealStatusesList] = useState<IndexedDealList[]>([]);
    const [howToKnowList, setHowToKnowList] = useState<Partial<HowToKnow[]>>([]);
    const [inventoryStatusesList, setInventoryStatusesList] = useState<IndexedDealList[]>([]);

    useEffect(() => {
        const fetchDealData = async () => {
            const dealTypesRes = await getDealTypes();
            if (dealTypesRes && Array.isArray(dealTypesRes)) {
                setDealTypesList(dealTypesRes);
            } else if (!dealTypesRes) {
                showError("Error while getting deal types");
            }

            const saleTypesRes = await getSaleTypes();
            if (saleTypesRes && Array.isArray(saleTypesRes)) {
                setSaleTypesList(saleTypesRes);
            } else if (!saleTypesRes) {
                showError("Error while getting sale types");
            }

            const dealStatusesRes = await getDealStatuses();
            if (dealStatusesRes && Array.isArray(dealStatusesRes)) {
                let filteredStatuses = dealStatusesRes;
                if (!dealPermissions.canUsePaymentQuote()) {
                    filteredStatuses = dealStatusesRes.filter((status) => status.id !== 0);
                }
                setDealStatusesList(filteredStatuses);
            } else if (!dealStatusesRes) {
                showError("Error while getting deal statuses");
            }

            const inventoryStatusesRes = await getDealInventoryStatuses();
            if (inventoryStatusesRes && Array.isArray(inventoryStatusesRes)) {
                setInventoryStatusesList(inventoryStatusesRes);
            } else if (!inventoryStatusesRes) {
                showError("Error while getting inventory statuses");
            }
        };

        fetchDealData();
    }, []);

    useEffect(() => {
        const fetchHowToKnowList = async () => {
            if (authUser?.useruid) {
                const res = await getHowToKnowList(authUser.useruid);
                if (Array.isArray(res) && res.length) {
                    setHowToKnowList(res);
                }
            }
        };

        fetchHowToKnowList();
    }, [authUser]);

    const handleGetCompanyInfo = (contact: ContactUser) => {
        setFieldValue(
            "contactinfo",
            contact.companyName ||
                contact.businessName ||
                `${contact.firstName} ${contact.lastName}`.trim() ||
                contact.userName
        );
        changeDeal({
            key: "contactinfo",
            value:
                contact.companyName ||
                contact.businessName ||
                `${contact.firstName} ${contact.lastName}`.trim() ||
                contact.userName,
        });
        changeDeal({
            key: "contactuid",
            value: contact.contactuid,
        });
    };

    const handleGetInventoryInfo = (inventory: Inventory) => {
        setFieldValue("inventoryinfo", inventory.name || inventory.Make);
        changeDeal({
            key: "inventoryinfo",
            value: inventory.name || inventory.Make,
        });
        changeDeal({
            key: "inventoryuid",
            value: inventory.itemuid,
        });
    };

    return (
        <section className='grid deal-general-sale row-gap-2'>
            {id && dealPermissions.canEditWashout() && (
                <div className='col-12 flex justify-content-end'>
                    <Button
                        className='deal-sale__washout-button'
                        outlined
                        label={"Washout"}
                        onClick={() => {
                            navigate(DEALS_PAGE.WASHOUT(id));
                        }}
                    />
                </div>
            )}
            <div className='col-6 relative'>
                <CompanySearch
                    {...getFieldProps("contactinfo")}
                    onChange={({ target: { value } }) => {
                        setFieldValue("contactinfo", value);
                        changeDeal({ key: "contactinfo", value });
                    }}
                    originalPath={currentPath}
                    value={values?.contactinfo}
                    getFullInfo={handleGetCompanyInfo}
                    name='Buyer Name (required)'
                    className={errors.contactinfo ? "p-invalid" : ""}
                    error={!!errors.contactinfo}
                    errorMessage={errors.contactinfo as string}
                />
            </div>
            <div className='col-6 relative'>
                <InventorySearch
                    {...getFieldProps("inventoryinfo")}
                    className={errors.inventoryinfo ? "p-invalid" : ""}
                    onChange={({ target: { value } }) => {
                        setFieldValue("inventoryinfo", value);
                        changeDeal({ key: "inventoryinfo", value });
                    }}
                    originalPath={currentPath}
                    value={values?.inventoryinfo}
                    getFullInfo={handleGetInventoryInfo}
                    name='Vehicle (required)'
                    error={!!errors.inventoryinfo}
                    errorMessage={errors.inventoryinfo as string}
                />
            </div>
            <div className='col-6 relative'>
                <ComboBox
                    {...getFieldProps("dealtype")}
                    optionLabel='name'
                    optionValue='id'
                    required
                    options={dealTypesList}
                    label='Type of Deal (required)'
                    value={values.dealtype}
                    onChange={(e) => {
                        setFieldValue("dealtype", e.value);
                        store.dealType = e.value;
                        changeDeal({ key: "dealtype", value: e.value });
                    }}
                    className='w-full deal-sale__dropdown'
                    error={!!errors.dealtype}
                    errorMessage={errors.dealtype as string}
                />
            </div>
            <div className='col-3 relative'>
                <ComboBox
                    {...getFieldProps("dealstatus")}
                    optionLabel='name'
                    optionValue='id'
                    value={values.dealstatus}
                    onChange={(e) => {
                        setFieldValue("dealstatus", e.value);
                        changeDeal({ key: "dealstatus", value: e.value });
                    }}
                    options={dealStatusesList}
                    required
                    className='w-full deal-sale__dropdown'
                    label='Sale status (required)'
                    error={!!errors.dealstatus}
                    errorMessage={errors.dealstatus as string}
                />
            </div>
            <div className='col-3 relative'>
                <ComboBox
                    {...getFieldProps("saletype")}
                    optionLabel='name'
                    optionValue='id'
                    required
                    options={saleTypesList}
                    value={values.saletype}
                    onChange={(e) => {
                        setFieldValue("saletype", e.value);
                        changeDeal({ key: "saletype", value: e.value });
                    }}
                    label='Sale type (required)'
                    className='w-full deal-sale__dropdown'
                    error={!!errors.saletype}
                    errorMessage={errors.saletype as string}
                />
            </div>
            <div className='col-3 relative'>
                <DateInput
                    {...getFieldProps("dateeffective")}
                    className={errors.dateeffective ? "p-invalid" : ""}
                    name='Sale date (required)'
                    date={parseDateFromServer(values.dateeffective)}
                    emptyDate
                    error={!!errors.dateeffective}
                    errorMessage={errors.dateeffective as string}
                    onChange={({ value }) => {
                        setFieldValue("dateeffective", value);
                        changeDeal({ key: "dateeffective", value: Number(value) });
                    }}
                />
            </div>
            <div className='col-3 relative'>
                <DateInput
                    {...getFieldProps("datepurchase")}
                    className={errors.datepurchase ? "p-invalid" : ""}
                    name='First operated (required)'
                    date={parseDateFromServer(values.datepurchase)}
                    emptyDate
                    error={!!errors.datepurchase}
                    errorMessage={errors.datepurchase as string}
                    onChange={({ value }) => {
                        setFieldValue("datepurchase", value);
                        changeDeal({ key: "datepurchase", value: Number(value) });
                    }}
                />
            </div>
            <div className='col-3 relative'>
                <ComboBox
                    {...getFieldProps("inventorystatus")}
                    optionLabel='name'
                    optionValue='id'
                    value={
                        values.inventorystatus !== undefined ? Number(values.inventorystatus) : null
                    }
                    options={inventoryStatusesList}
                    onChange={(e) => {
                        setFieldValue("inventorystatus", e.value);
                        changeDeal({ key: "inventorystatus", value: e.value });
                    }}
                    required
                    className='w-full deal-sale__dropdown'
                    label='New or Used (req.)'
                    error={!!errors.inventorystatus}
                    errorMessage={errors.inventorystatus as string}
                />
            </div>

            <div className='col-12 text-line'>
                <h3 className='text-line__title m-0 pr-3'>Vehicle payments tracking</h3>
                <hr className='text-line__line flex-1' />
            </div>

            <div className='col-3'>
                <DateInput
                    name='Warn Overdue After X Days'
                    date={deal.warnOverdueDays}
                    emptyDate
                    onChange={({ value }) =>
                        changeDeal({ key: "warnOverdueDays", value: Number(value) })
                    }
                />
            </div>
            <div className='col-3 relative'>
                <TextInput
                    label='Account number'
                    {...getFieldProps("accountInfo")}
                    className='w-full deal-sale__text-input'
                    disabled={!!id}
                    value={deal.accountInfo || ""}
                    onChange={({ target: { value } }) => {
                        if (id) return;
                        setFieldValue("accountInfo", value);
                        changeDeal({ key: "accountInfo", value });
                    }}
                />
            </div>

            <hr className='col-12 form-line' />

            <div className='col-6 relative'>
                <ComboBox
                    {...getFieldProps("HowFoundOut")}
                    required
                    optionLabel='description'
                    optionValue='itemuid'
                    options={howToKnowList}
                    value={values.HowFoundOut}
                    onChange={(e) => {
                        setFieldValue("HowFoundOut", e.value);
                        changeDealExtData({ key: "HowFoundOut", value: e.value });
                    }}
                    editable
                    className='w-full deal-sale__dropdown'
                    label='How did you hear about us? (required)'
                    error={!!errors.HowFoundOut}
                    errorMessage={errors.HowFoundOut as string}
                />
            </div>
            <div className='col-3 relative'>
                <TextInput
                    label='ROS SaleID (required)'
                    {...getFieldProps("SaleID")}
                    className='deal-sale__text-input w-full'
                    value={values.SaleID}
                    error={!!errors.SaleID}
                    errorMessage={errors.SaleID}
                    onChange={(e) => {
                        setFieldValue("SaleID", e.target.value);
                        changeDealExtData({ key: "SaleID", value: e.target.value });
                    }}
                />
            </div>
        </section>
    );
});
