import { CSSProperties, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import userCabinet from "assets/images/icons/header/user-cabinet.svg";
import "./index.css";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

interface ProfileAvatarProps {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    className?: string;
    size?: number;
    editable?: boolean;
}

export const ProfileAvatar = observer(
    ({ onClick, className, size, editable = true }: ProfileAvatarProps): ReactElement => {
        const [avatarImage, setAvatarImage] = useState<string | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const { profileStore } = useStore();

        useEffect(() => {
            setAvatarImage(profileStore.displayedLogo || null);
        }, [profileStore.displayedLogo]);

        const handleChooseClick = (e: React.MouseEvent) => {
            if (!editable) return;
            e.stopPropagation();
            fileInputRef.current?.click();
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const [file] = e.target.files || [];

            if (!file || !file.size || !editable) {
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setAvatarImage(dataUrl);
                profileStore.setLogoPreview(dataUrl);
            };
            reader.readAsDataURL(file);
            profileStore.setLogoFile(file);
        };

        const rootStyle = useMemo<React.CSSProperties | undefined>(() => {
            if (!size) {
                return undefined;
            }
            return { ["--avatar-size" as keyof CSSProperties]: `${size}px` };
        }, [size]) as CSSProperties;

        return (
            <div
                className={["profile-avatar", className].filter(Boolean).join(" ")}
                onClick={onClick}
                style={rootStyle}
            >
                <div className='profile-avatar__placeholder'>
                    <img
                        src={avatarImage || userCabinet}
                        alt='User avatar'
                        className='profile-avatar__image'
                    />
                </div>
                {editable && (
                    <>
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
                    </>
                )}
            </div>
        );
    }
);
