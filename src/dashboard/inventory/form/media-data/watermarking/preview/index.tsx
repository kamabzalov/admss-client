import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { getMediaWatermarkingPreview } from "http/services/media.service";
import { useParams } from "react-router-dom";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";

interface ImagePreviewProps {
    onClose: () => void;
}

export const ImagePreview = ({ onClose }: ImagePreviewProps): ReactElement => {
    const { id } = useParams();
    const toast = useToast();

    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);

    const handleGetPreviewImage = async () => {
        if (id) {
            const data = await getMediaWatermarkingPreview(id);
            if (data?.status === Status.OK) {
                const image = data as unknown as string;
                setPreviewImage(image);
            } else {
                toast?.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: data?.error,
                });
            }
        }
    };

    useEffect(() => {
        handleGetPreviewImage();
    }, [id]);

    return (
        <div className='preview-overlay' onClick={onClose}>
            <div className='preview-container' onClick={(e) => e.stopPropagation()}>
                <img src={previewImage} alt='Watermark Preview' className='preview-image' />
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
