import { Contact, ContactExtData } from "common/models/contact";

export type PartialContact = Pick<
    Contact,
    | "firstName"
    | "middleName"
    | "lastName"
    | "type"
    | "businessName"
    | "email1"
    | "email2"
    | "phone1"
    | "phone2"
> &
    Pick<
        ContactExtData,
        | "CoBuyer_First_Name"
        | "CoBuyer_Middle_Name"
        | "CoBuyer_Last_Name"
        | "Buyer_Emp_Ext"
        | "Buyer_Emp_Phone"
        | "Buyer_SS_Number"
        | "CoBuyer_SS_Number"
    >;
