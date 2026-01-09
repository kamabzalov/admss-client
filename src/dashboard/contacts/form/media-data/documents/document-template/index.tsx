import { useCallback, ReactElement } from "react";
import { TruncatedText } from "dashboard/common/display";
import { Image } from "primereact/image";
import { ContactMediaItem } from "common/models/contact";
import { useStore } from "store/hooks";
import { Status } from "common/models/base-response";
import { convertDateToLocale } from "common/helpers";
import { MediaType, MEDIA_EXTENSION } from "common/models/enums";
import { useToastMessage } from "common/hooks";
import { useImagePreviewDownload, downloadFileFromDataUrl } from "dashboard/common/image-preview";

interface ContactDocumentTemplateProps extends Partial<HTMLDivElement> {
    document: Partial<ContactMediaItem>;
    setIsLoading: (isLoading: boolean) => void;
}

const SUCCESS_MESSAGE = "Document deleted successfully";
const ERROR_MESSAGE = "Failed to delete document";

export const ContactDocumentTemplate = ({
    document: { itemuid, src, notes, created, type, mediauid },
    setIsLoading,
}: ContactDocumentTemplateProps): ReactElement => {
    const { removeContactMedia, fetchDocuments, formErrorMessage } = useStore().contactStore;
    const { showSuccess, showError } = useToastMessage();

    const handleDeleteDocument = async (mediauid: string) => {
        try {
            setIsLoading(true);
            const result = await removeContactMedia(mediauid);

            if (result === Status.OK) {
                await fetchDocuments();
                showSuccess(SUCCESS_MESSAGE);
            } else {
                showError(formErrorMessage || ERROR_MESSAGE);
            }
        } catch (error) {
            showError(ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = useCallback(() => {
        if (!src) return;

        const fileName = notes ? `${notes}_${itemuid}` : `document_${itemuid}`;
        const fileExtension = type === MediaType.mtDocument ? MEDIA_EXTENSION.PDF : undefined;

        downloadFileFromDataUrl({
            dataUrl: src,
            fileName,
            fileExtension,
            onError: () => {
                showError("Failed to download document");
            },
        });
    }, [src, notes, itemuid, type, showError]);

    const handlePdfClick = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            if (!src) return;

            try {
                const dataUrlParts = src.split(",");
                const base64String = atob(dataUrlParts[1]);
                const base64Length = base64String.length;
                const bytesArray = new Uint8Array(base64Length);
                for (let byteIndex = 0; byteIndex < base64Length; byteIndex++) {
                    bytesArray[byteIndex] = base64String.charCodeAt(byteIndex);
                }
                const blob = new Blob([bytesArray], { type: "application/pdf" });
                const blobUrl = window.URL.createObjectURL(blob);
                window.open(
                    blobUrl,
                    "_blank",
                    "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                );
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                }, 1000);
            } catch (error) {
                showError("Failed to open PDF");
            }
        },
        [src, showError]
    );

    const handleDeleteClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (mediauid) {
            handleDeleteDocument(mediauid);
        }
    };

    useImagePreviewDownload({
        onDownload: handleDownload,
        enabled: type === MediaType.mtPhoto && !!src,
    });

    return (
        <figure key={itemuid} className='media-documents__item'>
            {type === MediaType.mtPhoto && (
                <Image
                    src={src}
                    alt='contact-document'
                    width='40'
                    height='40'
                    preview
                    pt={{
                        image: {
                            className: "media-documents__image",
                        },
                        previewContainer: {
                            className: "media-documents__preview-container",
                        },
                        preview: {
                            className: "media-documents__preview",
                        },
                    }}
                />
            )}
            {type === MediaType.mtDocument && (
                <div
                    className='media-documents__icon'
                    onClick={handlePdfClick}
                    style={{ cursor: "pointer" }}
                >
                    <i className='adms-pdf' />
                </div>
            )}
            <figcaption className='media-documents__info document-info'>
                <div className='document-info__item'>
                    <span className='document-info__icon'>
                        <span className='document-info__icon'>
                            <i className='pi pi-comment' />
                        </span>
                    </span>
                    <TruncatedText className='document-info__text' text={notes || ""} withTooltip />
                </div>
                <div className='document-info__item'>
                    <span className='document-info__icon'>
                        <i className='pi pi-calendar' />
                    </span>
                    <span className='document-info__text'>{convertDateToLocale(created)}</span>
                </div>
            </figcaption>
            <button className='media-documents__close' type='button' onClick={handleDeleteClick}>
                <i className='pi pi-times' />
            </button>
        </figure>
    );
};
