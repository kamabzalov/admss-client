import React from "react";
import "./index.css";
import notFoundImage from "../not-found/404/404 page not found (1).png";

const NotFound = () => {
    return (
        <div className='not-found-container'>
            <div className='not-found-content'>
                <h2 className='not-found-header'>OOPS!</h2>
                <h1 className='not-found-title'>404</h1>
                <p className='not-found-message'>Page Not Found</p>
                <p className='not-found-description'>
                    The requested URL was not found on this server
                </p>
                <div className='not-found-buttons'>
                    <button className='back-button'>Go Back</button>
                    <button className='contact-button'>Contact Us</button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
