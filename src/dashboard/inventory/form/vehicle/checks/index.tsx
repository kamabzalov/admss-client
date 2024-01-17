import { Checkbox } from "primereact/checkbox";
import { ReactElement, useState } from "react";
import "./index.css";

interface VehicleChecksInput {
    name: string;
    value: 0 | 1;
    id: string;
}

export const VehicleChecks = (): ReactElement => {
    const serverChecks: VehicleChecksInput[] = [
        { name: "AutoCheck done", value: 1, id: "autoCheck" },
        { name: "State inspection Performed", value: 1, id: "stateInspection" },
        { name: "Oil and Filter inspected and changed", value: 0, id: "oilFilter" },
        { name: "User defined inspection", value: 1, id: "userInspection1" },
        { name: "User defined inspection", value: 0, id: "userInspection2" },
        { name: "User defined inspection", value: 1, id: "userInspection3" },
        { name: "User defined inspection", value: 0, id: "userInspection4" },
        { name: "User defined inspection", value: 1, id: "userInspection5" },
        { name: "User defined inspection", value: 0, id: "userInspection6" },
        { name: "User defined inspection", value: 1, id: "userInspection7" },
        { name: "User defined inspection", value: 0, id: "userInspection8" },
        { name: "User defined inspection", value: 1, id: "userInspection9" },
        { name: "User defined inspection", value: 0, id: "userInspection10" },
    ];
    const [vehicleCheckData, setVehicleCheckData] = useState<VehicleChecksInput[]>(serverChecks);

    const topChecksId: string[] = ["autoCheck", "stateInspection", "oilFilter"];

    const onCheckChange = (id: string) => {
        setVehicleCheckData((prevChecks) => {
            return prevChecks.map((check) => {
                if (check.id === id) {
                    return { ...check, value: check.value === 0 ? 1 : 0 };
                }
                return check;
            });
        });
    };

    return (
        <div className='grid flex-column vehicle-checks'>
            <div className='grid flex-column vehicle-checks__top'>
                {vehicleCheckData.map(
                    (check: VehicleChecksInput) =>
                        topChecksId.includes(check.id) && (
                            <div
                                key={check.name}
                                className='vehicle-checks__checkbox flex align-items-center'
                            >
                                <Checkbox
                                    inputId={check.id}
                                    name={check.name}
                                    onChange={() => onCheckChange(check.id)}
                                    checked={!!check.value}
                                />
                                <label htmlFor={check.id} className='ml-2'>
                                    {check.name}
                                </label>
                            </div>
                        )
                )}
            </div>
            <div className='grid flex-column vehicle-checks__bottom'>
                {vehicleCheckData.map(
                    (check: VehicleChecksInput) =>
                        !topChecksId.includes(check.id) && (
                            <div
                                key={check.id}
                                className='vehicle-checks__checkbox flex align-items-center'
                            >
                                <Checkbox
                                    inputId={check.id}
                                    name={check.name}
                                    onChange={() => onCheckChange(check.id)}
                                    checked={!!check.value}
                                />
                                <label htmlFor={check.id} className='ml-2'>
                                    {check.name}
                                </label>
                            </div>
                        )
                )}
            </div>
        </div>
    );
};
