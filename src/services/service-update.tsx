import { ReactElement } from "react";
import { Card } from "primereact/card";
import image500 from "assets/images/500.svg";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { useStore } from "store/hooks";

enum SERVICE_UPDATE_MESSAGE {
    TITLE = "System Update in Progress",
    DESCRIPTION = "We’re applying a system update to bring you a faster and more stable experience. The process may take a little time. Please check back later.",
    BUTTON_TEXT = "Refresh",
}

export const ServiceUpdate = (): ReactElement => {
    const userStore = useStore().userStore;
    const navigate = useNavigate();

    const handleRefresh = (): void => {
        if (userStore.authUser) {
            navigate("/dashboard");
        } else {
            document.location.reload();
        }
    };

    return (
        <Card className='service-update card'>
            <h2 className='service-update__warning'>OOPS!</h2>
            <img className='service-update__image' src={image500} alt='500' />
            <h3 className='service-update__info'>{SERVICE_UPDATE_MESSAGE.TITLE}</h3>
            <p className='service-update__message'>{SERVICE_UPDATE_MESSAGE.DESCRIPTION}</p>
            <div className='service-update__buttons'>
                <Button className='service-update__button' onClick={handleRefresh}>
                    {SERVICE_UPDATE_MESSAGE.BUTTON_TEXT}
                </Button>
            </div>
        </Card>
    );
};
