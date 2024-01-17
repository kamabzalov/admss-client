/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { AxiosResponse } from "axios";
import { BaseResponse } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

interface ExtData {
    bgAsIs: number;
    bgDuration: string;
    bgFullWarranty: number;
    bgLimitedWarranty: number;
    bgPercLabor: string;
    bgPercParts: string;
    bgServiceContract: number;
    bgSystemsCovered: string;
    bgWarranty: number;
    chkAutocheckChecked: number;
    chkCustom0: number;
    chkCustom1: number;
    chkCustom2: number;
    chkCustom3: number;
    chkCustom4: number;
    chkCustom5: number;
    chkCustom6: number;
    chkCustom7: number;
    chkCustom8: number;
    chkCustom9: number;
    chkInspected: number;
    chkOil: number;
    created: string;
    csConsigorID: string;
    csDate: number;
    csEarlyRemoval: number;
    csFee: number;
    csIsConsigned: number;
    csListingFee: number;
    csName: string;
    csNetToOwner: string;
    csNotes: string;
    csNumDays: number;
    csOwnerAskingPrice: number;
    csReserveAmt: number;
    csReserveFactor: number;
    csReturnDate: number;
    csReturned: number;
    dam25: number;
    dam25Parts: string;
    damFlood: number;
    damODOMInExcess: number;
    damODOMNotActual: number;
    damReconstructed: number;
    damSalvage: number;
    damSalvageState: string;
    damTheft: number;
    damTheftParts: string;
    fpFloorplanCompany: string;
    fpIsFloorplanned: number;
    fpPayoffBy: number;
    fpReductionDate: number;
    fpReduxAmt: number;
    fpRemainBal: number;
    inspDate: number;
    inspEmissions: number;
    inspNumber: string;
    inspSafety: number;
    inspStickerExp: number;
    inventoryuid: string;
    itemuid: string;
    keyNumber: string;
    keysDuplicate: number;
    keysHasRemote: number;
    keysMissing: number;
    payAPR: number;
    payAmtFin: number;
    payAskingPrice: number;
    payBookBaseValue: number;
    payBookMilesAdd: number;
    payBookValue: string;
    payCashPrice: number;
    payDateSold: number;
    payDefaultExpAdded: number;
    payDownPayment: number;
    payExpenses: string;
    payMiscNote: string;
    payPPY: number;
    payPack: number;
    payPaid: number;
    payPayment: number;
    payPaymentDevice: string;
    payPaymentDeviceID: string;
    payPurchaseState: string;
    payRemarks: string;
    paySalesTaxPaid: number;
    paySold: number;
    payStateOfLastReg: string;
    payTerm: number;
    payWSNotes: string;
    purLotNo: number;
    purPurchaseAddress: string;
    purPurchaseAmount: number;
    purPurchaseAuctCo: string;
    purPurchaseBuyer: number;
    purPurchaseBuyerComm: number;
    purPurchaseBuyerName: string;
    purPurchaseBuyerPercent: number;
    purPurchaseCheck: string;
    purPurchaseCheckDate: number;
    purPurchaseCheckMemo: string;
    purPurchaseCity: string;
    purPurchaseDate: number;
    purPurchasePhone: string;
    purPurchaseZipCode: string;
    purPurchasedFrom: string;
    purSoldByLot: number;
    titleHolderAddress: string;
    titleHolderName: string;
    titleHolderPayoff: string;
    titleHolderPhone: string;
    titleIsTradeIn: number;
    titleNumber: string;
    titlePrevAddress: string;
    titlePrevName: string;
    titlePrevPhone: string;
    titleReceived: number;
    titleReceivedDate: number;
    titleState: string;
    titleStatus: number;
    updated: string;
    useruid: string;
}

interface OptionsInfo {
    [key: string]: string;
}

export interface Inventory {
    BodyStyle: string;
    Category: string;
    Cylinders: string;
    DriveLine: string;
    Engine: string;
    ExteriorColor: string;
    GroupClass: number;
    GroupClassName: string;
    InteriorColor: string;
    Make: string;
    Model: string;
    Notes: string;
    Options: number;
    Status: string;
    StockNo: string;
    Transmission: string;
    TypeOfFuel: string;
    VIN: string;
    VINimageUID: string;
    Year: string;
    created: string;
    extdata: ExtData;
    itemuid: string;
    mileage: number;
    name: string;
    options_info: string[];
    status: string;
    updated: string;
    useruid: string;
}

export const initialInventoryState: Inventory = {
    BodyStyle: "",
    Category: "",
    Cylinders: "",
    DriveLine: "",
    Engine: "",
    ExteriorColor: "",
    GroupClass: 0,
    GroupClassName: "",
    InteriorColor: "",
    Make: "",
    Model: "",
    Notes: "",
    Options: 0,
    Status: "",
    StockNo: "",
    Transmission: "",
    TypeOfFuel: "",
    VIN: "",
    VINimageUID: "",
    Year: "",
    created: "",
    extdata: {} as ExtData,
    itemuid: "",
    mileage: 0,
    name: "",
    options_info: [],
    status: "",
    updated: "",
    useruid: "",
};

export interface TotalInventoryList extends BaseResponse {
    total: number;
}

type EndpointType =
    | "options"
    | "bodytypes"
    | "exteriorcolors"
    | "interiorcolors"
    | "cylinders"
    | "driveline"
    | "engine"
    | "expensetypes"
    | "fueltypes"
    | "transmissiontypes"
    | "automakes"
    | "category"
    | "status"
    | "group";

export const getInventoryList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<Inventory[] | TotalInventoryList>(
            `inventory/${uid}/list`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getInventoryInfo = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<Inventory>(`inventory/${uid}/info`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const fetchInventoryList = async <T>(endpoint: EndpointType): Promise<T | undefined> => {
    try {
        const response: AxiosResponse<T> = await authorizedUserApiInstance.get(
            `inventory/list/constants/${endpoint}`
        );
        return response.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export type ListData = {
    index?: number;
    name: string;
};

export type MakesListData = ListData & { logo: string };

export const getInventoryOptionsList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("options");
export const getInventoryBodyTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("bodytypes");
export const getInventoryExteriorColorsList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("exteriorcolors");
export const getInventoryInteriorColorsList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("interiorcolors");
export const getInventoryCylindersList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("cylinders");
export const getInventoryDrivelineList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("driveline");
export const getInventoryEngineList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("engine");
export const getInventoryExpenseTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("expensetypes");
export const getInventoryFuelTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("fueltypes");
export const getInventoryTransmissionTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("transmissiontypes");
export const getInventoryAutomakesList = async (): Promise<MakesListData[] | undefined> =>
    await fetchInventoryList<MakesListData[]>("automakes");
export const getInventoryCategoryList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("category");
export const getInventoryStatusList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("status");
export const getInventoryGroupList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("group");
