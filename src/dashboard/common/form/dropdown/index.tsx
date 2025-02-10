import { Dropdown, DropdownProps } from "primereact/dropdown";

interface CustomDropdownProps extends DropdownProps {}

export const ComboBox = ({ options, filter, ...props }: CustomDropdownProps) => {
    const shouldEnableFilter = options && options.length > 15;

    return <Dropdown {...props} options={options} filter={filter ?? shouldEnableFilter} />;
};
