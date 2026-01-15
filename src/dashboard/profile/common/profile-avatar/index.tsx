import { ReactElement, useRef, useState } from "react";
import userCabinet from "assets/images/icons/header/user-cabinet.svg";
import "./index.css";

interface ProfileAvatarProps {
    onClick?: () => void;
}

export const ProfileAvatar = ({ onClick }: ProfileAvatarProps): ReactElement => {
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChooseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='profile-avatar' onClick={onClick}>
            <div className='profile-avatar__placeholder'>
                <img
                    src={avatarImage || userCabinet}
                    alt='User avatar'
                    className='profile-avatar__image'
                />
            </div>
            <div className='profile-avatar__choose' onClick={handleChooseClick}>
                <i className='pi pi-camera' />
            </div>
            <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </div>
    );
};
