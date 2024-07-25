import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useParams } from "react-router-dom";
import { listAccountActivity } from "http/services/accounts.service";
import { ACCOUNT_ACTIVITY_LIST } from "common/constants/account-options";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "date", header: "Date" },
    { field: "description", header: "Description" },
    { field: "debit", header: "Debit" },
    { field: "credit", header: "Credit" },
];

export const AccountManagement = (): ReactElement => {
    const { id } = useParams();
    const [activityList, setActivityList] = useState<any[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<string>(ACCOUNT_ACTIVITY_LIST[0].name);

    useEffect(() => {
        if (id) {
            listAccountActivity(id).then((res) => {
                if (Array.isArray(res) && res.length) setActivityList(res);
            });
        }
    }, [id]);
    return (
        <div className='account-management'>
            <h3 className='account-management__title account-title'>Account Management</h3>
            <div className='account-details grid'>
                <div className='col-3'>
                    <Dropdown
                        className='w-full'
                        options={ACCOUNT_ACTIVITY_LIST}
                        value={selectedActivity}
                        onChange={({ target: { value } }) => setSelectedActivity(value)}
                        optionValue='name'
                        optionLabel='name'
                    />
                </div>
                <div className='col-9 flex gap-3 justify-content-end'>
                    <Button className='account-management__button' label='Take Payment' />
                    <Button className='account-management__button' label='Add Fee' />
                </div>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='mt-6 account-management__table'
                        value={activityList}
                        emptyMessage='No activity yet.'
                        reorderableColumns
                        resizableColumns
                        scrollable
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            body={(options) => {
                                return (
                                    <div className='flex gap-3 align-items-center'>
                                        <Checkbox checked={false} />
                                    </div>
                                );
                            }}
                            pt={{
                                root: {
                                    style: {
                                        width: "60px",
                                    },
                                },
                            }}
                        />
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                header={header}
                                alignHeader={"left"}
                                key={field}
                                headerClassName='cursor-move'
                                className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                            />
                        ))}
                    </DataTable>
                </div>
            </div>
            <div className='col-12 flex gap-3'>
                <Button className='account-management__button'>Print</Button>
                <Button className='account-management__button'>Download</Button>
            </div>
        </div>
    );
};
