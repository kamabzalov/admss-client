import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { getMediaWatermarkingPreview } from "http/services/media.service";
import { useParams } from "react-router-dom";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { Image } from "primereact/image";
import { Loader } from "dashboard/common/loader";

interface ImagePreviewProps {
    onClose: () => void;
}

export const ImagePreview = ({ onClose }: ImagePreviewProps): ReactElement => {
    const { id } = useParams();
    const toast = useToast();

    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

    const handleGetPreviewImage = async () => {
        if (id) {
            setIsLoading(true);
            setIsImageLoaded(false);
            const data = await getMediaWatermarkingPreview(id);
            if (data?.status !== Status.ERROR) {
                setPreviewImage(data?.data);
            } else {
                toast?.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: data?.error,
                });
                onClose();
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetPreviewImage();
    }, [id]);

    return (
        <div className='preview-overlay' onClick={onClose}>
            <div className='preview-container p-6' onClick={(e) => e.stopPropagation()}>
                {isLoading ? (
                    <Loader />
                ) : (
                    <div>
                        {!isImageLoaded && <Loader />}
                        <Image
                            src={previewImage}
                            alt='Watermark Preview'
                            onLoad={() => setIsImageLoaded(true)}
                            className='preview-image'
                        />
                    </div>
                )}
                <Button
                    icon='pi pi-times'
                    text
                    className='preview-close-button'
                    onClick={onClose}
                />
            </div>
        </div>
    );
};
