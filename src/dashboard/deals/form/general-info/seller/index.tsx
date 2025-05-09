import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { Contact, ContactTypeNameList, ContactUser } from "common/models/contact";
import { Deal } from "common/models/deals";
import { getContactInfo } from "http/services/contacts-service";
import { Status } from "common/models/base-response";

enum DealGeneralSellerKeys {
    FIRST_SALES_PERSON = "salesperson1uid",
    SECOND_SALES_PERSON = "salesperson2uid",
    DIFFERENT_SELLER = "differentSellerUID",
}

export const DealGeneralSeller = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        deal: { salesperson1uid, salesperson2uid, differentSeller, differentSellerUID },
        changeDeal,
    } = store;

    const [firstSalespersonName, setFirstSalespersonName] = useState<string>("");
    const [secondSalespersonName, setSecondSalespersonName] = useState<string>("");
    const [differentSellerName, setDifferentSellerName] = useState<string>("");

    const handleGetContactInfo = async (uid: string, key: keyof Deal) => {
        const response = await getContactInfo(uid);
        if (response?.status !== Status.ERROR) {
            const contact = response as Contact;
            if (key === DealGeneralSellerKeys.FIRST_SALES_PERSON) {
                setFirstSalespersonName(contact.userName);
            } else if (key === DealGeneralSellerKeys.SECOND_SALES_PERSON) {
                setSecondSalespersonName(contact.userName);
            } else if (key === DealGeneralSellerKeys.DIFFERENT_SELLER) {
                setDifferentSellerName(contact.userName);
            }
        }
    };

    useEffect(() => {
        if (salesperson1uid) {
            handleGetContactInfo(salesperson1uid, DealGeneralSellerKeys.FIRST_SALES_PERSON);
        }
        if (salesperson2uid) {
            handleGetContactInfo(salesperson2uid, DealGeneralSellerKeys.SECOND_SALES_PERSON);
        }
        if (differentSellerUID) {
            handleGetContactInfo(differentSellerUID, DealGeneralSellerKeys.DIFFERENT_SELLER);
        }
    }, []);

    const handleGetFullInfo = (contact: ContactUser, key: keyof Deal) => {
        changeDeal({
            key,
            value: contact.contactuid,
        });

        if (key === DealGeneralSellerKeys.FIRST_SALES_PERSON) {
            setFirstSalespersonName(contact.userName);
        } else if (key === DealGeneralSellerKeys.SECOND_SALES_PERSON) {
            setSecondSalespersonName(contact.userName);
        } else if (key === DealGeneralSellerKeys.DIFFERENT_SELLER) {
            setDifferentSellerName(contact.userName);
        }
    };

    return (
        <div className='grid deal-general-seller row-gap-2'>
            <div className='col-6'>
                <CompanySearch
                    value={firstSalespersonName}
                    onChange={(event) => {
                        setFirstSalespersonName(event.target.value);
                        if (!event.target.value) {
                            changeDeal({
                                key: DealGeneralSellerKeys.FIRST_SALES_PERSON,
                                value: "",
                            });
                        }
                    }}
                    onChangeGetFullInfo={(value) =>
                        handleGetFullInfo(value, DealGeneralSellerKeys.FIRST_SALES_PERSON)
                    }
                    getFullInfo={(contact) =>
                        handleGetFullInfo(contact, DealGeneralSellerKeys.FIRST_SALES_PERSON)
                    }
                    name='Salesman 1'
                />
            </div>
            <div className='col-6'>
                <CompanySearch
                    value={secondSalespersonName}
                    onChange={(event) => {
                        setSecondSalespersonName(event.target.value);
                        if (!event.target.value) {
                            changeDeal({
                                key: DealGeneralSellerKeys.SECOND_SALES_PERSON,
                                value: "",
                            });
                        }
                    }}
                    onChangeGetFullInfo={(value) =>
                        handleGetFullInfo(value, DealGeneralSellerKeys.SECOND_SALES_PERSON)
                    }
                    getFullInfo={(contact) =>
                        handleGetFullInfo(contact, DealGeneralSellerKeys.SECOND_SALES_PERSON)
                    }
                    name='Salesman 2'
                />
            </div>

            <hr className='col-12 form-line' />

            <div className='col-3'>
                <BorderedCheckbox
                    checked={!!differentSeller}
                    onChange={() =>
                        changeDeal({
                            key: DealGeneralSellerKeys.DIFFERENT_SELLER,
                            value: !differentSeller ? 1 : 0,
                        })
                    }
                    name='Different seller'
                />
            </div>
            {!!differentSeller && (
                <div className='col-6'>
                    <CompanySearch
                        name='Seller'
                        value={differentSellerName}
                        onChangeGetFullInfo={(value) =>
                            handleGetFullInfo(value, DealGeneralSellerKeys.DIFFERENT_SELLER)
                        }
                        getFullInfo={(contact) =>
                            handleGetFullInfo(contact, DealGeneralSellerKeys.DIFFERENT_SELLER)
                        }
                        contactCategory={ContactTypeNameList.DEALERS}
                    />
                </div>
            )}
        </div>
    );
});
