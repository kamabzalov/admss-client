import { ReactElement } from "react";
import "./index.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const EntityCompatibilityTable = [
    {
        entity: "Deals",
        compatible: "Accounts, Contacts, Inventory",
    },
    {
        entity: "Accounts",
        compatible: "Deals, Contacts, Inventory",
    },
    {
        entity: "Contacts",
        compatible: "Deals, Accounts",
    },
    {
        entity: "Inventory",
        compatible: "Deals, Accounts",
    },
];

export const DataSetInfoTemplate = (): ReactElement => {
    return (
        <section className='dataset-info__wrapper'>
            <p className='dataset-info__text'>
                You can add columns from
                <span className='dataset-info__highlight'>Deals, Accounts, Contacts</span>, and
                <span className='dataset-info__highlight'>Inventory</span>.
                <br />
                The
                <span className='dataset-info__highlight'>
                    first column you add determines the primary entity
                </span>
                — the report will be grouped and generated based on that entity.
                <br />
                For example:
            </p>
            <ul className='dataset-info__list dataset-list'>
                <li className='dataset-list__item'>
                    If the first column is from Deals and a deal has 3 linked contacts, the report
                    will show 1 row per deal.
                </li>
                <li className='dataset-list__item'>
                    If the first column is from Contacts, it will show 1 row per contact.
                </li>
            </ul>
            <p className='dataset-info__text pt-3'>
                <span className='dataset-info__highlight'>Entity Compatibility:</span>
            </p>
            <p className='dataset-info__text'>
                Each report can only include entities that are directly linked. Use the guide below
                to avoid invalid combinations:
            </p>

            <DataTable
                showGridlines
                className='dataset-info__table'
                value={EntityCompatibilityTable}
                tableStyle={{ width: "100%" }}
            >
                <Column field='entity' header='Entity' style={{ width: "26%" }} />
                <Column field='compatible' header='Compatible with' />
            </DataTable>
            <p className='dataset-info__text'>
                <span className='dataset-info__highlight'>Example:</span>
                Contacts + Inventory is not allowed (no direct relationship).
            </p>
            <p className='dataset-info__text pt-3'>
                <span className='dataset-info__highlight'>
                    Make sure to select the primary column first and then only add compatible
                    entities to avoid errors!
                </span>
            </p>
        </section>
    );
};
