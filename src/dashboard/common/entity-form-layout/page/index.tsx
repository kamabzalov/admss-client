import { ReactElement, ReactNode } from "react";
import { Button } from "primereact/button";

interface EntityFormPageProps {
    onClose: () => void;
    children: ReactNode;
}

export const EntityFormPage = ({ onClose, children }: EntityFormPageProps): ReactElement => {
    return (
        <div className='grid relative entity-form-page'>
            <Button icon='pi pi-times' className='p-button close-button' onClick={onClose} />
            <div className='col-12'>{children}</div>
        </div>
    );
};

interface EntityFormCardProps {
    entityClassName: string;
    children: ReactNode;
}

export const EntityFormCard = ({
    entityClassName,
    children,
}: EntityFormCardProps): ReactElement => {
    return <div className={`card ${entityClassName} entity-form-card`}>{children}</div>;
};

interface EntityFormContentProps {
    children: ReactNode;
}

export const EntityFormContent = ({ children }: EntityFormContentProps): ReactElement => {
    return <div className='card-content entity-form-content'>{children}</div>;
};

interface EntityFormBodyProps {
    sidebar: ReactNode;
    children: ReactNode;
}

export const EntityFormBody = ({ sidebar, children }: EntityFormBodyProps): ReactElement => {
    return (
        <div className='flex flex-nowrap entity-form-body'>
            <div className='entity-form-sidebar card-content__wrapper p-0'>{sidebar}</div>
            <div className='entity-form-main card-content__wrapper p-0 flex flex-column'>
                {children}
            </div>
        </div>
    );
};
