import { TruncatedText } from "dashboard/common/display";
import { Image } from "primereact/image";
import { ContactMediaItem } from "common/models/contact";
import { useStore } from "store/hooks";
import { useToast } from "dashboard/common/toast";
import { useState } from "react";
import { Status } from "common/models/base-response";
import { convertDateToLocale } from "common/helpers";
import { MediaType } from "common/models/enums";

interface ContactDocumentTemplateProps extends Partial<HTMLDivElement> {
    document: Partial<ContactMediaItem>;
}

const SUCCESS_MESSAGE = "Document deleted successfully";
const ERROR_MESSAGE = "Failed to delete document";

export const ContactDocumentTemplate = ({
    document: { itemuid, src, notes, created, type },
}: ContactDocumentTemplateProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { removeContactMedia, fetchDocuments, formErrorMessage } = useStore().contactStore;
    const toast = useToast();

    const handleDeleteDocument = async (mediauid: string) => {
        try {
            setIsLoading(true);
            const result = await removeContactMedia(mediauid);

            if (result === Status.OK) {
                await fetchDocuments();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: SUCCESS_MESSAGE,
                });
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: formErrorMessage || ERROR_MESSAGE,
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: ERROR_MESSAGE,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <figure key={itemuid} className='media-documents__item'>
            {type === MediaType.mtPhoto && (
                <Image
                    src={src}
                    alt='contact-document'
                    width='40'
                    height='40'
                    pt={{
                        image: {
                            className: "media-documents__image",
                        },
                    }}
                />
            )}
            {type === MediaType.mtDocument && (
                <div className='media-documents__icon'>
                    <i className='pi pi-file-pdf' />
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
            <button
                className='media-documents__close'
                type='button'
                disabled={isLoading}
                onClick={() => handleDeleteDocument(itemuid || "")}
            >
                <i className='pi pi-times' />
            </button>
        </figure>
    );
};
