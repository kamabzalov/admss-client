import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { TextInput } from "dashboard/common/form/inputs";
import { SwitchButton } from "dashboard/common/button";
import { ComboBox } from "dashboard/common/form/dropdown";
import { BaseResponseError, Status } from "common/models/base-response";
import { ContactTypeSetting } from "common/models/contact";
import {
    createContactTypeSetting,
    deleteContactTypeSetting,
    getContactTypeSettings,
    initContactTypeSettings,
    updateContactTypeSetting,
} from "http/services/contacts-service";
import { useStore } from "store/hooks";
import { useToastMessage } from "common/hooks";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import { CONTACT_TYPE_SETTINGS_MESSAGES } from "common/constants/settings-messages";

const MAX_TYPE_LENGTH = 109;

export enum ContactTypeCategory {
    INDIVIDUAL = "Individual",
    BUSINESS = "Business",
}

const CATEGORY_OPTIONS = [
    { label: ContactTypeCategory.INDIVIDUAL, value: ContactTypeCategory.INDIVIDUAL },
    { label: ContactTypeCategory.BUSINESS, value: ContactTypeCategory.BUSINESS },
];

export interface ContactSettingsType {
    itemuid: string;
    typeId: number;
    sortOrder: number;
    name: string;
    category: ContactTypeCategory;
    enabled: 0 | 1;
    isDefault: boolean;
}

const DEFAULT_NEW_TYPE = {
    category: ContactTypeCategory.BUSINESS,
    enabled: 1 as 0 | 1,
    isDefault: false,
};

const isErrorResponse = (response: BaseResponseError | undefined): boolean =>
    response?.status === Status.ERROR;

const mapApiItemToSettingType = (item: ContactTypeSetting): ContactSettingsType => ({
    itemuid: item.id || "",
    typeId: item.type_id,
    sortOrder: item.sort_order,
    name: item.name,
    category: item.require_personal_name
        ? ContactTypeCategory.INDIVIDUAL
        : ContactTypeCategory.BUSINESS,
    enabled: item.enabled ? 1 : 0,
    isDefault: item.is_default,
});

