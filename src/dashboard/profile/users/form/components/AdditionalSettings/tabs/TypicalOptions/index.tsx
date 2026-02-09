import { ReactElement, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Splitter } from "dashboard/common/display";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { CREATE_ID } from "common/constants/links";
import { fromBinary, toBinary } from "common/helpers";

export const TypicalOptions = observer((): ReactElement => {
    const { id } = useParams();
    const usersStore = useStore().usersStore;
    const { salespersonInfo, changeSalespersonInfo, getSalespersonInfo } = usersStore;

    useEffect(() => {
        if (id && id !== CREATE_ID) {
            getSalespersonInfo(id);
        }
    }, [id]);

    const typicalOptionsFields = [
        { key: "VehicleProfit" as const, label: "Vehicle Profit" },
        { key: "OverallIncome" as const, label: "Overallowance" },
        { key: "CommissionType" as const, label: "Discount" },
        { key: "Acquisition" as const, label: "Acquision/ Loan Fee" },
        { key: "Reserve" as const, label: "Reserve" },
        { key: "MiscCost" as const, label: "Misc. Cost" },
        { key: "MiscProfit" as const, label: "Misc. Profit" },
    ];

    const allChecked = typicalOptionsFields.every((field) =>
        fromBinary(salespersonInfo?.[field.key])
    );

    const handleSelectAll = () => {
        const newValue = toBinary(!allChecked);
        typicalOptionsFields.forEach((field) => {
            changeSalespersonInfo(field.key, newValue);
        });
    };

    const toggleField = (key: keyof typeof salespersonInfo) => {
        const currentValue = salespersonInfo?.[key] as number;
        changeSalespersonInfo(key, toBinary(!fromBinary(currentValue)));
    };

    return (
        <div className='typical-options mt-4'>
            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Select All'
                        checked={allChecked}
                        onChange={handleSelectAll}
                    />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Vehicle Profit'
                        checked={fromBinary(salespersonInfo?.VehicleProfit)}
                        onChange={() => toggleField("VehicleProfit")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Overallowance'
                        checked={fromBinary(salespersonInfo?.OverallIncome)}
                        onChange={() => toggleField("OverallIncome")}
                    />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Discount'
                        checked={fromBinary(salespersonInfo?.CommissionType)}
                        onChange={() => toggleField("CommissionType")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Acquision/ Loan Fee'
                        checked={fromBinary(salespersonInfo?.Acquisition)}
                        onChange={() => toggleField("Acquisition")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Reserve'
                        checked={fromBinary(salespersonInfo?.Reserve)}
                        onChange={() => toggleField("Reserve")}
                    />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Manager Override'
                        checked={fromBinary(salespersonInfo?.FinanceIncome)}
                        onChange={() => toggleField("FinanceIncome")}
                    />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Misc. Cost'
                        checked={fromBinary(salespersonInfo?.MiscCost)}
                        onChange={() => toggleField("MiscCost")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Misc. Profit'
                        checked={fromBinary(salespersonInfo?.MiscProfit)}
                        onChange={() => toggleField("MiscProfit")}
                    />
                </div>
            </div>
        </div>
    );
});
