export interface Account {
    accountnumber: string;
    accountstatus: string;
    accounttype: string;
    accountuid: string;
    contactuid: string;
    created: string;
    dateclosing: string;
    dateeffective: string;
    datesold: string;
    dealuid: string;
    downpayment: string;
    index: number;
    inventoryuid: string;
    isactive: number;
    isdeleted: number;
    itemuid: string;
    name: string;
    notes: string;
    startingballance: string;
    updated: string;
    useruid: string;
}

export interface AccountPayment {
    status: string;
    error: string;
    info: string;
    message: string;
    index: number;
    extindex: number;
    deleted: number;
    useruid: string;
    ACCT_NUM: string;
    Date: number;
    PTPDate: number;
    NoteBy: string;
    Status: number;
    Amount: number;
    Note: string;
    created: number;
    updated: number;
    itemuid: string;
    accountuid: string;
}
