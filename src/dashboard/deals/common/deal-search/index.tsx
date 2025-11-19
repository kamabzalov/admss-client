import { Dialog } from "primereact/dialog";
import { SearchInput } from "dashboard/common/form/inputs";
import { QueryParams } from "common/models/query-params";
import { useState, useRef } from "react";
import { DropdownChangeEvent, DropdownProps } from "primereact/dropdown";
import { Deal } from "common/models/deals";
import { useStore } from "store/hooks";
import { DealsDataTable } from "dashboard/deals";
import { getDealsList } from "http/services/deals.service";
import { ALL_FIELDS, RETURNED_FIELD_TYPE } from "common/constants/fields";
import { useToastMessage } from "common/hooks";
import "./index.css";

const FIELD: keyof Deal = "contactinfo";
const TIMEOUT_DELAY = 300;
enum DEAL_MESSAGE {
    NOT_FOUND_CLASS_NAME = "not-found",
    NOT_FOUND = "Deal not found.",
    NOT_FOUND_SELECTED = "Deal not found. Only existing deals can be selected in this field.",
}

interface DealSearchProps extends DropdownProps {
    onRowClick?: (dealName: string) => void;
    originalPath?: string;
    returnedField?: RETURNED_FIELD_TYPE<Deal>;
    getFullInfo?: (deal: Deal) => void;
    onClear?: () => void;
    validateOnBlur?: boolean;
    hasValidSelection?: boolean;
}

export const DealSearch = ({
    name,
    value,
    onRowClick,
    onChange,
    originalPath,
    returnedField,
    getFullInfo,
    onClear,
    validateOnBlur = false,
    hasValidSelection = false,
    ...props
}: DealSearchProps) => {
    const [options, setOptions] = useState<Deal[]>([]);
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [isSearched, setIsSearched] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isJustSelectedRef = useRef<boolean>(false);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { showWarning } = useToastMessage();

    const handleDealInputChange = async (searchValue: string) => {
        if (!searchValue.trim()) {
            setIsSearched(false);
            setOptions([]);
            return;
        }
        isJustSelectedRef.current = false;
        setIsLoading(true);
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
        setIsSearched(true);
        setIsLoading(false);
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

        if (selectedValue === DEAL_MESSAGE.NOT_FOUND) {
            return;
        }

        if (returnedField === ALL_FIELDS) {
            const selectedDeal = options.find((deal) => deal[FIELD] === selectedValue);

            if (selectedDeal && getFullInfo) {
                isJustSelectedRef.current = true;
                getFullInfo(selectedDeal);
            }
        }

        if (onChange) {
            onChange(event);
        }
        setIsSearched(false);
    };

    const handleBlur = () => {
        if (!validateOnBlur || !value || !value.trim() || isLoading) {
            return;
        }

        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
        }

        blurTimeoutRef.current = setTimeout(() => {
            if (hasValidSelection || isJustSelectedRef.current) {
                return;
            }

            showWarning(DEAL_MESSAGE.NOT_FOUND_SELECTED);
            if (onClear) {
                onClear();
            } else if (onChange) {
                onChange({ value: "" } as DropdownChangeEvent);
            }
            setIsSearched(false);
        }, TIMEOUT_DELAY);
    };

    const displayOptions =
        validateOnBlur && (isLoading || (isSearched && options.length === 0))
            ? [{ [FIELD]: DEAL_MESSAGE.NOT_FOUND } as Deal]
            : options;

    const itemTemplate = (option: Deal) => {
        const isNotFound = option[FIELD] === DEAL_MESSAGE.NOT_FOUND;
        const classNames = [isNotFound && DEAL_MESSAGE.NOT_FOUND_CLASS_NAME]
            .filter(Boolean)
            .join(" ");
        return <span className={classNames || undefined}>{option[FIELD]}</span>;
    };

    const emptyMessageText = validateOnBlur ? "" : DEAL_MESSAGE.NOT_FOUND;

    return (
        <div className='deal-search'>
            <SearchInput
                name={name}
                title={name}
                optionValue={returnedField === ALL_FIELDS ? FIELD : returnedField || FIELD}
                optionLabel={FIELD}
                options={displayOptions}
                onInputChange={handleDealInputChange}
                value={value}
                onChange={handleOnChange}
                onBlur={validateOnBlur ? handleBlur : undefined}
                emptyMessage={emptyMessageText}
                onIconClick={() => {
                    setDialogVisible(true);
                }}
                panelClassName='deal-search__panel'
                itemTemplate={itemTemplate}
                {...props}
                pt={{
                    ...props.pt,
                    emptyMessage: {
                        className: DEAL_MESSAGE.NOT_FOUND_CLASS_NAME,
                    },
                }}
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
        </div>
    );
};
