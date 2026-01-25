import { ReactElement } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { PhoneInput, StateDropdown, TextInput } from "dashboard/common/form/inputs";
import { ProfileAvatar } from "dashboard/profile/common/profile-avatar";
import "./index.css";
import { Splitter } from "dashboard/common/display";
import InfoIcon from "assets/images/info-icon.svg";

const INFO_MESSAGE = `At least one contact method is required - phone number or email. 
Without this information, two-factor authentication cannot be set up for the user in the future. 
If both fields are filled in, the user will be able to choose their preferred two-factor authentication method.`;

export const PersonalInformation = observer((): ReactElement => {
    const profileStore = useStore().profileStore;
    const user = useStore().userStore;
    const { profile, changeProfile } = profileStore;
    const { authUser } = user;

    return (
        <div className='user-profile__content'>
            <div className='user-profile__header'>
                <h3 className='user-profile__section-title'>Personal Information</h3>
            </div>
            <div className='user-profile-personal grid'>
                <div className='col-6 user-profile-personal__info'>
                    <TextInput
                        name='Username'
                        value={authUser?.loginname || profile?.loginname || ""}
                        disabled
                    />
                    <TextInput
                        name='Company Name'
                        value={authUser?.companyname || profile?.companyname || ""}
                        onChange={(event) => changeProfile("companyname", event.target.value)}
                    />
                    <TextInput
                        name='Location (city/state)'
                        value={profile?.locationname}
                        onChange={(event) => changeProfile("locationname", event.target.value)}
                    />
                </div>
                <div className='col-6 user-profile-personal__avatar'>
                    <ProfileAvatar />
                </div>
            </div>

            <Splitter className='col-12' />

            <div className='user-profile-contact grid'>
                <TextInput
                    name='Location (address)'
                    colWidth={6}
                    value={profile.address}
                    onChange={(event) => changeProfile("address", event.target.value)}
                />

                <StateDropdown
                    name='State'
                    showClear={!!profile.state}
                    colWidth={3}
                    value={profile.state}
                    onChange={({ value }) => changeProfile("state", value || "")}
                />
                <TextInput
                    name='Zip Code'
                    colWidth={3}
                    value={profile.zipCode}
                    onChange={(event) => changeProfile("zipCode", event.target.value)}
                />
                <PhoneInput
                    name='Phone Number'
                    colWidth={3}
                    required
                    value={profile.phoneNumber}
                    onChange={(e) => changeProfile("phoneNumber", e.target.value)}
                />
                <TextInput
                    name='E-mail'
                    colWidth={6}
                    type='email'
                    value={profile.email}
                    onChange={(e) => changeProfile("email", e.target.value)}
                />
                <div className='col-12 user-profile-info-message'>
                    <img src={InfoIcon} alt='info' className='user-profile-info-message__icon' />
                    <span className='user-profile-info-message__text'>{INFO_MESSAGE}</span>
                </div>
            </div>
        </div>
    );
});
