import { BorderedCheckbox } from "dashboard/common/form/inputs";
import "./index.css";
import { useState } from "react";

export const SettingsInventoryDefaults = () => {
    const [settings, setSettings] = useState<any>({});

    const handleChange = (name: string, checked: boolean) => {
        setSettings({ ...settings, [name]: checked });
    };

    return (
        <div className='settings-inventory-default'>
            <BorderedCheckbox
                name='Mark Inventory PAID by default'
                checked={settings.markInventoryPaidByDefault}
                onChange={(e) => handleChange("markInventoryPaidByDefault", !!e.target.checked)}
            />
            <BorderedCheckbox
                name='Mark Inventory TITLE RECEIVED by default'
                checked={settings.markInventoryTitleReceivedByDefault}
                onChange={(e) =>
                    handleChange("markInventoryTitleReceivedByDefault", !!e.target.checked)
                }
            />
            <BorderedCheckbox
                name='Mark Inventory EXPORT TO WEB by default'
                checked={settings.markInventoryExportToWebByDefault}
                onChange={(e) =>
                    handleChange("markInventoryExportToWebByDefault", !!e.target.checked)
                }
            />
            <BorderedCheckbox
                name='Mark Expenses DO NOT BILL by default'
                checked={settings.markExpensesDoNotBillByDefault}
                onChange={(e) => handleChange("markExpensesDoNotBillByDefault", !!e.target.checked)}
            />
            <BorderedCheckbox
                name='Mark Expenses DO NOT POST by default'
                checked={settings.markExpensesDoNotPostByDefault}
                onChange={(e) => handleChange("markExpensesDoNotPostByDefault", !!e.target.checked)}
            />
        </div>
    );
};
