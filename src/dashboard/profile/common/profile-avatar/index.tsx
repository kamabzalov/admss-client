import { ReactElement, useEffect, useRef, useState } from "react";
import userCabinet from "assets/images/icons/header/user-cabinet.svg";
import "./index.css";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

interface ProfileAvatarProps {
    onClick?: () => void;
}

export const ProfileAvatar = observer(({ onClick }: ProfileAvatarProps): ReactElement => {
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { profileStore } = useStore();

    useEffect(() => {
        if (profileStore.logo) {
            setAvatarImage(profileStore.logo);
        }
    }, [profileStore.logo]);

    const handleChooseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [file] = e.target.files || [];

        if (!file || !file.size) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        profileStore.setLogoFile(file);
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
});
