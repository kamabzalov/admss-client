import { SalespersonsList } from "common/models/contact";
import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import { useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { ComboBox } from "dashboard/common/form/dropdown";
import { CURRENCY_OPTIONS, CurrencyInput } from "dashboard/common/form/inputs";
import "./index.css";

interface SalesmanSelectDialogProps extends DashboardDialogProps {
    manager: string;
    salesmanFirst: string;
    salesmanSecond: string;
    onManagerChange: (manager: string) => void;
    onSalesmanFirstChange: (salesman: string) => void;
    onSalesmanSecondChange: (salesman: string) => void;
}

export const SalesmanSelectDialog = ({
    manager,
    salesmanFirst,
    salesmanSecond,
    onManagerChange,
    onSalesmanFirstChange,
    onSalesmanSecondChange,
    ...props
}: SalesmanSelectDialogProps) => {
    const [salesmanList, setSalesmanList] = useState<SalespersonsList[]>([]);
    const { authUser } = useStore().userStore;

    const handleGetSalesmanList = async () => {
        if (!authUser) return;
        const response = await getContactsSalesmanList(authUser.useruid);
        if (response && Array.isArray(response)) {
            setSalesmanList(response);
        }
    };

    useEffect(() => {
        handleGetSalesmanList();
        return () => {
            setSalesmanList([]);
        };
    }, []);

    return (
        <DashboardDialog
            header='Select Salesman'
            className='salesman-select-dialog'
            footer='OK'
            cancelButton
            buttonDisabled={!manager || !salesmanFirst || !salesmanSecond}
            action={() => {
                props.onHide?.();
            }}
            {...props}
        >
            <div className='grid salesman-select-dialog__body'>
                <div className='col-8 salesman-select-dialog__column'>
                    <ComboBox
                        options={salesmanList}
                        optionLabel='name'
                        optionValue='uid'
                        placeholder='Manager'
                        className='w-full'
                        value={manager}
                        onChange={({ value }) => {
                            onManagerChange(value);
                        }}
                    />
                    <ComboBox
                        options={salesmanList}
                        optionLabel='name'
                        optionValue='uid'
                        placeholder='Salesman 1'
                        className='w-full'
                        value={salesmanFirst}
                        onChange={({ value }) => {
                            onSalesmanFirstChange(value);
                        }}
                    />
                    <ComboBox
                        options={salesmanList}
                        optionLabel='name'
                        optionValue='uid'
                        placeholder='Salesman 2'
                        className='w-full'
                        value={salesmanSecond}
                        onChange={({ value }) => {
                            onSalesmanSecondChange(value);
                        }}
                    />
                </div>
                <div className='col-4 salesman-select-dialog__column'>
                    <CurrencyInput
                        placeholder='Manager Commission'
                        className='w-full'
                        currencyIcon={CURRENCY_OPTIONS.PERCENT}
                    />
                    <CurrencyInput
                        placeholder='Salesman 1 Commission'
                        className='w-full'
                        currencyIcon={CURRENCY_OPTIONS.PERCENT}
                    />
                    <CurrencyInput
                        placeholder='Salesman 2 Commission'
                        className='w-full'
                        currencyIcon={CURRENCY_OPTIONS.PERCENT}
                    />
                </div>
            </div>
        </DashboardDialog>
    );
};
