import { ReactElement, useCallback, useEffect, useId, useRef, useState } from "react";
import { DashboardDialog, DashboardDialogProps } from "..";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { DropdownProps } from "primereact/dropdown";
import { getAutoMakeModelList, getInventoryAutomakesList } from "http/services/inventory-service";

import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { ContactType } from "common/models/contact";
import { getContactsTypeList } from "http/services/contacts-service";
import { InputNumber } from "primereact/inputnumber";
import { DateInput } from "dashboard/common/form/inputs";
import { ListData } from "common/models";
import { MakesListData } from "common/models/inventory";
import { InputTextarea } from "primereact/inputtextarea";
import { ComboBox } from "dashboard/common/form/dropdown";
import { useDateRange } from "common/hooks";
import { validateDates } from "common/helpers";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
const INPUT_NUMBER_MAX_LENGTH = 11;

export enum SEARCH_FORM_TYPE {
    CONTACTS,
    INVENTORY,
    DEALS,
    ACCOUNTS,
}

enum DROPDOWN_TYPE {
    MAKE = "Make",
    MODEL = "Model",
    TYPE = "type",
}

export enum SEARCH_FIELD_TYPE {
    TEXT = "text",
    NUMBER = "number",
    DROPDOWN = "dropdown",
    DATE = "date",
    DATE_RANGE = "date_range",
    TEXTAREA = "textarea",
}

export interface SearchField<T> {
    key: keyof T & string;
    label?: string;
    value: string | undefined;
    type: SEARCH_FIELD_TYPE;
}

interface AdvancedSearchDialogProps<T> extends DashboardDialogProps {
    onInputChange: (key: keyof T, value: string) => void;
    fields: SearchField<T>[];
    onSearchClear?: (key: keyof T) => void;
    searchForm: SEARCH_FORM_TYPE;
}

