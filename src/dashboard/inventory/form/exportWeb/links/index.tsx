import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";

export const ExportWebLinks = observer((): ReactElement => {
    return (
        <div className='grid export-web-links row-gap-2'>
            <InputTextarea
                placeholder='VDP Link (Vehicle Detail Page)'
                className='w-full export-web-links__text-area'
                pt={{
                    root: {
                        style: {
                            height: "100px",
                        },
                    },
                }}
            />

            <hr className='form-line' />

            <div className='col-12'>
                <InputTextarea
                    placeholder='Video URL'
                    className='w-full export-web-links__text-area'
                    pt={{
                        root: {
                            style: {
                                height: "100px",
                            },
                        },
                    }}
                />
            </div>
            <div className='col-12'>
                <InputTextarea
                    placeholder='Photo URL'
                    className='w-full export-web-links__text-area'
                    pt={{
                        root: {
                            style: {
                                height: "100px",
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
});
