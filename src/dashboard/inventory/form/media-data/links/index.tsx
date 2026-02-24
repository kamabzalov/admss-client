import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useState, useRef, useId } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { DropdownChangeEvent } from "primereact/dropdown";
import { ComboBox } from "dashboard/common/form/dropdown";
import { TextInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { CATEGORIES } from "common/constants/media-categories";
import { Loader } from "dashboard/common/loader";
import { InputTextarea } from "primereact/inputtextarea";
import { useToast } from "dashboard/common/toast";
import { MediaLinkRowExpansionTemplate } from "dashboard/inventory/form/media-data/links/link-item";
import { MediaItem, UploadMediaLink } from "common/models/inventory";
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Status } from "common/models/base-response";
import { AxiosError } from "axios";
import { Tooltip } from "primereact/tooltip";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { MOVE_DIRECTION } from "common/constants/report-options";

const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    if (!/\./.test(url)) return false;
    const tryUrl = (u: string) => {
        try {
            new URL(u);
            return true;
        } catch {
            return false;
        }
    };
    return tryUrl(url) || tryUrl(`http://${url}`);
};

const UrlCell = ({ mediaUrl }: { mediaUrl: string }) => {
    const [isTextTruncated, setIsTextTruncated] = useState<boolean>(false);
    const urlRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId();

    useEffect(() => {
        if (urlRef.current) {
            const element = urlRef.current;
            const isTruncated = element.scrollWidth > element.clientWidth;
            setIsTextTruncated(isTruncated);
        }
    }, [mediaUrl]);

    return (
        <div ref={urlRef} className='media-links__url-ellipsis' data-tooltip-id={uniqueId}>
            {mediaUrl}
            {isTextTruncated && (
                <Tooltip
                    target={`[data-tooltip-id="${uniqueId}"]`}
                    content={mediaUrl}
                    position='mouse'
                />
            )}
        </div>
    );
};

enum ModalInfo {
    TITLE = "Are you sure?",
    BODY = "Do you really want to delete this link? This process cannot be undone.",
    ACCEPT = "Delete",
}

