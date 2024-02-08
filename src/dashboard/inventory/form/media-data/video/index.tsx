import "./index.css";
import { ReactElement } from "react";
import { observer } from "mobx-react-lite";

export const VideoMedia = observer((): ReactElement => {
    return <div className='grid vehicle-general row-gap-2'>video</div>;
});