export const SettingsContactTypes = observer((): ReactElement => {
    const { authUser } = useStore().userStore;
    const { showError, showSuccess } = useToastMessage();
    const dealerId = authUser?.dealer_id || "0";

    const [contactTypes, setContactTypes] = useState<ContactSettingsType[]>([]);
    const [editedItemId, setEditedItemId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const [editedCategory, setEditedCategory] = useState<ContactTypeCategory | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isMutating, setIsMutating] = useState<boolean>(false);
    const newItemRowRef = useRef<HTMLDivElement>(null);
    const initializedDealerRef = useRef<string | null>(null);

    const symbolToLimit = useMemo(() => {
        const limit = MAX_TYPE_LENGTH - editedName.length;
        return Math.max(limit, 0).toString();
    }, [editedName]);

    const isNewItemEditing = useMemo(
        () => contactTypes.some((item) => item.itemuid === editedItemId && !item.name),
        [editedItemId, contactTypes]
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

    const loadContactTypes = async () => {
        setIsLoading(true);

        const response = await getContactTypeSettings(dealerId);
        if (response && isErrorResponse(response)) {
            showError(response.error || CONTACT_TYPE_SETTINGS_MESSAGES.LOAD_ERROR);
            setIsLoading(false);
            return;
        }

        if (
            response &&
            "contact_type_settings" in response &&
            Array.isArray(response.contact_type_settings)
        ) {
            const mappedItems = response.contact_type_settings
                .map(mapApiItemToSettingType)
                .sort((a, b) => a.sortOrder - b.sortOrder || a.typeId - b.typeId);

            const hasUninitializedDefaults = mappedItems.some((item) => !item.itemuid);

            if (
                (!mappedItems.length || hasUninitializedDefaults) &&
                initializedDealerRef.current !== dealerId
            ) {
                initializedDealerRef.current = dealerId;
                const initResponse = await initContactTypeSettings(dealerId);
                if (initResponse && isErrorResponse(initResponse)) {
                    showError(initResponse.error || CONTACT_TYPE_SETTINGS_MESSAGES.INIT_ERROR);
                    setContactTypes([]);
                    setIsLoading(false);
                    return;
                }

                const refreshedResponse = await getContactTypeSettings(dealerId);
                if (
                    refreshedResponse &&
                    "contact_type_settings" in refreshedResponse &&
                    Array.isArray(refreshedResponse.contact_type_settings)
                ) {
                    setContactTypes(
                        refreshedResponse.contact_type_settings
                            .map(mapApiItemToSettingType)
                            .sort((a, b) => a.sortOrder - b.sortOrder || a.typeId - b.typeId)
                    );
                } else {
                    setContactTypes([]);
                }
            } else {
                setContactTypes(mappedItems);
            }
        } else {
            setContactTypes([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        void loadContactTypes();
    }, [dealerId]);

    const handleStartEdit = (item: ContactSettingsType) => {
        if (isMutating || isLoading) {
            return;
        }

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
        setEditedCategory(item.category);
    };

    const handleSave = async (itemuid: string) => {
        const trimmedName = editedName.trim();
        if (!trimmedName) {
            return;
        }

        const item = contactTypes.find((row) => row.itemuid === itemuid);
        if (!item) {
            return;
        }

        const payload = {
            name: trimmedName,
            enabled: !!item.enabled,
            require_business_name: editedCategory === ContactTypeCategory.BUSINESS,
            require_personal_name: editedCategory === ContactTypeCategory.INDIVIDUAL,
            sort_order: item.sortOrder,
        };

        setIsMutating(true);

        if (!item.name) {
            const response = await createContactTypeSetting(dealerId, payload);
            if (response && isErrorResponse(response)) {
                showError(response.error || CONTACT_TYPE_SETTINGS_MESSAGES.CREATE_ERROR);
                setIsMutating(false);
                return;
            }

            showSuccess(CONTACT_TYPE_SETTINGS_MESSAGES.CREATE_SUCCESS);
        } else {
            const response = await updateContactTypeSetting(itemuid, payload);
            if (response && isErrorResponse(response)) {
                showError(response.error || CONTACT_TYPE_SETTINGS_MESSAGES.UPDATE_ERROR);
                setIsMutating(false);
                return;
            }

            showSuccess(CONTACT_TYPE_SETTINGS_MESSAGES.UPDATE_SUCCESS);
        }

        await loadContactTypes();
        setEditedItemId(null);
        setEditedName("");
        setEditedCategory(null);
        setIsMutating(false);
    };

    const handleAddType = () => {
        if (editedItemId || isMutating || isLoading) {
            return;
        }

        const itemuid = `custom-${Date.now()}`;
        setContactTypes((prev) => [
            ...prev,
            {
                itemuid,
                typeId: 0,
                sortOrder: prev.length + 1,
                name: "",
                ...DEFAULT_NEW_TYPE,
            },
        ]);
        setEditedItemId(itemuid);
        setEditedName("");
        setEditedCategory(null);
    };

    const handleDelete = async (item: ContactSettingsType) => {
        if (item.isDefault || !item.itemuid || isMutating || isLoading) {
            return;
        }

        setIsMutating(true);
        const response = await deleteContactTypeSetting(item.itemuid);
        if (response && isErrorResponse(response)) {
            showError(response.error || CONTACT_TYPE_SETTINGS_MESSAGES.DELETE_ERROR);
            setIsMutating(false);
            return;
        }

        showSuccess(CONTACT_TYPE_SETTINGS_MESSAGES.DELETE_SUCCESS);
        await loadContactTypes();

        if (editedItemId === item.itemuid) {
            setEditedItemId(null);
            setEditedName("");
        }
        setIsMutating(false);
    };

    const handleToggle = async (item: ContactSettingsType) => {
        if (!item.itemuid || isMutating || isLoading) {
            return;
        }

        setIsMutating(true);

        const response = await updateContactTypeSetting(
            item.itemuid,
            item.isDefault
                ? { enabled: !item.enabled }
                : {
                      enabled: !item.enabled,
                      name: item.name,
                      require_business_name: item.category === ContactTypeCategory.BUSINESS,
                      require_personal_name: item.category === ContactTypeCategory.INDIVIDUAL,
                      sort_order: item.sortOrder,
                  }
        );
        if (response && isErrorResponse(response)) {
            showError(response.error || CONTACT_TYPE_SETTINGS_MESSAGES.UPDATE_ERROR);
            setIsMutating(false);
            return;
        }

        await loadContactTypes();
        setIsMutating(false);
    };

    return (
        <>
            {isLoading && <Loader overlay />}
            <div className='flex justify-content-start mb-4 gap-3'>
                <Button
                    className='settings-form__button settings-contact__new-type'
                    outlined
                    onClick={handleAddType}
                    disabled={!!editedItemId || isLoading || isMutating}
                >
                    Add New Type
                </Button>
            </div>
            <div className='settings-contact__table'>
                <div className='settings-contact__header'>
                    <div className='settings-contact__name settings-contact__name--header'>
                        Name
                    </div>
                    <div className='settings-contact__category settings-contact__category--header'>
                        Category
                    </div>
                    <div className='settings-contact__actions' />
                </div>
                <div className='settings-contact__body'>
                    {contactTypes.map((item) => {
                        const isEditing = editedItemId === item.itemuid;
                        const isNewItem = !item.name;
                        const trimmedEditedName = editedName.trim();
                        const isSaveDisabled =
                            !trimmedEditedName ||
                            !editedCategory ||
                            (!isNewItem &&
                                trimmedEditedName === item.name &&
                                editedCategory === item.category);

                        return (
                            <div
                                className={`settings-contact__row${isEditing ? " settings-contact__row--editing" : ""}`}
                                key={item.itemuid}
                                ref={isNewItem ? newItemRowRef : undefined}
                            >
                                <div className='settings-contact__name'>
                                    {isNewItem ? (
                                        <span
                                            className='settings-contact__icon-placeholder'
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
                                            className='settings-contact__icon-button'
                                            icon='adms-edit-item'
                                            disabled={item.isDefault || isMutating || isLoading}
                                            onClick={() => handleStartEdit(item)}
                                        />
                                    )}
                                    {isEditing ? (
                                        <div className='settings-contact__row-edit'>
                                            <TextInput
                                                autoFocus={isNewItem}
                                                value={editedName}
                                                placeholder='Custom contact type'
                                                maxLength={MAX_TYPE_LENGTH}
                                                infoText={symbolToLimit}
                                                height={40}
                                                className='settings-contact__row-edit-input'
                                                onChange={(e) => setEditedName(e.target.value)}
                                            />
                                            <ComboBox
                                                className='settings-contact__row-edit-select'
                                                options={CATEGORY_OPTIONS}
                                                optionLabel='label'
                                                optionValue='value'
                                                placeholder='Select Category'
                                                height={40}
                                                value={editedCategory}
                                                onChange={(e) =>
                                                    setEditedCategory(
                                                        (e.value as ContactTypeCategory | null) ??
                                                            null
                                                    )
                                                }
                                            />
                                            <Button
                                                className='settings-contact__row-edit-button'
                                                onClick={() => void handleSave(item.itemuid)}
                                                disabled={isSaveDisabled}
                                                severity={isSaveDisabled ? "secondary" : "success"}
                                            >
                                                {item.name ? "Update" : "Save"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <span
                                            className={`settings-contact__name-text ${item.enabled ? "" : "settings-contact__name-text--disabled"}`}
                                        >
                                            {item.name}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className={`settings-contact__category ${item.enabled ? "" : "settings-contact__category-text--disabled"}`}
                                >
                                    {!isEditing && (
                                        <span className='settings-contact__category-text'>
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                <div className='settings-contact__actions'>
                                    {!isNewItem && (
                                        <>
                                            <SwitchButton
                                                small
                                                checked={!!item.enabled}
                                                onChange={() => void handleToggle(item)}
                                                tooltip={item.enabled ? "Disable" : "Enable"}
                                                tooltipOptions={{ position: "top" }}
                                                disabled={isMutating || isLoading}
                                            />
                                            <Button
                                                text
                                                tooltip='Delete'
                                                className='settings-contact__icon-button settings-contact__delete-button'
                                                icon='adms-trash-can'
                                                disabled={item.isDefault || isMutating || isLoading}
                                                onClick={() => void handleDelete(item)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
});
