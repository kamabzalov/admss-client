import "./index.css";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState, useRef, useMemo } from "react";
import { Tooltip } from "primereact/tooltip";
import { Loader } from "dashboard/common/loader";
import { useToast } from "dashboard/common/toast";
import { useStore } from "store/hooks";
import { getHowToKnowList, setHowToKnow, deleteHowToKnow } from "http/services/deals.service";
import { HowToKnow } from "common/models/deals";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { TextInput } from "dashboard/common/form/inputs";

const NEW_ITEM = "new";
const DESCRIPTION_MAX_LENGTH = 127;
const WINDOW_WIDTH_LIMIT = 1665;

export const SettingsOther = (): ReactElement => {
    const toast = useToast();
    const store = useStore().userStore;
    const { authUser } = store;

    const [howToKnowList, setHowToKnowList] = useState<Partial<HowToKnow>[]>([]);
    const [editedItem, setEditedItem] = useState<Partial<HowToKnow>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const newInputRef = useRef<HTMLInputElement>(null);

    const handleGetUserHowKnowList = async () => {
        if (!authUser) return;
        setIsLoading(true);
        const response = await getHowToKnowList(authUser.useruid);
        if (Array.isArray(response) && response.length) {
            setHowToKnowList(response);
        } else {
            setHowToKnowList([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        handleGetUserHowKnowList();
    }, [authUser]);

    const symbolToLimit = useMemo(() => {
        if (!editedItem.description) return DESCRIPTION_MAX_LENGTH.toString();
        const limit = DESCRIPTION_MAX_LENGTH - editedItem.description.length;
        return limit.toString();
    }, [editedItem.description]);

    const handleSaveHowKnow = async () => {
        if (
            !authUser ||
            !editedItem.description ||
            editedItem.description.length > DESCRIPTION_MAX_LENGTH
        )
            return;
        setIsLoading(true);

        const itemToSave = {
            description: editedItem.description,
            itemuid: editedItem.itemuid === NEW_ITEM ? "0" : editedItem.itemuid,
        };

        const response = await setHowToKnow(authUser.useruid, itemToSave);
        if (response?.status === Status.ERROR) {
            toast.current?.show({
                severity: "error",
                summary: Status.ERROR,
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Item saved successfully",
                life: TOAST_LIFETIME,
            });
            const updatedList = await getHowToKnowList(authUser.useruid);
            if (Array.isArray(updatedList)) {
                setHowToKnowList(updatedList);
            }
            setEditedItem({});
        }
        setIsLoading(false);
    };

    const handleDeleteHowKnow = async (item: Partial<HowToKnow>) => {
        if (!authUser || !item.itemuid || item.itemuid === NEW_ITEM) return;
        setIsLoading(true);

        const response = await deleteHowToKnow(item.itemuid);
        if (response?.status === Status.ERROR) {
            toast.current?.show({
                severity: "error",
                summary: Status.ERROR,
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            const updatedList = howToKnowList.filter((i) => i.itemuid !== item.itemuid);
            setHowToKnowList(updatedList);
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Item deleted successfully",
                life: TOAST_LIFETIME,
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (editedItem.itemuid === NEW_ITEM && newInputRef.current) {
            newInputRef.current.focus();
        }
    }, [editedItem]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const needsTooltip = useMemo(() => {
        return windowWidth < WINDOW_WIDTH_LIMIT;
    }, [windowWidth]);

    return (
        <div className='settings-form'>
            {isLoading && <Loader overlay />}
            <div className='settings-form__title'>Other</div>
            <div className='flex justify-content-end mb-4'>
                <Button
                    className='settings-form__button'
                    outlined
                    onClick={() => {
                        setEditedItem({
                            description: "",
                            itemuid: NEW_ITEM,
                        });
                    }}
                >
                    New Example
                </Button>
            </div>
            <div className='grid settings-other p-2'>
                <div className='col-12'>
                    <div className='settings-other__header grid'>
                        <div className='col-10 flex settings-other__header-row align-items-center'>
                            How did you hear about us?
                        </div>
                        <div className='col-2 flex align-items-center p-0'>Action</div>
                    </div>
                    <div className='settings-other__body grid'>
                        {howToKnowList.map((item) => (
                            <div key={item.itemuid} className='settings-other__row'>
                                <div className='col-10 flex align-items-center p-0'>
                                    {editedItem.itemuid === item.itemuid ? (
                                        <div className='flex row-edit'>
                                            <TextInput
                                                wrapperClassName='row-edit__input-wrapper'
                                                maxLength={DESCRIPTION_MAX_LENGTH}
                                                value={editedItem.description || ""}
                                                className='row-edit__input validated-input'
                                                infoText={symbolToLimit}
                                                onChange={(e) =>
                                                    setEditedItem({
                                                        ...editedItem,
                                                        description: e.target.value,
                                                    })
                                                }
                                            />
                                            <Button
                                                className='p-button row-edit__button'
                                                onClick={handleSaveHowKnow}
                                                disabled={
                                                    !editedItem.description ||
                                                    editedItem.description.length >
                                                        DESCRIPTION_MAX_LENGTH
                                                }
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className={`description-text ${
                                                    needsTooltip
                                                        ? `description-text--tooltip-${item.itemuid}`
                                                        : ""
                                                }`}
                                            >
                                                {item.description}
                                            </div>
                                            {needsTooltip && (
                                                <Tooltip
                                                    target={`.description-text--tooltip-${item.itemuid}`}
                                                    content={item.description}
                                                    position='mouse'
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className='col-2 p-0 settings-other__actions'>
                                    <Button
                                        className='settings-other__edit-button'
                                        outlined
                                        onClick={() =>
                                            editedItem.itemuid
                                                ? setEditedItem({})
                                                : setEditedItem(item)
                                        }
                                        disabled={
                                            !item.itemuid ||
                                            !!item.isdefault ||
                                            item.itemuid === NEW_ITEM
                                        }
                                        severity={
                                            !item.itemuid ||
                                            item.itemuid === NEW_ITEM ||
                                            !!item.isdefault
                                                ? "secondary"
                                                : "success"
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className='settings-other__delete-button'
                                        outlined
                                        onClick={() => handleDeleteHowKnow(item)}
                                        disabled={
                                            !item.itemuid ||
                                            !!item.isdefault ||
                                            item.itemuid === NEW_ITEM
                                        }
                                        severity={
                                            !item.itemuid ||
                                            item.itemuid === NEW_ITEM ||
                                            !!item.isdefault
                                                ? "secondary"
                                                : "danger"
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {editedItem.itemuid === NEW_ITEM && (
                            <div className='settings-other__row'>
                                <div className='col-10 flex align-items-center p-0'>
                                    <div className='flex row-edit'>
                                        <TextInput
                                            value={editedItem.description || ""}
                                            wrapperClassName='row-edit__input-wrapper'
                                            infoText={symbolToLimit}
                                            className='row-edit__input'
                                            maxLength={DESCRIPTION_MAX_LENGTH}
                                            onChange={(e) =>
                                                setEditedItem({
                                                    ...editedItem,
                                                    description: e.target.value,
                                                })
                                            }
                                            ref={newInputRef}
                                        />
                                        <Button
                                            className='p-button row-edit__button'
                                            onClick={handleSaveHowKnow}
                                            disabled={!editedItem.description}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                                <div className='col-2 p-0 settings-other__actions'>
                                    <Button
                                        className='settings-other__edit-button'
                                        outlined
                                        disabled
                                        severity='secondary'
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className='settings-other__delete-button'
                                        outlined
                                        disabled
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
