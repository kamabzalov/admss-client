import { ReactElement } from "react";
import { Card } from "primereact/card";
import image404 from "assets/images/404.svg";
import "./index.css";
import { Button } from "primereact/button";

export const NotFound = (): ReactElement => {
    return (
        <Card className='not-found card'>
            <h2 className='not-found__warning'>OOPS!</h2>
            <img className='not-found__image' src={image404} alt='404' />
            <h3 className='not-found__info'>Page not found</h3>
            <p className='not-found__message'>The requested URL was not fount on this server</p>
            <div className='not-found__buttons'>
                <Button className='not-found__button'>Go back</Button>
                <Button className='not-found__button'>Contact us</Button>
            </div>
        </Card>
    );
};
