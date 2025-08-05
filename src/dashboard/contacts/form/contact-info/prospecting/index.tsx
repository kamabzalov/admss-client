import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useStore } from "store/hooks";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { useParams } from "react-router-dom";
import { AddTaskDialog } from "dashboard/tasks/add-task-dialog";
import { ComboBox } from "dashboard/common/form/dropdown";
import { getShortInventoryList } from "http/services/inventory-service";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import { InventoryShortList } from "common/models/inventory";
import { AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { AutoCompleteDropdown } from "dashboard/common/form/autocomplete";
import { Loader } from "dashboard/common/loader";
export const ContactsProspecting = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().contactStore;
    const { authUser } = useStore().userStore;
    const { contactExtData, changeContactExtData } = store;
    const toast = useToast();
    const [salespersonsList, setSalespersonsList] = useState<unknown[]>([]);
    const [anotherVehicle, setAnotherVehicle] = useState<boolean>(false);
    const [initialProspectList, setInitialProspectList] = useState<InventoryShortList[]>([]);
    const [prospectList, setProspectList] = useState<InventoryShortList[]>([]);
    const [showAddTaskDialog, setShowAddTaskDialog] = useState<boolean>(false);
    const [prospectInput, setProspectInput] = useState<InventoryShortList | null>(null);
    const [prospectSecondInput, setProspectSecondInput] = useState<InventoryShortList | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGetShortInventoryList = async () => {
        setIsLoading(true);
        const response = await getShortInventoryList(authUser?.useruid ?? "");
        if (!Array.isArray(response) && response?.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.error as string,
                life: TOAST_LIFETIME,
            });
        } else {
            const list = response as InventoryShortList[];
            setInitialProspectList(list);
            setProspectInput(
                list.find((prospect) => prospect.itemuid === contactExtData.PROSPECT1_ID) ?? null
            );
            setProspectSecondInput(
                list.find((prospect) => prospect.itemuid === contactExtData.PROSPECT2_ID) ?? null
            );
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (authUser) {
            getContactsSalesmanList(authUser.useruid).then((response) => {
                if (response && Array.isArray(response)) {
                    setSalespersonsList(response);
                }
            });
            handleGetShortInventoryList();
        }
    }, [id]);

    useEffect(() => {
        setAnotherVehicle(!!contactExtData.PROSPECT2_ID?.length);
    }, [contactExtData.PROSPECT2_ID]);

    const searchProspect = (event: AutoCompleteCompleteEvent) => {
        const filteredProspects = initialProspectList.filter((prospect) =>
            prospect.name.toLowerCase().includes(event.query.toLowerCase())
        );
        setProspectList(filteredProspects);
    };

    return isLoading ? (
        <Loader className='contact-form__loader' />
    ) : (
        <div className='grid contacts-prospecting row-gap-2'>
            <div className='col-6'>
                <ComboBox
                    optionLabel='username'
                    optionValue='useruid'
                    value={contactExtData.SALESMAN_ID}
                    options={salespersonsList}
                    onChange={({ target: { value } }) => changeContactExtData("SALESMAN_ID", value)}
                    placeholder='Attending Salesman'
                    className='w-full contacts-prospecting__dropdown'
                    label='Attending Salesman'
                />
            </div>
            <div className='col-6'>
                <DateInput
                    date={new Date(contactExtData.created)}
                    emptyDate
                    name='Contact till'
                    showTime
                    hourFormat='12'
                    onChange={({ target: { value } }) =>
                        changeContactExtData("created", Number(value))
                    }
                    className='contacts-prospecting__date-input w-full'
                />
            </div>
            <div className='col-6'>
                <AutoCompleteDropdown
                    value={prospectInput}
                    field='name'
                    onChange={(e) => {
                        setProspectInput(e.target.value);
                    }}
                    onSelect={(e) => {
                        const selectedProspect = initialProspectList.find(
                            (prospect) => prospect.name === e.value.name
                        );
                        if (selectedProspect) {
                            changeContactExtData("PROSPECT1_ID", selectedProspect.itemuid);
                        }
                    }}
                    placeholder='Choose a Vehicle'
                    className='w-full contacts-prospecting__dropdown'
                    dropdown
                    completeMethod={searchProspect}
                    forceSelection
                    suggestions={prospectList}
                    label='Choose a Vehicle'
                    clearButton
                    onClear={() => {
                        setProspectInput(null);
                        changeContactExtData("PROSPECT1_ID", "");
                        setProspectList(initialProspectList);
                    }}
                />
            </div>
            {anotherVehicle ? (
                <div className='col-6'>
                    <AutoCompleteDropdown
                        value={prospectSecondInput}
                        field='name'
                        onChange={(e) => {
                            setProspectSecondInput(e.target.value);
                        }}
                        onSelect={(e) => {
                            const selectedProspect = initialProspectList.find(
                                (prospect) => prospect.name === e.value.name
                            );
                            if (selectedProspect) {
                                changeContactExtData("PROSPECT2_ID", selectedProspect.itemuid);
                            }
                        }}
                        placeholder='Choose a Vehicle'
                        className='w-full contacts-prospecting__dropdown'
                        dropdown
                        completeMethod={searchProspect}
                        forceSelection
                        suggestions={prospectList}
                        label='Choose a Vehicle'
                        onClear={() => {
                            setProspectSecondInput(null);
                            changeContactExtData("PROSPECT2_ID", "");
                            setProspectList(initialProspectList);
                        }}
                        clearButton
                    />
                </div>
            ) : (
                <div className='col-6'>
                    <Button
                        type='button'
                        className='contacts__button w-full'
                        outlined
                        onClick={() => setAnotherVehicle(true)}
                    >
                        <i className='pi pi-plus mr-2 text-xs pt-1' />
                        Add another Vehicle
                    </Button>
                </div>
            )}
            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        placeholder='Prospecting Notes'
                        value={contactExtData.Notes}
                        onChange={({ target: { value } }) => changeContactExtData("Notes", value)}
                        className='w-full contacts-prospecting__text-area'
                    />
                    <label className='float-label'>Prospecting Notes</label>
                </span>
            </div>
            <div className='col-12 flex justify-content-end '>
                <Button
                    type='button'
                    className='px-4 font-bold'
                    onClick={() => setShowAddTaskDialog(true)}
                    outlined
                >
                    Schedule Call Back
                </Button>
            </div>
            <AddTaskDialog
                position='top'
                visible={showAddTaskDialog}
                onHide={() => setShowAddTaskDialog(false)}
                header='Add Task'
            />
        </div>
    );
});
