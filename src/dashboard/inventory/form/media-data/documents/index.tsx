import "./index.css";
import { ReactElement } from "react";
import { observer } from "mobx-react-lite";

export const DocumentsMedia = observer((): ReactElement => {
    return <div className='grid vehicle-general row-gap-2'>documents</div>;
});
