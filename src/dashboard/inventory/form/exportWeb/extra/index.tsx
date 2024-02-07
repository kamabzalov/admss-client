import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";

export const ExportWebExtra = observer((): ReactElement => {
    return (
        <div className='grid export-web-extra row-gap-2'>
            <div className='col-12'>
                <InputTextarea
                    placeholder='Extra field 1'
                    className='w-full export-web-extra__text-area'
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
                    placeholder='Extra field 2'
                    className='w-full export-web-extra__text-area'
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
                    placeholder='Extra field 3'
                    className='w-full export-web-extra__text-area'
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
