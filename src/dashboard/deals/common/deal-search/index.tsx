import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { QueryParams } from "common/models/query-params";
import { useState } from "react";
import { DropdownChangeEvent, DropdownProps } from "primereact/dropdown";
import { Deal } from "common/models/deals";
import { useStore } from "store/hooks";
import { DealsDataTable } from "dashboard/deals";
import { getDealsList } from "http/services/deals.service";
import { ALL_FIELDS, RETURNED_FIELD_TYPE } from "common/constants/fields";

const FIELD: keyof Deal = "contactinfo";

interface DealSearchProps extends DropdownProps {
    onRowClick?: (dealName: string) => void;
    originalPath?: string;
    returnedField?: RETURNED_FIELD_TYPE<Deal>;
    getFullInfo?: (deal: Deal) => void;
}

export const DealSearch = ({
    name,
    value,
    onRowClick,
    onChange,
    originalPath,
    returnedField,
    getFullInfo,
    ...props
}: DealSearchProps) => {
    const [options, setOptions] = useState<Deal[]>([]);
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    const handleDealInputChange = async (searchValue: string) => {
        if (!searchValue.trim()) {
            return;
        }
        const field = returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD;
        const qry = `${searchValue}.${field}`;
        const params: QueryParams = {
            qry,
        };
        const response = await getDealsList(authUser!.useruid, params);

        if (Array.isArray(response)) {
            setOptions(response);
        } else {
            setOptions([]);
        }
    };

    const handleOnRowClick = (dealName: string) => {
        onRowClick && onRowClick(dealName);
        setDialogVisible(false);
    };

    const handleGetFullInfo = (deal: Deal) => {
        getFullInfo && getFullInfo(deal);
        setDialogVisible(false);
    };

    const handleOnChange = (event: DropdownChangeEvent) => {
        const selectedValue = event.value;

        if (returnedField === ALL_FIELDS) {
            const selectedDeal = options.find((deal) => deal[FIELD] === selectedValue);

            if (selectedDeal && getFullInfo) {
                getFullInfo(selectedDeal);
            }
        }

        if (onChange) {
            onChange(event);
        }
    };

    return (
        <>
            <SearchInput
                name={name}
                title={name}
                optionValue={returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD}
                optionLabel={FIELD}
                options={options}
                onInputChange={handleDealInputChange}
                value={value}
                onChange={handleOnChange}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                {...props}
            />
            <Dialog
                header={<div className='uppercase'>Choose a Deal</div>}
                visible={dialogVisible}
                style={{ width: "75vw", height: "75vh" }}
                maximizable
                modal
                onHide={() => setDialogVisible(false)}
            >
                <DealsDataTable
                    onRowClick={handleOnRowClick}
                    originalPath={originalPath}
                    returnedField={
                        returnedField === ALL_FIELDS ? undefined : (returnedField as keyof Deal)
                    }
                    getFullInfo={handleGetFullInfo}
                />
            </Dialog>
        </>
    );
};
