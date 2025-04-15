import "./index.css";
import { ChangeEvent, ReactElement, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { CATEGORIES } from "common/constants/media-categories";
import { Loader } from "dashboard/common/loader";
import { InputTextarea } from "primereact/inputtextarea";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useToast } from "dashboard/common/toast";
import { MediaLinkHeaderColumn, MediaLinkItem } from "./link-item";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const LinksMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { id } = useParams();
    const toast = useToast();
    const {
        getInventory,
        saveInventoryLinks,
        uploadFileLinks,
        links,
        isLoading,
        fetchLinks,
        clearMedia,
        isFormChanged,
        formErrorMessage,
    } = store;

    useEffect(() => {
        if (id) {
            isFormChanged ? fetchLinks() : getInventory(id).then(() => fetchLinks());
        }

        return () => {
            clearMedia();
        };
    }, [fetchLinks, id]);

    useEffect(() => {
        if (formErrorMessage) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: formErrorMessage,
            });
        }
    }, [formErrorMessage, toast]);

    const handleCategorySelect = (e: DropdownChangeEvent) => {
        store.uploadFileLinks = {
            ...store.uploadFileLinks,
            contenttype: e.target.value,
        };
    };

    const handleCommentaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        store.uploadFileLinks = {
            ...store.uploadFileLinks,
            notes: e.target.value,
        };
    };

    const handleUploadLink = () => {
        if (formErrorMessage) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: formErrorMessage,
            });
            return;
        }

        saveInventoryLinks();
    };

    const layouts = {
        lg: links.map((item: any, index: number) => ({
            i: item.info?.mediauid || `${index}`,
            x: 0,
            y: index,
            w: 1,
            h: 1,
        })),
    };

    return (
        <div className='media-links grid'>
            {isLoading && <Loader overlay />}
            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        className='media-links__textarea w-full'
                        value={uploadFileLinks?.mediaurl || ""}
                        onChange={(e) => {
                            store.uploadFileLinks = {
                                ...uploadFileLinks,
                                mediaurl: e.target.value,
                            };
                        }}
                    />
                    <label htmlFor='link'>Link</label>
                </span>
            </div>

            <div className='col-12 mt-4 media-input'>
                <Dropdown
                    className='media-input__dropdown'
                    placeholder='Category'
                    optionLabel={"name"}
                    optionValue={"id"}
                    options={[...CATEGORIES]}
                    value={uploadFileLinks?.contenttype || 0}
                    onChange={handleCategorySelect}
                />
                <InputText
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileLinks?.notes || ""}
                    onChange={handleCommentaryChange}
                />
                <Button
                    severity='success'
                    type='button'
                    disabled={isLoading}
                    className='p-button media-input__button'
                    onClick={handleUploadLink}
                >
                    Save
                </Button>
            </div>
            <div className='media-links col-12'>
                <div className='inventory-content w-full'>
                    <MediaLinkHeaderColumn />
                    {links.length ? (
                        <ResponsiveReactGridLayout
                            className='layout relative w-full'
                            layouts={layouts}
                            cols={{ lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 }}
                            rowHeight={80}
                            width={1200}
                            margin={[0, 1]}
                        >
                            {links.map((item: any, index: number) => (
                                <div key={`${index}`}>
                                    <MediaLinkItem item={item} index={index} />
                                </div>
                            ))}
                        </ResponsiveReactGridLayout>
                    ) : (
                        <div className='media-links__empty'>No links added yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
});
