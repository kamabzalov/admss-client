import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { ContactUser, SalespersonsList } from "common/models/contact";
import { ComboBox } from "dashboard/common/form/dropdown";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { useLocation } from "react-router-dom";

enum DealGeneralSellerKeys {
    FIRST_SALES_PERSON_ID = "salesperson1uid",
    SECOND_SALES_PERSON_ID = "salesperson2uid",
    DIFFERENT_SELLER = "differentSeller",
    DIFFERENT_SELLER_INFO = "differentSellerInfo",
    DIFFERENT_SELLER_ID = "differentSellerUID",
}

export const DealGeneralSeller = observer((): ReactElement => {
    const store = useStore().dealStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const location = useLocation();
    const currentPath = location.pathname + location.search;
    const [salespersonList, setSalespersonList] = useState<SalespersonsList[]>([]);

    const {
        deal: { salesperson1uid, salesperson2uid, differentSeller, differentSellerInfo },
        changeDeal,
    } = store;

    const handleGetSalespersonList = async () => {
        const response = await getContactsSalesmanList(authUser!.useruid);
        if (response && Array.isArray(response)) {
            setSalespersonList(response);
        }
    };

    useEffect(() => {
        handleGetSalespersonList();
    }, [authUser]);

    const handleGetDifferentSellerInfo = (contact: ContactUser) => {
        const sellerInfo =
            contact.companyName ||
            contact.businessName ||
            `${contact.firstName} ${contact.lastName}`.trim() ||
            contact.userName;

        changeDeal({
            key: DealGeneralSellerKeys.DIFFERENT_SELLER_INFO,
            value: sellerInfo,
        });
        changeDeal({
            key: DealGeneralSellerKeys.DIFFERENT_SELLER_ID,
            value: contact.contactuid,
        });
    };

    return (
        <div className='grid deal-general-seller row-gap-2'>
            <div className='col-6'>
                <ComboBox
                    options={salespersonList}
                    optionLabel='username'
                    optionValue='useruid'
                    value={salesperson1uid}
                    onChange={(event) => {
                        changeDeal({
                            key: DealGeneralSellerKeys.FIRST_SALES_PERSON_ID,
                            value: event.target.value,
                        });
                    }}
                    label='Salesman 1'
                />
            </div>
            <div className='col-6'>
                <ComboBox
                    options={salespersonList}
                    optionLabel='username'
                    optionValue='useruid'
                    value={salesperson2uid}
                    onChange={(event) => {
                        changeDeal({
                            key: DealGeneralSellerKeys.SECOND_SALES_PERSON_ID,
                            value: event.target.value,
                        });
                    }}
                    label='Salesman 2'
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
                <div className='col-6 relative'>
                    <CompanySearch
                        originalPath={currentPath}
                        value={differentSellerInfo}
                        onChange={({ value }) => {
                            const sellerInfo = String(value || "");
                            changeDeal({
                                key: DealGeneralSellerKeys.DIFFERENT_SELLER_INFO,
                                value: sellerInfo,
                            });
                        }}
                        onBlur={(event: any) => {
                            const sellerInfo = String(event?.target?.value || "");
                            changeDeal({
                                key: DealGeneralSellerKeys.DIFFERENT_SELLER_INFO,
                                value: sellerInfo,
                            });
                        }}
                        getFullInfo={handleGetDifferentSellerInfo}
                        name='Seller'
                    />
                </div>
            )}
        </div>
    );
});
