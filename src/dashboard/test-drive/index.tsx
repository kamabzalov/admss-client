import { CompanySearch } from "dashboard/contacts/common/company-search";
import { Button } from "primereact/button";
import { ReactElement, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./index.css";
import { DateInput, StateDropdown, TextInput } from "dashboard/common/form/inputs";
import { InventorySearch } from "dashboard/inventory/common/inventory-search";
import { InputTextarea } from "primereact/inputtextarea";
import {
    TestDriver,
    TestVehicle,
    TestDealer,
    driverState,
    vehicleState,
    dealerState,
} from "./form-data";
import { useStore } from "store/hooks";
import { printTestDrive } from "http/services/print";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { ContactUser } from "common/models/contact";
import { setContact } from "http/services/contacts-service";

const isFormComplete = (obj: object): boolean => {
    return Object.values(obj).every((value) => value !== "");
};

export const PrintForTestDrive = (): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const toast = useToast();
    const [driver, setDriver] = useState<TestDriver>(driverState);
    const [vehicle, setVehicle] = useState<TestVehicle>(vehicleState);
    const [dealer, setDealer] = useState<TestDealer>(dealerState);
    const [addToContactDisable, setAddToContactDisable] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const partialDriver = {
            customerName: driver.customerName,
            customerLastName: driver.customerLastName,
            homePhone: driver.homePhone,
        };
        const isAddToContactDisable = isFormComplete(partialDriver);
        setAddToContactDisable(isAddToContactDisable);
        const { comments, ...dealerRequired } = dealer;
        const isAllFormFilled =
            isFormComplete(driver) && isFormComplete(vehicle) && isFormComplete(dealerRequired);
        setIsComplete(isAllFormFilled);
    }, [driver, vehicle, dealer]);

    const handlePrintForm = async (print: boolean = false) => {
        if (!isComplete) {
            return toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Please fill all required fields",
                life: TOAST_LIFETIME,
            });
        }
        if (authUser && authUser.useruid) {
            const response = await printTestDrive(authUser.useruid, {
                ...driver,
                ...vehicle,
                ...dealer,
            });
            if (response.status === Status.ERROR) {
                const { error } = response;
                return toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: error || "Error while print for test drive",
                    life: TOAST_LIFETIME,
                });
            }
            setTimeout(() => {
                const url = new Blob([response], { type: "application/pdf" });
                let link = document.createElement("a");
                link.href = window.URL.createObjectURL(url);
                if (!print) {
                    link.download = `test_drive_print_form_${authUser.username}.pdf`;
                    link.click();
                } else {
                    window.open(
                        link.href,
                        "_blank",
                        "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                    );
                }
            }, 3000);
        }
    };

    const handleAddToContact = () => {
        const newContact: Partial<ContactUser> = {
            firstName: driver.customerName,
            lastName: driver.customerLastName,
            phone1: driver.homePhone,
            dl_number: driver.dlNumber,
            dl_issuedate: driver.dlIssuingDate,
            dl_expiration: driver.dlExpirationDate,
        };
        setContact(null, newContact);
    };

    return (
        <Suspense>
            <div className='grid relative'>
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={() => navigate("/dashboard")}
                />
                <div className='col-12'>
                    <div className='card test-drive'>
                        <div className='card-header flex'>
                            <h2 className='card-header__title uppercase w-full m-0'>
                                Print (for test drive)
                            </h2>
                        </div>
                        <div className='card-content test-drive__card'>
                            <div className='grid test-drive__card-content row-gap-2'>
                                <div className='col-12 test-drive__subtitle'>Driver</div>

                                <div className='col-6'>
                                    <CompanySearch
                                        name='First Name'
                                        value={driver.customerName}
                                        returnedField='firstName'
                                        getFullInfo={({
                                            firstName,
                                            lastName,
                                            phone1,
                                            dl_number,
                                            dl_issuedate,
                                            dl_expiration,
                                        }) =>
                                            setDriver({
                                                ...driver,
                                                customerName: firstName,
                                                customerLastName: lastName,
                                                homePhone: phone1,
                                                dlNumber: dl_number,
                                                dlIssuingDate: dl_issuedate,
                                                dlExpirationDate: dl_expiration,
                                            })
                                        }
                                        onChange={({ target: { value } }) => {
                                            return setDriver({ ...driver, customerName: value });
                                        }}
                                    />
                                </div>
                                <div className='col-6'>
                                    <CompanySearch
                                        name='Last Name'
                                        value={driver.customerLastName}
                                        returnedField='lastName'
                                        getFullInfo={({ firstName, lastName, phone1, dl_number }) =>
                                            setDriver({
                                                ...driver,
                                                customerName: firstName,
                                                customerLastName: lastName,
                                                homePhone: phone1,
                                                dlNumber: dl_number,
                                            })
                                        }
                                        onChange={({ target: { value } }) =>
                                            setDriver({ ...driver, customerLastName: value })
                                        }
                                    />
                                </div>
                                <TextInput
                                    name='Phone Number'
                                    value={driver.homePhone}
                                    onChange={({ target: { value } }) =>
                                        setDriver({ ...driver, homePhone: value })
                                    }
                                    colWidth={4}
                                />
                                <TextInput
                                    name='Driver License’s Number'
                                    value={driver.dlNumber}
                                    onChange={({ target: { value } }) =>
                                        setDriver({ ...driver, dlNumber: value })
                                    }
                                    colWidth={4}
                                />
                                <StateDropdown
                                    name='DL’s State'
                                    value={driver.dlState}
                                    onChange={({ target: { value } }) =>
                                        setDriver({ ...driver, dlState: value })
                                    }
                                    colWidth={4}
                                />
                                <DateInput
                                    name='DL’s Start Date'
                                    value={driver.dlIssuingDate}
                                    onChange={({ target: { value } }) =>
                                        setDriver({ ...driver, dlIssuingDate: value as string })
                                    }
                                    colWidth={6}
                                />
                                <DateInput
                                    name='DL’s Exp. Date'
                                    value={driver.dlExpirationDate}
                                    onChange={({ target: { value } }) =>
                                        setDriver({ ...driver, dlExpirationDate: value as string })
                                    }
                                    colWidth={6}
                                />

                                <div className='col-12 test-drive__subtitle'>Vehicle</div>

                                <div className='col-6'>
                                    <InventorySearch
                                        name='VIN'
                                        value={vehicle.vclVIN}
                                        returnedField='VIN'
                                        onChange={({ target: { value } }) => {
                                            setVehicle({ ...vehicle, vclVIN: value });
                                        }}
                                        getFullInfo={({ VIN, Make, Model, Year }) => {
                                            setVehicle({
                                                ...vehicle,
                                                vclVIN: VIN,
                                                vclMake: Make,
                                                vclModel: Model,
                                                vclYear: Year,
                                            });
                                        }}
                                    />
                                </div>
                                <div className='col-6'>
                                    <InventorySearch
                                        name='Make'
                                        value={vehicle.vclMake}
                                        returnedField='Make'
                                        getFullInfo={({ VIN, Make, Model, Year }) => {
                                            setVehicle({
                                                ...vehicle,
                                                vclVIN: VIN,
                                                vclMake: Make,
                                                vclModel: Model,
                                                vclYear: Year,
                                            });
                                        }}
                                        onChange={({ target: { value } }) => {
                                            setVehicle({ ...vehicle, vclMake: value });
                                        }}
                                    />
                                </div>
                                <div className='col-6'>
                                    <InventorySearch
                                        name='Model'
                                        value={vehicle.vclModel}
                                        returnedField='Model'
                                        getFullInfo={({ VIN, Make, Model, Year }) => {
                                            setVehicle({
                                                ...vehicle,
                                                vclVIN: VIN,
                                                vclMake: Make,
                                                vclModel: Model,
                                                vclYear: Year,
                                            });
                                        }}
                                        onChange={({ target: { value } }) => {
                                            setVehicle({ ...vehicle, vclModel: value });
                                        }}
                                    />
                                </div>
                                <TextInput
                                    name='Year'
                                    value={vehicle.vclYear}
                                    onChange={({ target: { value } }) =>
                                        setVehicle({ ...vehicle, vclYear: value })
                                    }
                                    colWidth={6}
                                />

                                <div className='col-12 test-drive__subtitle'>Dealer</div>

                                <div className='col-4'>
                                    <CompanySearch
                                        name='Manager'
                                        value={dealer.dealersName}
                                        onRowClick={(dealersName) =>
                                            setDealer({ ...dealer, dealersName })
                                        }
                                        onChange={({ target: { value } }) =>
                                            setDealer({ ...dealer, dealersName: value })
                                        }
                                    />
                                </div>
                                <DateInput
                                    name='Issue Date/Time'
                                    value={dealer.outDate}
                                    onChange={({ target: { value } }) =>
                                        setDealer({ ...dealer, outDate: value as string })
                                    }
                                    colWidth={4}
                                />
                                <TextInput
                                    name='Odometer'
                                    value={dealer.outOdometer}
                                    onChange={({ target: { value } }) =>
                                        setDealer({ ...dealer, outOdometer: value })
                                    }
                                    colWidth={4}
                                />
                                <div className='col-12'>
                                    <span className='p-float-label'>
                                        <InputTextarea
                                            name='Comment'
                                            value={dealer.comments}
                                            onChange={({ target: { value } }) => {
                                                setDealer({ ...dealer, comments: value });
                                            }}
                                            className='test-drive__text-area'
                                        />
                                        <label className='float-label'>Comment</label>
                                    </span>
                                </div>
                            </div>
                            <div className='test-drive__card-control'>
                                <Button
                                    className='test-drive__button'
                                    label='Add to contacts'
                                    onClick={handleAddToContact}
                                    disabled={!addToContactDisable}
                                    severity={!addToContactDisable ? "secondary" : "success"}
                                    outlined
                                />
                                <Button
                                    className='test-drive__button'
                                    severity={!isComplete ? "secondary" : "success"}
                                    onClick={() => handlePrintForm()}
                                    label='Preview'
                                />
                                <Button
                                    className='test-drive__button'
                                    severity={!isComplete ? "secondary" : "success"}
                                    onClick={() => handlePrintForm(true)}
                                    label='Print'
                                />
                                <Button
                                    className='test-drive__button'
                                    severity={!isComplete ? "secondary" : "success"}
                                    onClick={() => handlePrintForm()}
                                    label='Download'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
};
