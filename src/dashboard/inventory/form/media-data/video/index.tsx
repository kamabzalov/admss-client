import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { DropdownChangeEvent } from "primereact/dropdown";
import {
    FileUpload,
    FileUploadUploadEvent,
    ItemTemplateOptions,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
} from "primereact/fileupload";

import { Image } from "primereact/image";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { MediaLimitations } from "common/models/inventory";
import { useStore } from "store/hooks";
import { CATEGORIES, UPLOAD_TEXT } from "common/constants/media-categories";
import { Loader } from "dashboard/common/loader";
import { emptyTemplate } from "dashboard/common/form/upload";
import { ComboBox } from "dashboard/common/form/dropdown";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { generateVideoThumbnailFromFirstSeconds } from "common/utils/video-thumbnail";

const limitations: MediaLimitations = {
    formats: ["MP4", "MKV", "MOV"],
    codecs: "H.264, HEVC",
    minResolution: "1280x720 (up to 60P)",
    prefResolution: "FHD 1920x1080 (up to 60P)",
    maxResolution: "4K (up to 60P)",
    maxDuration: 300,
    maxSize: 32,
    maxUpload: 4,
    maxMediaCount: 4,
};

enum ModalInfo {
    TITLE = "Are you sure?",
    BODY = "Do you really want to delete this video file? This process cannot be undone.",
    ACCEPT = "Delete",
}

