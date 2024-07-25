import { ReactElement } from "react";
import "./index.css";

interface InfoSectionProps {
    title: string;
    details: string[];
}

export const InfoSection = ({ title, details }: InfoSectionProps): ReactElement => {
    return (
        <div className='info-section'>
            <h3 className='info-section__title'>{title}</h3>
            <div className='info-section__details'>
                {details.map((detail, index) => {
                    const [detailTitle, detailValue] = detail.split(":");
                    return (
                        <div className='info-section__detail' key={index}>
                            <span className='info-section__detail-title'>{detailTitle}:</span>
                            <span className='info-section__detail-value'>{detailValue}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
