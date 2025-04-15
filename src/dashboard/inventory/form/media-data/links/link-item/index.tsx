import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement } from "react";

interface MediaLinkItemProps {
    item: any;
    index: number;
    editedItem?: any;
    setEditedItem?: (item: any) => void;
    handleSetOrder?: (link: any, newOrder: number) => Promise<void>;
    handleSaveLink?: (link: any) => void;
    handleDeleteLink?: (linkuid: string) => void;
    totalOffset?: number;
}

export const MediaLinkHeaderColumn = (): ReactElement => (
    <div className='media-link__header col-12 grid m-0'>
        <div className='media-link__number media-link__number--left'>#</div>
        <div className='media-link__name justify-content-start'>URL</div>
    </div>
);

export const MediaLinkItem = observer(
    ({
        item,
        index,
        editedItem,
        setEditedItem,
        handleSaveLink,
        handleSetOrder,
        handleDeleteLink,
        totalOffset = 0,
    }: MediaLinkItemProps): ReactElement => (
        <div
            key={item.itemuid}
            className={`media-link__row ${index < totalOffset / 2 ? "justify-content-start" : "justify-content-end media-link__row--right"} grid col-12`}
        >
            <div className='col-1 link-control p-0 flex justify-content-center'>
                <Button
                    icon='pi pi-arrow-circle-up'
                    type='button'
                    rounded
                    text
                    severity='success'
                    tooltip='To the top'
                    className='p-button-text link-control__button'
                />
                <Button
                    icon='pi pi-arrow-circle-down'
                    type='button'
                    rounded
                    text
                    severity='success'
                    tooltip='To the bottom'
                    className='p-button-text link-control__button'
                />
            </div>
            <div className='col-1'>{index + 1}</div>
            <div className='col-8 p-0 flex align-items-center'>{item.info?.mediaurl}</div>
            <div className='col-2 p-0 link-control'>
                <Button
                    tooltip='Edit link'
                    type='button'
                    className='inventory-links__edit-button'
                    icon='icon adms-edit-item'
                    text
                />
                <Button
                    tooltip='Delete link'
                    type='button'
                    className='inventory-links__delete-button'
                    icon='icon adms-trash-can'
                    text
                />
            </div>
        </div>
    )
);
