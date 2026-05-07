import "./index.css";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { TextInput } from "dashboard/common/form/inputs";
import { SwitchButton } from "dashboard/common/button";
import { LeadServiceType } from "common/models/export-web";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";

const MAX_TYPE_LENGTH = 109;
const TABS = [{ header: "Service Types" }];
const DEFAULT_SERVICE_TYPES = [
    "Car Repair",
    "Scheduled Maintenance",
    "State Inspection",
    "Other Services",
];

const buildDefaultRows = (): LeadServiceType[] =>
    DEFAULT_SERVICE_TYPES.map((name, index) => ({
        itemuid: `default-${index + 1}`,
        name,
        enabled: 1,
        isDefault: true,
    }));

export const SettingsLeadSettings = (): ReactElement => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [serviceTypes, setServiceTypes] = useState<LeadServiceType[]>(buildDefaultRows);
    const [editedItemId, setEditedItemId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const newItemRowRef = useRef<HTMLDivElement>(null);

    const symbolToLimit = useMemo(() => {
        const limit = MAX_TYPE_LENGTH - editedName.length;
        return Math.max(limit, 0).toString();
    }, [editedName]);

    const isNewItemEditing = useMemo(
        () => serviceTypes.some((item) => item.itemuid === editedItemId && !item.name),
        [editedItemId, serviceTypes]
    );

    useEffect(() => {
        if (!isNewItemEditing) {
            return;
        }

        requestAnimationFrame(() => {
            const row = newItemRowRef.current;
            row?.scrollIntoView({ block: "nearest", inline: "nearest" });
            row?.querySelector("input")?.focus();
        });
    }, [isNewItemEditing]);

    const handleStartEdit = (item: LeadServiceType) => {
        if (item.isDefault) {
            return;
        }

        if (editedItemId === item.itemuid) {
            setEditedItemId(null);
            setEditedName("");
            return;
        }

        setEditedItemId(item.itemuid);
        setEditedName(item.name);
    };

    const handleSave = (itemuid: string) => {
        const trimmedName = editedName.trim();
        if (!trimmedName) {
            return;
        }

        setServiceTypes((prev) =>
            prev.map((item) => (item.itemuid === itemuid ? { ...item, name: trimmedName } : item))
        );
        setEditedItemId(null);
        setEditedName("");
    };

    const handleAddType = () => {
        if (editedItemId) {
            return;
        }

        const itemuid = `custom-${Date.now()}`;
        setServiceTypes((prev) => [
            ...prev,
            {
                itemuid,
                name: "",
                enabled: 1,
                isDefault: false,
            },
        ]);
        setEditedItemId(itemuid);
        setEditedName("");
    };

    const handleDelete = (item: LeadServiceType) => {
        if (item.isDefault) {
            return;
        }

        setServiceTypes((prev) => prev.filter((type) => type.itemuid !== item.itemuid));
        if (editedItemId === item.itemuid) {
            setEditedItemId(null);
            setEditedName("");
        }
    };

    const handleToggle = (itemuid: string) => {
        setServiceTypes((prev) =>
            prev.map((item) =>
                item.itemuid === itemuid ? { ...item, enabled: item.enabled ? 0 : 1 } : item
            )
        );
    };

    return (
        <SettingsSection title='Lead settings' className='settings-lead'>
            <TabView
                className='settings-lead__tabs'
                activeIndex={activeTab}
                onTabChange={(e) => setActiveTab(e.index)}
            >
                {TABS.map((tab) => (
                    <TabPanel
                        key={tab.header}
                        header={tab.header}
                        pt={{
                            header: {
                                className: "heading-condensed",
                            },
                        }}
                    >
                        <div className='flex justify-content-start mb-4'>
                            <Button
                                className='settings-form__button settings-lead__new-type'
                                outlined
                                onClick={handleAddType}
                                disabled={!!editedItemId}
                            >
                                Add New Type
                            </Button>
                        </div>
                        <div className='settings-lead__table'>
                            <div className='settings-lead__header'>
                                <div className='settings-lead__type settings-lead__type--header'>
                                    Type
                                </div>
                                <div className='settings-lead__actions'></div>
                            </div>
                            <div className='settings-lead__body'>
                                {serviceTypes.map((item) => {
                                    const isEditing = editedItemId === item.itemuid;
                                    const isNewItem = !item.name;
                                    const trimmedEditedName = editedName.trim();
                                    const isSaveDisabled =
                                        !trimmedEditedName ||
                                        (!isNewItem && trimmedEditedName === item.name);
                                    return (
                                        <div
                                            className='settings-lead__row'
                                            key={item.itemuid}
                                            ref={isNewItem ? newItemRowRef : undefined}
                                        >
                                            <div className='settings-lead__type'>
                                                {isNewItem ? (
                                                    <span
                                                        className='settings-lead__icon-placeholder'
                                                        aria-hidden='true'
                                                    />
                                                ) : (
                                                    <Button
                                                        text
                                                        tooltip={
                                                            item.isDefault
                                                                ? "Default type cannot be edited"
                                                                : "Edit type"
                                                        }
                                                        className='settings-lead__icon-button'
                                                        icon='adms-edit-item'
                                                        disabled={item.isDefault}
                                                        onClick={() => handleStartEdit(item)}
                                                    />
                                                )}
                                                {isEditing ? (
                                                    <div className='settings-lead__row-edit'>
                                                        <TextInput
                                                            autoFocus={isNewItem}
                                                            value={editedName}
                                                            maxLength={MAX_TYPE_LENGTH}
                                                            infoText={symbolToLimit}
                                                            height={40}
                                                            className='settings-lead__row-edit-input'
                                                            onChange={(e) =>
                                                                setEditedName(e.target.value)
                                                            }
                                                        />
                                                        <Button
                                                            className='settings-lead__row-edit-button'
                                                            onClick={() => handleSave(item.itemuid)}
                                                            disabled={isSaveDisabled}
                                                            severity={
                                                                isSaveDisabled
                                                                    ? "secondary"
                                                                    : "success"
                                                            }
                                                        >
                                                            {item.name ? "Update" : "Save"}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className={`settings-lead__type-text ${item.enabled ? "" : "settings-lead__type-text--disabled"}`}
                                                    >
                                                        {item.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className='settings-lead__actions'>
                                                {!isNewItem && (
                                                    <>
                                                        <SwitchButton
                                                            small
                                                            checked={!!item.enabled}
                                                            onChange={() =>
                                                                handleToggle(item.itemuid)
                                                            }
                                                            tooltip={
                                                                item.enabled ? "Disable" : "Enable"
                                                            }
                                                            tooltipOptions={{ position: "top" }}
                                                        />
                                                        <Button
                                                            text
                                                            tooltip={"Delete"}
                                                            className='settings-lead__icon-button settings-lead__delete-button'
                                                            icon='adms-trash-can'
                                                            disabled={item.isDefault}
                                                            onClick={() => handleDelete(item)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabPanel>
                ))}
            </TabView>
        </SettingsSection>
    );
};
