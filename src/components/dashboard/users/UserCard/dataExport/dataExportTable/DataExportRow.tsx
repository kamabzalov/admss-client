import clsx from "clsx";
import { DataExportRecord } from "common/interfaces/DataExport";
import { Row } from "react-table";

type Props = {
    row: Row<DataExportRecord>;
};

export const DataExportsRow = ({ row }: Props) => {
    return (
        <tr {...row.getRowProps()}>
            {row.cells.map((cell) => {
                return (
                    <td
                        {...cell.getCellProps()}
                        className={clsx({ "min-w-100px": cell.column.id === "actions" })}
                    >
                        {cell.column.id === "actions" ? cell.render("Cell") : cell.render("Cell")}
                    </td>
                );
            })}
        </tr>
    );
};