export const VideoMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        saveInventoryVideos,
        uploadFileVideos,
        videos,
        isLoading,
        removeMedia,
        fetchVideos,
        clearMedia,
    } = store;
    const [checked, setChecked] = useState<boolean>(true);
    const [videoChecked, setVideoChecked] = useState<boolean[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [videoPlayerVisible, setVideoPlayerVisible] = useState<boolean>(false);
    const [activeVideoSrc, setActiveVideoSrc] = useState<string>("");
    const [itemuid, setItemuid] = useState<string>("");
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
    const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set());
    const generatingThumbnailsRef = useRef<Set<string>>(new Set());

    const uniqueVideos = useMemo(() => {
        const videosSet = new Set();
        return videos.filter((vid) => {
            if (!vid.itemuid || videosSet.has(vid.itemuid)) return false;
            videosSet.add(vid.itemuid);
            return true;
        });
    }, [videos]);

    useEffect(() => {
        fetchVideos();

        return () => {
            clearMedia();
        };
    }, []);

    useEffect(() => {
        const uniqueVideosCount = uniqueVideos.length;
        if (uniqueVideosCount !== videoChecked.length) {
            const newCheckedState = new Array(uniqueVideosCount).fill(true);
            setVideoChecked(newCheckedState);
        }
    }, [uniqueVideos.length, videoChecked.length]);

    useEffect(() => {
        const generateThumbnails = async () => {
            for (const video of uniqueVideos) {
                if (!video.itemuid || !video.src) continue;

                setThumbnails((prev) => {
                    if (prev[video.itemuid]) {
                        generatingThumbnailsRef.current.delete(video.itemuid);
                        return prev;
                    }
                    return prev;
                });

                if (generatingThumbnailsRef.current.has(video.itemuid)) continue;

                generatingThumbnailsRef.current.add(video.itemuid);
                setLoadingThumbnails((prev) => new Set(prev).add(video.itemuid));

                try {
                    const thumbnail = await generateVideoThumbnailFromFirstSeconds(video.src, 5);
                    if (thumbnail) {
                        setThumbnails((prev) => {
                            if (prev[video.itemuid]) return prev;
                            return {
                                ...prev,
                                [video.itemuid]: thumbnail,
                            };
                        });
                    }
                } catch (error) {
                } finally {
                    generatingThumbnailsRef.current.delete(video.itemuid);
                    setLoadingThumbnails((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(video.itemuid);
                        return newSet;
                    });
                }
            }
        };

        if (uniqueVideos.length > 0) {
            generateThumbnails();
        }
    }, [uniqueVideos]);

    const handleCategorySelect = (e: DropdownChangeEvent) => {
        store.uploadFileVideos = {
            ...store.uploadFileVideos,
            data: {
                ...store.uploadFileVideos.data,
                contenttype: e.target.value,
            },
        };
    };

    const handleCommentaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        store.uploadFileVideos = {
            ...store.uploadFileVideos,
            data: {
                ...store.uploadFileVideos.data,
                notes: e.target.value,
            },
        };
    };

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        store.uploadFileVideos = {
            ...store.uploadFileVideos,
            file: e.files,
        };
        setTotalCount(e.files.length);
    };

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        setTotalCount(e.files.length);
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        const newFiles = {
            file: uploadFileVideos.file.filter((item) => item.name !== file.name),
            data: uploadFileVideos.data,
        };
        store.uploadFileVideos = newFiles;
        setTotalCount(newFiles.file.length);
        callback();
    };

    const handleUploadFiles = () => {
        saveInventoryVideos().then((res) => {
            if (res) {
                fileUploadRef.current?.clear();
            }
        });
    };

    const handleCheckedChange = (index?: number) => {
        const updatedVideoChecked = [...videoChecked];

        if (index === undefined && !checked) {
            setChecked(true);
            const allChecked = updatedVideoChecked.map(() => true);
            setVideoChecked(allChecked);
        } else if (index === undefined && checked) {
            setChecked(false);
            const allUnchecked = updatedVideoChecked.map(() => false);
            setVideoChecked(allUnchecked);
        } else if (index !== undefined) {
            const updatedCheckboxState = [...updatedVideoChecked];
            updatedCheckboxState[index] = !updatedCheckboxState[index];
            setVideoChecked(updatedCheckboxState);
        }
    };

    const handleModalOpen = (mediauid: string) => {
        setItemuid(mediauid);
        setModalVisible(true);
    };

    const handleVideoPlayerOpen = (src: string) => {
        setActiveVideoSrc(src);
        setVideoPlayerVisible(true);
    };

    const handleVideoPlayerClose = () => {
        setVideoPlayerVisible(false);
        setActiveVideoSrc("");
    };

    const handleDeleteVideo = (mediauid: string) => {
        removeMedia(mediauid, fetchVideos);
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as File;
        return (
            <div className='flex align-items-center presentation'>
                <div className='flex align-items-center'>
                    <div className='media-preview'>
                        <i className='icon adms-play-button media-preview__icon' />
                    </div>
                    <span className='presentation__label flex flex-column text-left ml-3'>
                        {file.name}
                    </span>
                </div>
                <Button
                    type='button'
                    icon='pi pi-times'
                    className='p-button presentation__remove-button'
                    onClick={() => onTemplateRemove(file, props.onRemove)}
                />
            </div>
        );
    };

    const chooseTemplate = ({ chooseButton }: FileUploadHeaderTemplateOptions) => {
        return (
            <div className='w-full flex justify-content-center flex-wrap mb-3 media-choose'>
                {totalCount ? (
                    <div className='media-choose__selected flex align-items-center'>
                        To upload more drag and drop video files
                        <span className='font-semibold mx-3'>or</span>
                        {chooseButton}
                    </div>
                ) : (
                    <>
                        {chooseButton}
                        <div className='flex w-full justify-content-center align-items-center mt-4 relative'>
                            <span className='media__upload-text-info media__upload-text-info--bold'>
                                Up to {limitations.maxUpload} items
                            </span>
                            <span className='media__upload-text-info'>
                                Maximal size is {limitations.maxSize} Mb
                            </span>
                            {limitations.formats.map((format) => (
                                <Tag key={format} className='media__upload-tag' value={format} />
                            ))}
                            <div className='media-tooltip'>
                                <InfoOverlayPanel panelTitle='Limitations:'>
                                    <p>
                                        <b> Supported codecs</b>: {limitations.codecs}
                                    </p>
                                    <p>
                                        <b>Supported formats</b>:
                                        {limitations.formats.map((format, index) => (
                                            <span key={index}>
                                                {format}
                                                {index !== limitations.formats.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </p>
                                    <p>
                                        <b>Minimal resolution</b>: {limitations.minResolution}
                                    </p>
                                    <p>
                                        <b>Preffered resolution</b>: {limitations.prefResolution}
                                    </p>
                                    <p>
                                        <b>Maximal resolution</b>: {limitations.maxResolution}
                                    </p>
                                    <p>
                                        <b>Maximal duration</b>: {limitations.maxDuration} seconds
                                    </p>
                                    <p>
                                        <b>Maximal size</b>: {limitations.maxSize} MBytes
                                    </p>
                                    <p>
                                        <b>Batch upload</b>: Up to {limitations.maxUpload} items
                                    </p>
                                </InfoOverlayPanel>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const chooseOptions = {
        className: "media__button",
        label: "Choose from files",
        icon: "none",
    };

    return (
        <div className='media grid'>
            <FileUpload
                ref={fileUploadRef}
                multiple
                accept='video/*'
                maxFileSize={limitations.maxSize * 1000000}
                onUpload={onTemplateUpload}
                headerTemplate={limitations.maxUpload > totalCount ? chooseTemplate : <div></div>}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate("video files")}
                onSelect={onTemplateSelect}
                chooseOptions={chooseOptions}
                progressBarTemplate={<></>}
                className='col-12 video-upload'
                style={{ "--upload-text": `"${UPLOAD_TEXT.VIDEO}"` } as React.CSSProperties}
            />
            <div className='col-12 mt-4 media-input'>
                <ComboBox
                    className='media-input__dropdown'
                    placeholder='Category'
                    optionLabel={"name"}
                    optionValue={"id"}
                    options={[...CATEGORIES]}
                    value={uploadFileVideos?.data?.contenttype || 0}
                    onChange={handleCategorySelect}
                />
                <InputText
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileVideos?.data?.notes || ""}
                    onChange={handleCommentaryChange}
                />
                <Button
                    severity={totalCount ? "success" : "secondary"}
                    disabled={!totalCount || isLoading}
                    className='p-button media-input__button'
                    onClick={handleUploadFiles}
                >
                    Save
                </Button>
            </div>
            <div className='col-12 media__uploaded media-uploaded'>
                <h2 className='media-uploaded__title uppercase m-0'>uploaded video files</h2>
                <span
                    className={`media-uploaded__label mx-2 uploaded-count ${
                        videos.length && "uploaded-count--blue"
                    }`}
                >
                    ({videos.length}/{limitations.maxMediaCount})
                </span>
                <hr className='media-uploaded__line flex-1' />
                <label className='cursor-pointer media-uploaded__label'>
                    <Checkbox
                        checked={checked}
                        onChange={() => {
                            setChecked(!checked);
                        }}
                        className='media-uploaded__checkbox'
                    />
                    Export to Web
                </label>
            </div>
            <div className='media-grid'>
                {isLoading && <Loader />}
                {!isLoading && uniqueVideos.length ? (
                    uniqueVideos.map(({ itemuid, src, info }, index: number) => {
                        return (
                            <div key={itemuid} className='media-item media-video__item'>
                                {checked && (
                                    <Checkbox
                                        checked={videoChecked[index]}
                                        onChange={() => handleCheckedChange(index)}
                                        className='media-uploaded__checkbox'
                                    />
                                )}
                                {loadingThumbnails.has(itemuid) ? (
                                    <div className='media-video__placeholder'>
                                        <i className='icon adms-play-prev media-video__placeholder-icon' />
                                    </div>
                                ) : (
                                    <div
                                        className='media-video__clickable'
                                        onClick={() => handleVideoPlayerOpen(src)}
                                    >
                                        <Image
                                            src={thumbnails[itemuid] || src}
                                            alt='inventory-item'
                                            width='75'
                                            height='75'
                                            pt={{
                                                image: {
                                                    className: "media-video__image",
                                                },
                                            }}
                                        />
                                    </div>
                                )}
                                <div className='media-info'>
                                    <div className='media-info__item'>
                                        <span className='media-info__icon'>
                                            <i className='pi pi-th-large' />
                                        </span>
                                        <span className='media-info__text--bold'>
                                            {
                                                CATEGORIES.find(
                                                    (category) => category.id === info?.contenttype
                                                )?.name
                                            }
                                        </span>
                                    </div>
                                    <div className='media-info__item'>
                                        <span className='media-info__icon'>
                                            <span className='media-info__icon'>
                                                <i className='pi pi-comment' />
                                            </span>
                                        </span>
                                        <span className='media-info__text'>{info?.notes}</span>
                                    </div>
                                    <div className='media-info__item'>
                                        <span className='media-info__icon'>
                                            <i className='pi pi-calendar' />
                                        </span>
                                        <span className='media-info__text'>{info?.created}</span>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    className='media-close'
                                    onClick={() => handleModalOpen(itemuid)}
                                >
                                    <i className='pi pi-times' />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className='w-full text-center'>No video files added yet.</div>
                )}
            </div>

            <ConfirmModal
                visible={!!modalVisible}
                position='top'
                title={ModalInfo.TITLE}
                icon='pi-times-circle'
                bodyMessage={ModalInfo.BODY}
                confirmAction={() => {
                    handleDeleteVideo(itemuid);
                    setModalVisible(false);
                }}
                draggable={false}
                rejectLabel={"Cancel"}
                acceptLabel={ModalInfo.ACCEPT}
                className={`media-warning`}
                onHide={() => setModalVisible(false)}
            />

            {videoPlayerVisible && (
                <div className='video-modal' onClick={handleVideoPlayerClose}>
                    <div className='video-modal__content' onClick={(e) => e.stopPropagation()}>
                        <button
                            type='button'
                            className='video-modal__close'
                            onClick={handleVideoPlayerClose}
                        >
                            <i className='pi pi-times' />
                        </button>
                        <video className='video-modal__video' controls autoPlay>
                            <source src={activeVideoSrc} type='video/mp4' />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}
        </div>
    );
});
