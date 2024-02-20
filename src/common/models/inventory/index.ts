import { BaseResponse, Status } from "../base-response";

export interface InventoryExtData {
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
    inspDate: string;
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

export interface InventoryWebInfo {
    CityMPG: string;
    CostPrice: number;
    DealerComments: string;
    ExtraField1: string;
    ExtraField2: string;
    ExtraField3: string;
    ExtraPrice1: number;
    ExtraPrice2: number;
    ExtraPrice3: number;
    HwyMPG: string;
    InStockDate: number;
    LastExportDate: number;
    LastModifiedDate: number;
    ListPrice: number;
    ModelCode: string;
    PhotoURL: string;
    SpecialPrice: number;
    VDPLink: string;
    VideoURL: string;
    created: number;
    deleted: number;
    enabled: number;
    itemuid: string;
    status: Status;
    updated: number;
    useruid: string;
}

export interface InventorySetResponse extends BaseResponse {
    itemuid: string;
}

export interface CreateMediaItemRecordResponse extends BaseResponse {
    itemUID: string;
}

export type InventoryOptionsInfo =
    | "A/C"
    | "Automatic Climate Control"
    | "Anti-Lock Brakes"
    | "Anti-Theft System"
    | "Anti-Skid Control"
    | "All Wheel Drive"
    | "Aluminum Alloy Wheels"
    | "AM/FM Stereo"
    | "tConvertable Top"
    | "Cruise Control"
    | "Cassette Player"
    | "CD Changer"
    | "Fog Lights"
    | "Four Wheel Drive"
    | "Leather Upholstry"
    | "Luggage Rack"
    | "MoonRoof"
    | "Navigation System"
    | "Overhead Console"
    | "Power Door Locks"
    | "Power Seats"
    | "Power Steering"
    | "Power Windows"
    | "Remote Keyless Entry"
    | "Rear Window Wiper"
    | "Rear Window Defogger"
    | "Sun Roof"
    | "Sunscreen Glass"
    | "Tinted Windows"
    | "Android Auto"
    | "Apple Car Play";

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
    extdata?: InventoryExtData;
    itemuid: string;
    mileage: number;
    name: string;
    options_info?: InventoryOptionsInfo[];
    status: string;
    updated: string;
    useruid: string;
}

export interface TotalInventoryList extends BaseResponse {
    total: number;
}

export type EndpointType =
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

export interface InventoryMediaItemID {
    itemuid: string;
    mediauid: string;
    inventoryuid: string;
}

export interface InventoryMedia extends InventoryMediaItemID {
    contenttype: number;
    created: string;
    index: number;
    notes: string;
    type: number;
    updated: string;
    useruid: string;
}

export interface MediaLimitations {
    formats: string[];
    codecs?: string;
    minResolution?: string;
    prefResolution?: string;
    maxResolution?: string;
    maxDuration?: number;
    maxSize: number;
    maxUpload: number;
}

export interface InventoryExportWebHistory {
    created: string;
    id: number;
    info: string;
    inventoryuid: string;
    listprice: string;
    servicetype: string;
    specialprice: string;
    taskstatus: string;
    tasktype: string;
    taskuid: string;
    useruid: string;
}
