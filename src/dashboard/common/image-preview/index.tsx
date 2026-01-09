import { useEffect } from "react";
import { MEDIA_EXTENSION } from "common/models/enums";
import "./index.css";

interface UseImagePreviewDownloadOptions {
    onDownload: () => void;
    enabled?: boolean;
}

export const useImagePreviewDownload = ({
    onDownload,
    enabled = true,
}: UseImagePreviewDownloadOptions) => {
    useEffect(() => {
        if (!enabled) return;

        const addDownloadButton = () => {
            const toolbar = document.querySelector(".p-image-toolbar");
            if (toolbar && !toolbar.querySelector(".p-image-action-download")) {
                const closeButton = toolbar.querySelector(".p-image-action:last-child");
                if (closeButton) {
                    const downloadButton = document.createElement("button");
                    downloadButton.type = "button";
                    downloadButton.className = "p-image-action p-link p-image-action-download";
                    downloadButton.title = "Download";
                    downloadButton.innerHTML = '<i class="pi pi-download"></i>';
                    downloadButton.onclick = (e) => {
                        e.stopPropagation();
                        onDownload();
                    };
                    toolbar.insertBefore(downloadButton, closeButton);
                }
            }
        };

        const observer = new MutationObserver(() => {
            addDownloadButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        const checkInterval = setInterval(() => {
            if (document.querySelector(".p-image-preview-container")) {
                addDownloadButton();
            }
        }, 300);

        return () => {
            observer.disconnect();
            clearInterval(checkInterval);
        };
    }, [enabled, onDownload]);
};

interface DownloadFileFromDataUrlOptions {
    dataUrl: string;
    fileName: string;
    fileExtension?: string;
    onError?: (error: Error) => void;
}

export const downloadFileFromDataUrl = ({
    dataUrl,
    fileName,
    fileExtension,
    onError,
}: DownloadFileFromDataUrlOptions): void => {
    try {
        const convertDataUrlToBlob = (dataUrlString: string): Blob => {
            const dataUrlParts = dataUrlString.split(",");
            const mimeTypeMatch = dataUrlParts[0].match(/:(.*?);/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "";
            const base64String = atob(dataUrlParts[1]);
            const base64Length = base64String.length;
            const bytesArray = new Uint8Array(base64Length);
            for (let byteIndex = 0; byteIndex < base64Length; byteIndex++) {
                bytesArray[byteIndex] = base64String.charCodeAt(byteIndex);
            }
            return new Blob([bytesArray], { type: mimeType });
        };

        const fileBlob = convertDataUrlToBlob(dataUrl);
        const blobUrl = window.URL.createObjectURL(fileBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;

        let finalFileName = fileName;
        if (fileExtension) {
            finalFileName = `${fileName}.${fileExtension}`;
        } else {
            const imageMimeTypeMatch = dataUrl.match(/data:image\/([^;]+);/);
            if (imageMimeTypeMatch) {
                const detectedMimeType = imageMimeTypeMatch[1];
                let imageExtension = detectedMimeType;
                if (detectedMimeType === MEDIA_EXTENSION.JPEG) {
                    imageExtension = MEDIA_EXTENSION.JPG;
                } else if (
                    detectedMimeType !== MEDIA_EXTENSION.PNG &&
                    detectedMimeType !== MEDIA_EXTENSION.TIFF
                ) {
                    imageExtension = MEDIA_EXTENSION.PNG;
                }
                finalFileName = `${fileName}.${imageExtension}`;
            } else {
                const pdfMimeTypeMatch = dataUrl.match(/data:application\/pdf/);
                if (pdfMimeTypeMatch) {
                    finalFileName = `${fileName}.${MEDIA_EXTENSION.PDF}`;
                }
            }
        }

        downloadLink.download = finalFileName;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        if (onError) {
            onError(error as Error);
        }
    }
};
