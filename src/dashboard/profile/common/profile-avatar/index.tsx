import { ReactElement } from "react";
import userCabinet from "assets/images/icons/header/user-cabinet.svg";
import "./index.css";

interface ProfileAvatarProps {
    onClick?: () => void;
}

export const ProfileAvatar = ({ onClick }: ProfileAvatarProps): ReactElement => {
    return (
        <div className='profile-avatar' onClick={onClick}>
            <div className='profile-avatar__placeholder'>
                <img src={userCabinet} alt='User avatar' className='profile-avatar__image' />
            </div>
            <div className='profile-avatar__choose'>
                <i className='pi pi-camera' />
            </div>
        </div>
    );
};
