import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import {
    ListData,
    MakesListData,
    getInventoryAutomakesList,
    getInventoryExteriorColorsList,
    getInventoryInteriorColorsList,
} from "http/services/inventory-service";

export const VehicleGeneral = (): JSX.Element => {
    const [selectedMakes, setSelectedMakes] = useState<string>("");
    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [colorList, setColorList] = useState<ListData[]>([]);
    const [selectedInterior, setSelectedInterior] = useState<string>("");
    const [interiorList, setInteriorList] = useState<ListData[]>([]);
    useEffect(() => {
        getInventoryAutomakesList().then((list) => {
            list && setAutomakesList(list);
        });
        getInventoryExteriorColorsList().then((list) => {
            list && setColorList(list);
        });
        getInventoryInteriorColorsList().then((list) => {
            list && setInteriorList(list);
        });
    }, []);

    const selectedMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    {option?.logo && (
                        <img
                            alt={option?.name}
                            src='https://imgur.com/CF9I4yL.png'
                            className='mr-2'
                            style={{ width: "30px" }}
                        />
                    )}
                    <div>{option?.name}</div>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    const makesOptionTemplate = (option: MakesListData) => {
        return (
            <div className='flex align-items-center'>
                {option?.logo && (
                    <img
                        alt={option?.name}
                        src='https://imgur.com/CF9I4yL.png'
                        className='mr-2'
                        style={{ width: "30px" }}
                    />
                )}
                <div>{option?.name}</div>
            </div>
        );
    };

    return (
        <div className='grid vehicle-general row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='vehicle-general__text-input w-full' />
                    <label className='float-label'>VIN (required)</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='vehicle-general__text-input w-full' />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>
            <div className='col-6'>
                {automakesList.length ? (
                    <Dropdown
                        optionLabel='name'
                        value={selectedMakes}
                        onChange={(e) => setSelectedMakes(e.value)}
                        options={automakesList}
                        valueTemplate={selectedMakesTemplate}
                        itemTemplate={makesOptionTemplate}
                        placeholder='Make (required)'
                        className='w-full vehicle-general__dropdown'
                    />
                ) : (
                    <Dropdown
                        disabled
                        placeholder='Loading makes...'
                        className='w-full vehicle-general__dropdown'
                    />
                )}
            </div>

            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    placeholder='Model (required)'
                    className='w-full vehicle-general__dropdown'
                />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='vehicle-general__text-input w-full' />
                    <label className='float-label'>Year (required)</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='vehicle-general__text-input w-full' />
                    <label className='float-label'>Mileage (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.value)}
                    options={colorList}
                    placeholder='Color'
                    className='w-full vehicle-general__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    value={selectedInterior}
                    onChange={(e) => setSelectedInterior(e.value)}
                    options={interiorList}
                    placeholder='Interior color'
                    className='w-full vehicle-general__dropdown'
                />
            </div>
        </div>
    );
};
