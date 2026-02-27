import { ReactElement, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { Splitter } from "dashboard/common/display";
import { useStore } from "store/hooks";
import { CREATE_ID } from "common/constants/links";
import { fromBinary, toBinary } from "common/helpers";

export const BackendOptions = observer((): ReactElement => {
    const { id } = useParams();
    const usersStore = useStore().usersStore;
    const { salespersonInfo, changeSalespersonInfo, getSalespersonInfo } = usersStore;

    useEffect(() => {
        if (id && id !== CREATE_ID) {
            getSalespersonInfo(id);
        }
    }, [id]);

    const backendOptionsFields = [
        { key: "GPUProfit" as const, label: "Warranty Profit" },
        { key: "GAPProfit" as const, label: "GAP Profit" },
        { key: "AccessoryProfit" as const, label: "Accessory Profit" },
        { key: "CreditLifeProfit" as const, label: "Credit Life Profit" },
        { key: "DPProfit" as const, label: "A&H Profit" },
        { key: "VehiclePack" as const, label: "Vehicle Pack" },
        { key: "Devices" as const, label: "Doc Fee" },
        { key: "InterestRate" as const, label: "Interest Markup" },
    ];

    const allChecked = backendOptionsFields.every((field) =>
        fromBinary(salespersonInfo?.[field.key])
    );

    const handleSelectAll = () => {
        const newValue = toBinary(!allChecked);
        backendOptionsFields.forEach((field) => {
            changeSalespersonInfo(field.key, newValue);
        });
    };

    const toggleField = (key: keyof typeof salespersonInfo) => {
        const currentValue = salespersonInfo?.[key] as number;
        changeSalespersonInfo(key, toBinary(!fromBinary(currentValue)));
    };

    return (
        <div className='backend-options mt-4'>
            <div className='grid'>
                <div className='col-3 pb-0'>
                    <BorderedCheckbox
                        name='Select All'
                        checked={allChecked}
                        onChange={handleSelectAll}
                    />
                </div>
            </div>

            <Splitter className='my-4' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Warranty Profit'
                        checked={fromBinary(salespersonInfo?.GPUProfit)}
                        onChange={() => toggleField("GPUProfit")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='GAP Profit'
                        checked={fromBinary(salespersonInfo?.GAPProfit)}
                        onChange={() => toggleField("GAPProfit")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Accessory Profit'
                        checked={fromBinary(salespersonInfo?.AccessoryProfit)}
                        onChange={() => toggleField("AccessoryProfit")}
                    />
                </div>{" "}
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Credit Life Profit'
                        checked={fromBinary(salespersonInfo?.CreditLifeProfit)}
                        onChange={() => toggleField("CreditLifeProfit")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='A&H Profit'
                        checked={fromBinary(salespersonInfo?.DPProfit)}
                        onChange={() => toggleField("DPProfit")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Vehicle Pack'
                        checked={fromBinary(salespersonInfo?.VehiclePack)}
                        onChange={() => toggleField("VehiclePack")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Doc Fee'
                        checked={fromBinary(salespersonInfo?.Devices)}
                        onChange={() => toggleField("Devices")}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        name='Interest Markup'
                        checked={fromBinary(salespersonInfo?.InterestRate)}
                        onChange={() => toggleField("InterestRate")}
                    />
                </div>
            </div>
        </div>
    );
});