export const AdvancedSearchDialog = <T,>({
    visible,
    buttonDisabled,
    onHide,
    onInputChange,
    onSearchClear,
    fields,
    action,
    searchForm,
    className,
}: AdvancedSearchDialogProps<T>): ReactElement => {
    const uniqueId = useId();
    const [initialAutomakesList, setInitialAutomakesList] = useState<MakesListData[]>([]);
    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);
    const [typeList, setTypeList] = useState<ContactType[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");
    const { startDate, endDate, handleDateChange } = useDateRange();
    const [dateError, setDateError] = useState<string>("");
    const autoCompleteRef = useRef<AutoComplete>(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
    const autoMake = fields.find((field) => field.key === "Make")?.value;

    const handleGetAutoMakeList = useCallback(async () => {
        if (searchForm === SEARCH_FORM_TYPE.INVENTORY) {
            const list = await getInventoryAutomakesList();
            if (list && Array.isArray(list)) {
                const upperCasedList = list.map((item) => ({
                    ...item,
                    name: item.name.toUpperCase(),
                }));
                setInitialAutomakesList(upperCasedList);
                setAutomakesList(upperCasedList);
            }
        }
    }, [searchForm]);

    const handleGetContactsTypeList = useCallback(async () => {
        if (searchForm === SEARCH_FORM_TYPE.CONTACTS) {
            const response = await getContactsTypeList();
            if (response) {
                const types = response as ContactType[];
                setTypeList(types);
            }
        }
    }, [searchForm]);

    useEffect(() => {
        if (!visible) return;
        if (searchForm === SEARCH_FORM_TYPE.INVENTORY) {
            handleGetAutoMakeList();
        }
        if (searchForm === SEARCH_FORM_TYPE.CONTACTS) {
            handleGetContactsTypeList();
        }
    }, [searchForm, visible]);

    const handleSelectMake = useCallback(async () => {
        if (!autoMake) return;

        const isMakeCorrect = automakesList.some(
            (make) => make.name.toUpperCase() === autoMake.toUpperCase()
        );
        if (!isMakeCorrect) {
            setAutomakesModelList([]);
            return;
        }

        const formatedMake = autoMake.toLowerCase().replaceAll(" ", "_");
        const list = await getAutoMakeModelList(formatedMake);
        if (list && Array.isArray(list)) {
            setAutomakesModelList(list);
        } else {
            setAutomakesModelList([]);
        }
    }, [autoMake]);

    useEffect(() => {
        if (autoMake) {
            handleSelectMake();
        }
    }, [handleSelectMake, autoMake]);

    useEffect(() => {
        if (startDate && endDate) {
            const validation = validateDates(Number(startDate), Number(endDate));
            setDateError(validation.isValid ? "" : validation.error || "");
        } else {
            setDateError("");
        }
    }, [startDate, endDate]);

    const selectedAutoMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    <img
                        alt={option.name}
                        src={option?.logo || defaultMakesLogo}
                        className='mr-2 dropdown-icon'
                    />
                    <div>{option.name}</div>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    const autoMakesOptionTemplate = (option: MakesListData) => {
        return (
            <div className='flex align-items-center'>
                <img
                    alt={option.name}
                    src={option?.logo || defaultMakesLogo}
                    className='mr-2 dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const handleAutoCompleteDropdownClick = ({
        value,
        key,
    }: {
        value: MakesListData;
        key: keyof T;
    }) => {
        const make = typeof value === "string" ? value : value.name;
        onInputChange(key, make);

        const modelField = fields.find((field) => field.key === "Model");
        if (modelField) {
            onInputChange("Model" as keyof T, "");
            setTimeout(() => {
                const modelElements = document.querySelectorAll('[data-pc-name="dropdown"]');
                modelElements.forEach((element) => {
                    const input = element.querySelector("input");
                    if (input && input === document.activeElement) {
                        input.blur();
                    }
                });
            }, 0);
        }
    };

    const handleAutoCompleteChange = ({ value, key }: { value: string; key: keyof T }) => {
        onInputChange(key, value);

        const modelField = fields.find((field) => field.key === "Model");
        if (modelField) {
            onInputChange("Model" as keyof T, "");
            setTimeout(() => {
                const modelElements = document.querySelectorAll('[data-pc-name="dropdown"]');
                modelElements.forEach((element) => {
                    const input = element.querySelector("input");
                    if (input && input === document.activeElement) {
                        input.blur();
                    }
                });
            }, 0);
        }

        const isValidMake = initialAutomakesList.some(
            (make) => make.name.toUpperCase() === value.toUpperCase()
        );

        if (isValidMake) {
            handleSelectMake();
        } else {
            setAutomakesModelList([]);
        }
    };

    return (
        <DashboardDialog
            className={`search-dialog ${className}`}
            footer='Search'
            header='Advanced search'
            visible={visible}
            buttonDisabled={buttonDisabled || !!dateError}
            action={action}
            onHide={onHide}
            draggable
        >
            <div className='flex flex-column gap-4 pt-4'>
                {fields.map(({ key, value, type, label }) => {
                    if (type === SEARCH_FIELD_TYPE.DATE) {
                        return (
                            <DateInput
                                key={key}
                                className='w-full'
                                value={value}
                                date={Number(value)}
                                emptyDate
                                clearButton
                                onClearAction={onSearchClear ? () => onSearchClear(key) : undefined}
                                name={label}
                                onChange={({ target }) => {
                                    onInputChange(key, target.value as string);
                                }}
                            />
                        );
                    }

                    if (type === SEARCH_FIELD_TYPE.DATE_RANGE) {
                        return (
                            <div key={key} className='dialog-dates'>
                                <DateInput
                                    className={`${dateError ? "p-invalid" : ""} dialog-dates__input dialog-dates__input--start`}
                                    date={Number(startDate)}
                                    emptyDate
                                    onClearAction={() => {
                                        handleDateChange(0, true);
                                        onInputChange(key, "");
                                    }}
                                    name={`Start ${label || key}`}
                                    onChange={({ target }) => {
                                        const dateValue = Number(target.value);
                                        handleDateChange(dateValue, true);
                                        onInputChange(key, `${dateValue}-${endDate}`);
                                    }}
                                />
                                <DateInput
                                    className={`${dateError ? "p-invalid" : ""} dialog-dates__input dialog-dates__input--end`}
                                    date={Number(endDate)}
                                    emptyDate
                                    onClearAction={() => {
                                        handleDateChange(0, false);
                                        onInputChange(key, "");
                                    }}
                                    name={`End ${label || key}`}
                                    minDate={startDate ? new Date(Number(startDate)) : undefined}
                                    onChange={({ target }) => {
                                        const dateValue = Number(target.value);
                                        handleDateChange(dateValue, false);
                                        onInputChange(key, `${startDate}-${dateValue}`);
                                    }}
                                />
                            </div>
                        );
                    }

                    return (
                        <span className='p-float-label p-input-icon-right relative' key={key}>
                            {type === SEARCH_FIELD_TYPE.TEXT && (
                                <InputText
                                    type='tel'
                                    id={uniqueId}
                                    className='w-full'
                                    value={value ?? ""}
                                    onChange={({ target }) => onInputChange(key, target.value)}
                                />
                            )}

                            {type === SEARCH_FIELD_TYPE.NUMBER && (
                                <InputNumber
                                    type='tel'
                                    className='w-full'
                                    useGrouping={false}
                                    maxLength={INPUT_NUMBER_MAX_LENGTH}
                                    value={Number(value) || null}
                                    onChange={({ value: newVal }) => {
                                        if (
                                            newVal &&
                                            newVal.toString().length >= INPUT_NUMBER_MAX_LENGTH
                                        ) {
                                            return;
                                        }
                                        onInputChange(key, newVal?.toString() || "");
                                    }}
                                    onPaste={(event) => {
                                        const clipboardData = event.clipboardData;
                                        const pastedData = clipboardData.getData("Text");

                                        const sanitizedData = pastedData
                                            .replace(/\D/g, "")
                                            .slice(0, INPUT_NUMBER_MAX_LENGTH);

                                        if (sanitizedData) {
                                            event.preventDefault();
                                            onInputChange(key, sanitizedData);
                                        }
                                    }}
                                />
                            )}

                            {type === SEARCH_FIELD_TYPE.DROPDOWN &&
                                searchForm === SEARCH_FORM_TYPE.INVENTORY && (
                                    <>
                                        {key === DROPDOWN_TYPE.MAKE ? (
                                            <AutoComplete
                                                id={uniqueId}
                                                value={value ?? ""}
                                                ref={autoCompleteRef}
                                                suggestions={automakesList}
                                                completeMethod={({ query }) => {
                                                    setAutomakesList(
                                                        initialAutomakesList.filter((item) =>
                                                            item.name.includes(query.toUpperCase())
                                                        )
                                                    );
                                                }}
                                                dropdown
                                                onChange={({ value }) => {
                                                    if (typeof value === "string") {
                                                        handleAutoCompleteChange({ value, key });
                                                    } else {
                                                        handleAutoCompleteDropdownClick({
                                                            value,
                                                            key,
                                                        });
                                                    }
                                                }}
                                                onDropdownClick={() => {
                                                    if (
                                                        autoCompleteRef.current &&
                                                        isDropdownVisible
                                                    ) {
                                                        autoCompleteRef.current.hide();
                                                    }
                                                }}
                                                onShow={() => setIsDropdownVisible(true)}
                                                onHide={() => setIsDropdownVisible(false)}
                                                itemTemplate={(option) =>
                                                    autoMakesOptionTemplate(option)
                                                }
                                                selectedItemTemplate={(option) =>
                                                    selectedAutoMakesTemplate(option, {
                                                        placeholder: label || key,
                                                    })
                                                }
                                                className={"w-full"}
                                            />
                                        ) : (
                                            <ComboBox
                                                className='w-full'
                                                optionLabel='name'
                                                optionValue='name'
                                                id={uniqueId}
                                                value={value ?? ""}
                                                editable
                                                options={automakesModelList}
                                                onChange={({ target }) =>
                                                    onInputChange(key, target.value)
                                                }
                                            />
                                        )}
                                    </>
                                )}

                            {type === SEARCH_FIELD_TYPE.DROPDOWN &&
                                searchForm === SEARCH_FORM_TYPE.CONTACTS && (
                                    <ComboBox
                                        className='w-full'
                                        optionLabel='name'
                                        optionValue='id'
                                        id={uniqueId}
                                        value={
                                            typeList?.find(
                                                (typeItem) => typeItem?.name === selectedType
                                            )?.id
                                        }
                                        options={typeList || []}
                                        onChange={({ target }) => {
                                            const selected = typeList?.find(
                                                (typeItem) => typeItem?.id === target.value
                                            );
                                            setSelectedType(selected?.name || "");
                                            onInputChange(key, target.value);
                                        }}
                                    />
                                )}

                            {type === SEARCH_FIELD_TYPE.TEXTAREA && (
                                <InputTextarea
                                    className='w-full'
                                    value={value ?? ""}
                                    onChange={({ target }) => onInputChange(key, target.value)}
                                    pt={{
                                        root: {
                                            style: { resize: "none", height: "140px" },
                                        },
                                    }}
                                />
                            )}

                            {value && onSearchClear && key !== DROPDOWN_TYPE.MODEL && (
                                <Button
                                    type='button'
                                    icon='pi pi-times'
                                    text
                                    className={`cursor-pointer search-dialog__clear ${type === SEARCH_FIELD_TYPE.DROPDOWN ? "search-dialog__clear--dropdown" : ""}`}
                                    onClick={() => {
                                        if (key === DROPDOWN_TYPE.TYPE) {
                                            setSelectedType("");
                                        }
                                        if (key === DROPDOWN_TYPE.MAKE) {
                                            const modelField = fields.find(
                                                (field) => field.key === "Model"
                                            );
                                            if (modelField) {
                                                onInputChange("Model" as keyof T, "");
                                            }
                                            setAutomakesList(initialAutomakesList);
                                            setAutomakesModelList([]);
                                        }
                                        onSearchClear?.(key);
                                    }}
                                />
                            )}

                            <label htmlFor={uniqueId} className='float-label'>
                                {label || key}
                            </label>
                        </span>
                    );
                })}
            </div>
        </DashboardDialog>
    );
};
