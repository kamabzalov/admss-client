import { observer } from "mobx-react-lite";
import { ReactElement, useState } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";

export const DealGeneralSeller = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        deal: { salesperson1uid, salesperson2uid },
        changeDeal,
    } = store;
    const [checked, setChecked] = useState<boolean>(false);
    return (
        <div className='grid deal-general-seller row-gap-2'>
            <div className='col-6'>
                <CompanySearch
                    value={salesperson1uid}
                    onChange={({ target: { value } }) =>
                        changeDeal({ key: "salesperson1uid", value })
                    }
                    onRowClick={(value) =>
                        changeDeal({
                            key: "salesperson1uid",
                            value,
                        })
                    }
                    name='Salesman 1'
                />
            </div>
            <div className='col-6'>
                <CompanySearch
                    value={salesperson2uid}
                    onChange={({ target: { value } }) =>
                        changeDeal({ key: "salesperson2uid", value })
                    }
                    onRowClick={(value) =>
                        changeDeal({
                            key: "salesperson2uid",
                            value,
                        })
                    }
                    name='Salesman 2'
                />
            </div>

            <hr className='col-12 form-line' />

            <div className='col-3'>
                <BorderedCheckbox
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                    name='Different seller'
                />
            </div>
            {checked && (
                <div className='col-6'>
                    <CompanySearch name='Seller' />
                </div>
            )}
        </div>
    );
});
