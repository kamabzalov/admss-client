import { ReactElement, useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { PhoneInput, StateDropdown, TextInput } from "dashboard/common/form/inputs";
import { ProfileAvatar } from "dashboard/profile/common/profile-avatar";
import "./index.css";
import { Splitter } from "dashboard/common/display";

const INFO_MESSAGE = `At least one contact method is required - phone number or email. 
Without this information, two-factor authentication cannot be set up for the user in the future. 
If both fields are filled in, the user will be able to choose their preferred two-factor authentication method.`;

export const PersonalInformation = observer((): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;

    const [username, setUsername] = useState<string>(authUser?.loginname || "");
    const [companyName, setCompanyName] = useState<string>(authUser?.companyname || "");
    const [location, setLocation] = useState<string>(authUser?.locationname || "");
    const [address, setAddress] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [zipCode, setZipCode] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    return (
        <div className='user-profile__content'>
            <div className='user-profile__header'>
                <h3 className='user-profile__section-title'>Personal Information</h3>
            </div>
            <div className='user-profile-personal grid'>
                <div className='col-6 user-profile-personal__info'>
                    <TextInput
                        name='Username'
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <TextInput
                        name='Company Name'
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                    />
                    <TextInput
                        name='Location (city/state)'
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
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
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                />

                <StateDropdown
                    name='State'
                    showClear={!!state}
                    colWidth={3}
                    value={state}
                    onChange={({ value }) => setState(value || "")}
                />
                <TextInput
                    name='Zip Code'
                    colWidth={3}
                    value={zipCode}
                    onChange={(event) => setZipCode(event.target.value)}
                />
                <PhoneInput
                    name='Phone Number'
                    colWidth={3}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <TextInput
                    name='E-mail'
                    colWidth={6}
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div className='col-12 user-profile-info-message'>
                    <i className='adms-info user-profile-info-message__icon' />
                    <span className='user-profile-info-message__text'>{INFO_MESSAGE}</span>
                </div>
            </div>
        </div>
    );
});
