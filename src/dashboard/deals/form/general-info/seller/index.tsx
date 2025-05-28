import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { SalespersonsList } from "common/models/contact";
import { Deal } from "common/models/deals";
import { SalespersonSearch } from "dashboard/contacts/common/salesperson-search";

enum DealGeneralSellerKeys {
    FIRST_SALES_PERSON_ID = "salesperson1uid",
    FIRST_SALES_PERSON_NAME = "salesperson1name",
    SECOND_SALES_PERSON_ID = "salesperson2uid",
    SECOND_SALES_PERSON_NAME = "salesperson2name",
    DIFFERENT_SELLER = "differentSeller",
    DIFFERENT_SELLER_ID = "differentSellerUID",
    DIFFERENT_SELLER_NAME = "differentSellerInfo",
}

export const DealGeneralSeller = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        deal: { salesperson1name, salesperson2name, differentSeller, differentSellerInfo },
        changeDeal,
    } = store;

    const handleGetFullInfo = (contact: SalespersonsList, key: keyof Deal) => {
        changeDeal({
            key,
            value: contact.useruid,
        });
        switch (key) {
            case DealGeneralSellerKeys.FIRST_SALES_PERSON_ID:
                changeDeal({
                    key: DealGeneralSellerKeys.FIRST_SALES_PERSON_NAME,
                    value: contact.username,
                });
                break;
            case DealGeneralSellerKeys.SECOND_SALES_PERSON_ID:
                changeDeal({
                    key: DealGeneralSellerKeys.SECOND_SALES_PERSON_NAME,
                    value: contact.username,
                });
                break;
            case DealGeneralSellerKeys.DIFFERENT_SELLER_ID:
                changeDeal({
                    key: DealGeneralSellerKeys.DIFFERENT_SELLER_NAME,
                    value: contact.username,
                });
                break;
        }
    };

    return (
        <div className='grid deal-general-seller row-gap-2'>
            <div className='col-6'>
                <SalespersonSearch
                    value={salesperson1name}
                    onChange={(event) => {
                        changeDeal({
                            key: DealGeneralSellerKeys.FIRST_SALES_PERSON_ID,
                            value: event.target.value,
                        });
                    }}
                    onChangeGetFullInfo={(value) => {
                        handleGetFullInfo(value, DealGeneralSellerKeys.FIRST_SALES_PERSON_ID);
                    }}
                    getFullInfo={(contact) => {
                        handleGetFullInfo(contact, DealGeneralSellerKeys.FIRST_SALES_PERSON_ID);
                    }}
                    name='Salesman 1'
                />
            </div>
            <div className='col-6'>
                <SalespersonSearch
                    value={salesperson2name}
                    onChange={(event) => {
                        changeDeal({
                            key: DealGeneralSellerKeys.SECOND_SALES_PERSON_ID,
                            value: event.target.value,
                        });
                    }}
                    onChangeGetFullInfo={(value) => {
                        handleGetFullInfo(value, DealGeneralSellerKeys.SECOND_SALES_PERSON_ID);
                    }}
                    getFullInfo={(contact) => {
                        handleGetFullInfo(contact, DealGeneralSellerKeys.SECOND_SALES_PERSON_ID);
                    }}
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
                    <SalespersonSearch
                        name='Seller'
                        value={differentSellerInfo}
                        onChangeGetFullInfo={(value) => {
                            handleGetFullInfo(value, DealGeneralSellerKeys.DIFFERENT_SELLER_ID);
                        }}
                        getFullInfo={(contact) => {
                            handleGetFullInfo(contact, DealGeneralSellerKeys.DIFFERENT_SELLER_ID);
                        }}
                    />
                </div>
            )}
        </div>
    );
});
