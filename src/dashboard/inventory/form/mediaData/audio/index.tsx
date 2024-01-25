import "./index.css";
import { ReactElement } from "react";
// import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

export const AudioMedia = observer((): ReactElement => {
    // const store = useStore().inventoryStore;
    // const { inventory, changeInventory } = store;

    return <div className='grid vehicle-general row-gap-2'>audio</div>;
});