export const LinksMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const toast = useToast();
    const [expandedRows, setExpandedRows] = useState<MediaItem[]>([]);
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedLink, setSelectedLink] = useState<MediaItem | null>(null);
    const {
        saveInventoryLinks,
        uploadFileLinks,
        links,
        isLoading,
        fetchLinks,
        clearMedia,
        formErrorMessage,
        removeMedia,
        changeInventoryLinksOrder,
    } = store;

    useEffect(() => {
        fetchLinks();

        return () => {
            clearMedia();
        };
    }, []);

    useEffect(() => {
        if (formErrorMessage) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: formErrorMessage,
            });
        }
    }, [formErrorMessage, toast]);

    useEffect(() => {
        if (!uploadFileLinks?.mediaurl) {
            setIsUrlValid(true);
        }
    }, [uploadFileLinks?.mediaurl]);

    const handleCategorySelect = (e: DropdownChangeEvent) => {
        store.uploadFileLinks = {
            ...store.uploadFileLinks,
            contenttype: e.value,
        };
    };

    const handleCommentaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        store.uploadFileLinks = {
            ...store.uploadFileLinks,
            notes: e.target.value,
        };
    };

    const handleUrlChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const url = e.target.value;
        const isValid = url ? isValidUrl(url) : true;
        setIsUrlValid(isValid);

        store.uploadFileLinks = {
            ...uploadFileLinks,
            mediaurl: url,
        };
    };

    const handleUploadLink = async () => {
        if (formErrorMessage) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: formErrorMessage,
            });
            return;
        }

        const result = await saveInventoryLinks();
        if (!result) {
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Link added successfully",
            });
            setIsUrlValid(true);
        }
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "URL copied to clipboard",
                });
            })
            .catch(() => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to copy URL",
                });
            });
    };

    const handleNavigateToLink = (url: string) => {
        if (isValidUrl(url)) {
            let finalUrl = url;
            if (!/^https?:\/\//i.test(url)) {
                finalUrl = "https://" + url;
            }
            window.open(finalUrl, "_blank");
        } else {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Invalid URL",
            });
        }
    };

    const handleModalOpen = (link: MediaItem) => {
        setSelectedLink(link);
        setModalVisible(true);
    };

    const handleDeleteLink = async (link: MediaItem) => {
        try {
            await removeMedia(link.itemuid, () => {});
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Link deleted successfully",
            });
            await fetchLinks();
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete link",
            });
        }
    };

    const handleRowExpansionClick = (data: MediaItem) => {
        const index = expandedRows.findIndex((item) => item.itemuid === data.itemuid);
        if (index === -1) {
            setExpandedRows([...expandedRows, data]);
        } else {
            const newExpandedRows = [...expandedRows];
            newExpandedRows.splice(index, 1);
            setExpandedRows(newExpandedRows);
        }
    };

    const handleChangeOrder = async (link: MediaItem, direction: MOVE_DIRECTION) => {
        const order = link.info?.order ?? 0;
        const newOrder =
            direction === MOVE_DIRECTION.UP ? (order === 0 ? 0 : order - 1) : order + 1;
        try {
            const response = await changeInventoryLinksOrder({
                itemuid: link.itemuid,
                order: newOrder,
            });
            if (response?.status === Status.OK) {
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Link order updated successfully",
                });
                await fetchLinks();
            } else {
                Promise.reject(response?.error);
            }
        } catch (error) {
            const err = error as AxiosError;
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: err?.message || "Failed to update link order",
            });
        }
    };

    const rowExpansionTemplate = (data: MediaItem) => {
        return (
            <MediaLinkRowExpansionTemplate
                notes={data.info?.notes}
                contenttype={data.info?.contenttype}
            />
        );
    };

    const actionColumnTemplate = (rowData: MediaItem) => {
        const mediaUrl = (rowData.info as UploadMediaLink)?.mediaurl || "";
        return (
            <div className='media-links__action-row'>
                <Button
                    tooltip='Open'
                    type='button'
                    className='inventory-links__navigate-button'
                    icon='adms-open'
                    text
                    onClick={() => handleNavigateToLink(mediaUrl)}
                />
                <Button
                    tooltip='Copy'
                    type='button'
                    className='inventory-links__copy-button'
                    icon='adms-copy'
                    text
                    onClick={() => handleCopyLink(mediaUrl)}
                />
                <Button
                    tooltip='Delete'
                    type='button'
                    className='inventory-links__delete-button'
                    icon='adms-trash-can'
                    text
                    onClick={() => handleModalOpen(rowData)}
                />
            </div>
        );
    };

    const numberColumnTemplate = (rowData: MediaItem, { rowIndex }: { rowIndex: number }) => {
        return (
            <div className='media-links__expand-row'>
                <span className='media-links__number'>{rowIndex + 1}</span>
                <Button
                    tooltip='Expand'
                    type='button'
                    className={`inventory-links__expand-button ${
                        expandedRows.includes(rowData)
                            ? "inventory-links__expand-button--rotate"
                            : ""
                    }`}
                    icon='pi pi-angle-down'
                    text
                    onClick={() => handleRowExpansionClick(rowData)}
                />
            </div>
        );
    };

    const handleRowToggle = (e: DataTableRowClickEvent) => {
        setExpandedRows(e.data as MediaItem[]);
    };

    const linkControlTemplate = (rowData: MediaItem, { rowIndex }: { rowIndex: number }) => {
        const isFirst = rowIndex === 0;
        const isLast = rowIndex === links.length - 1;
        return (
            <div className='link-control p-0 flex justify-content-center'>
                <Button
                    icon='pi pi-arrow-circle-up'
                    type='button'
                    rounded
                    text
                    severity={isFirst ? "secondary" : "success"}
                    tooltip='Up'
                    className='p-button-text link-control__button'
                    disabled={isFirst}
                    onClick={() => handleChangeOrder(rowData, MOVE_DIRECTION.UP)}
                />
                <Button
                    icon='pi pi-arrow-circle-down'
                    type='button'
                    rounded
                    text
                    severity={isLast ? "secondary" : "success"}
                    disabled={isLast}
                    tooltip='Down'
                    className='p-button-text link-control__button'
                    onClick={() => handleChangeOrder(rowData, MOVE_DIRECTION.DOWN)}
                />
            </div>
        );
    };

    const urlColumnTemplate = (rowData: MediaItem) => {
        const mediaUrl = (rowData.info as UploadMediaLink)?.mediaurl || "";
        return <UrlCell mediaUrl={mediaUrl} />;
    };

    return (
        <div className='media-links grid'>
            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        className='media-links__textarea w-full'
                        value={uploadFileLinks?.mediaurl || ""}
                        onChange={handleUrlChange}
                    />
                    <label htmlFor='link'>URL</label>
                </span>
            </div>

            <div className='col-12 mt-2 media-input'>
                <ComboBox
                    className='media-input__dropdown'
                    placeholder='Category'
                    optionLabel='name'
                    optionValue='id'
                    options={[...CATEGORIES]}
                    value={uploadFileLinks?.contenttype || 0}
                    onChange={handleCategorySelect}
                />
                <TextInput
                    name='comment'
                    label='Comment'
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileLinks?.notes || ""}
                    onChange={handleCommentaryChange}
                />
                <Button
                    type='button'
                    disabled={isLoading || !isUrlValid || !uploadFileLinks?.mediaurl}
                    tooltip={!isUrlValid ? "Please enter a valid URL" : ""}
                    tooltipOptions={{ showOnDisabled: true, position: "mouse" }}
                    severity={!isUrlValid || !uploadFileLinks?.mediaurl ? "secondary" : "success"}
                    className='p-button media-input__button'
                    onClick={handleUploadLink}
                >
                    Save
                </Button>
            </div>
            <div className='media-links mt-4 col-12'>
                <div className='inventory-content w-full'>
                    {isLoading && <Loader />}
                    {!isLoading && links.length ? (
                        <DataTable
                            value={links}
                            rowExpansionTemplate={rowExpansionTemplate}
                            expandedRows={expandedRows}
                            onRowToggle={handleRowToggle}
                            className='media-links-table'
                        >
                            <Column body={linkControlTemplate} />
                            <Column header='#' body={numberColumnTemplate} />
                            <Column
                                className='media-links__url-ellipsis'
                                header='URL'
                                style={{ width: "70%", maxWidth: "34vw" }}
                                body={urlColumnTemplate}
                            />
                            <Column body={actionColumnTemplate} />
                        </DataTable>
                    ) : (
                        <div className='media-links__empty'>No links added yet.</div>
                    )}
                </div>
            </div>
            <ConfirmModal
                visible={!!modalVisible}
                position='top'
                title={ModalInfo.TITLE}
                icon='pi-times-circle'
                bodyMessage={ModalInfo.BODY}
                confirmAction={() => {
                    if (selectedLink) {
                        handleDeleteLink(selectedLink);
                        setModalVisible(false);
                        setSelectedLink(null);
                    }
                }}
                draggable={false}
                rejectLabel={"Cancel"}
                acceptLabel={ModalInfo.ACCEPT}
                className={`media-warning`}
                onHide={() => {
                    setModalVisible(false);
                    setSelectedLink(null);
                }}
            />
        </div>
    );
});
