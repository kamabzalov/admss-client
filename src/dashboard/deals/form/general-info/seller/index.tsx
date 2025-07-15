import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { SalespersonsList } from "common/models/contact";
import { ComboBox } from "dashboard/common/form/dropdown";
import { getContactsSalesmanList } from "http/services/contacts-service";

enum DealGeneralSellerKeys {
    FIRST_SALES_PERSON_ID = "salesperson1uid",
    SECOND_SALES_PERSON_ID = "salesperson2uid",
    DIFFERENT_SELLER = "differentSeller",
    DIFFERENT_SELLER_ID = "differentSellerUID",
}

export const DealGeneralSeller = observer((): ReactElement => {
    const store = useStore().dealStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [salespersonList, setSalespersonList] = useState<SalespersonsList[]>([]);

    const {
        deal: { salesperson1uid, salesperson2uid, differentSeller, differentSellerUID },
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
                <div className='col-6'>
                    <ComboBox
                        options={salespersonList}
                        optionLabel='username'
                        optionValue='useruid'
                        value={differentSellerUID}
                        onChange={(event) => {
                            changeDeal({
                                key: DealGeneralSellerKeys.DIFFERENT_SELLER_ID,
                                value: event.target.value,
                            });
                        }}
                        label='Seller'
                    />
                </div>
            )}
        </div>
    );
});
