import { InputText } from "primereact/inputtext";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { useState } from "react";
import "./index.css";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";
import { TabPanel, TabView } from "primereact/tabview";
import { RadioButtonProps } from "primereact/radiobutton";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { Splitter } from "dashboard/common/display";
import { CurrencyInput, DashboardRadio, PercentInput } from "dashboard/common/form/inputs";

const ACCOUNT_NUMBER_OPTIONS: RadioButtonProps[] = [
    {
        name: "accountSequentialNumber",
        title: "Sequential Number",
        value: 0,
    },
    {
        name: "accountStockNumber",
        title: "Stock Number",
        value: 1,
    },
];

export enum NOTES_HINT_BODY {
    PANEL_TITLE = "Note it",
    INTRO = "Account number is generated automatically based on the selected rule.",
    SEQUENTIAL_BODY = "uses the fields below to generate a number, for example ACC000042-A.",
    STOCK_BODY = "uses the stock number from the linked inventory vehicle, for example STK-10245.",
}

const AccountNumberHintContent = () => (
    <>
        <p className='py-2'>{NOTES_HINT_BODY.INTRO}</p>
        <p className='pb-2'>
            <b>Sequential Number:</b> {NOTES_HINT_BODY.SEQUENTIAL_BODY}
        </p>
        <p className='pb-2'>
            <b>Stock Number:</b> {NOTES_HINT_BODY.STOCK_BODY}
        </p>
    </>
);

export const SettingsAccount = observer(() => {
    const store = useStore().generalSettingsStore;
    const { settings, changeSettings } = store;
    const [activeTab, setActiveTab] = useState(0);
    const accountNumberStrategy = settings.accountNumberStrategy ?? 0;
    const isStockNumberStrategy = accountNumberStrategy === 1;

    return (
        <SettingsSection title='Account Settings' className='settings-account'>
            <TabView
                className='settings-account__tabs'
                activeIndex={activeTab}
                onTabChange={(e) => setActiveTab(e.index)}
            >
                <TabPanel
                    header='Account number'
                    pt={{
                        header: {
                            className: "heading-condensed",
                        },
                    }}
                >
                    <div className='grid'>
                        <div className='col-12'>
                            <DashboardRadio
                                wrapperClassName='flex-row w-full'
                                justifyContent='start'
                                radioArray={ACCOUNT_NUMBER_OPTIONS}
                                initialValue={accountNumberStrategy}
                                onChange={(v) => {
                                    if (v !== null) {
                                        changeSettings("accountNumberStrategy", Number(v));
                                    }
                                }}
                            />
                        </div>
                        <Splitter
                            className='col-12 py-3'
                            children={
                                <InfoOverlayPanel
                                    panelTitle={NOTES_HINT_BODY.PANEL_TITLE}
                                    className='settings-account__info'
                                    disableHover
                                    disablePulse
                                >
                                    <AccountNumberHintContent />
                                </InfoOverlayPanel>
                            }
                        />
                        <div className='col-3'>
                            <span className='p-float-label'>
                                <InputText
                                    className='settings-account__input'
                                    value={settings.accountPrefix || ""}
                                    onChange={(e) =>
                                        changeSettings("accountPrefix", e.target.value)
                                    }
                                    disabled={isStockNumberStrategy}
                                />
                                <label className='float-label'>Prefix</label>
                            </span>
                        </div>
                        <div className='col-3'>
                            <span className='p-float-label'>
                                <InputNumber
                                    value={settings.accountFixedDigits ?? 0}
                                    min={0}
                                    max={10}
                                    onChange={(e: InputNumberChangeEvent) =>
                                        changeSettings("accountFixedDigits", Number(e.value))
                                    }
                                    className='w-full'
                                    disabled={isStockNumberStrategy}
                                />
                                <Slider
                                    value={settings.accountFixedDigits ?? 0}
                                    onChange={(e: SliderChangeEvent) =>
                                        changeSettings("accountFixedDigits", Number(e.value))
                                    }
                                    min={0}
                                    max={10}
                                    className='w-full'
                                    disabled={isStockNumberStrategy}
                                />
                                <label className='float-label'>Fixed digits</label>
                            </span>
                        </div>
                        <div className='col-3'>
                            <span className='p-float-label'>
                                <InputText
                                    className='settings-account__input'
                                    value={settings.accountSuffix || ""}
                                    onChange={(e) =>
                                        changeSettings("accountSuffix", e.target.value)
                                    }
                                    disabled={isStockNumberStrategy}
                                />
                                <label className='float-label'>Suffix</label>
                            </span>
                        </div>
                        <div className='col-3'>
                            <span className='p-float-label'>
                                <InputNumber
                                    value={settings.accountStartNumber ?? 0}
                                    min={0}
                                    onChange={(e: InputNumberChangeEvent) =>
                                        changeSettings("accountStartNumber", Number(e.value))
                                    }
                                    className='w-full'
                                    disabled={isStockNumberStrategy}
                                />
                                <label className='settings-account__label float-label'>
                                    Start number
                                </label>
                            </span>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel
                    pt={{
                        header: {
                            className: "heading-condensed",
                        },
                    }}
                    header='Late fee options'
                >
                    <div className='grid settings-account__late-fee-row'>
                        <div className='col-3'>
                            <CurrencyInput
                                title='Late fee (min)'
                                labelPosition='top'
                                value={settings.accountLateFeeMin}
                                onChange={(e: InputNumberChangeEvent) =>
                                    changeSettings("accountLateFeeMin", Number(e.value))
                                }
                            />
                        </div>
                        <div className='col-3'>
                            <CurrencyInput
                                title='Late fee (max)'
                                labelPosition='top'
                                value={settings.accountLateFeeMax}
                                onChange={(e: InputNumberChangeEvent) =>
                                    changeSettings("accountLateFeeMax", Number(e.value))
                                }
                            />
                        </div>
                        <div className='col-3'>
                            <span className='p-float-label'>
                                <InputNumber
                                    className='settings-account__input'
                                    min={0}
                                    max={10}
                                    value={settings.accountLateFeeGracePeriod ?? 0}
                                    onChange={(e: InputNumberChangeEvent) =>
                                        changeSettings("accountLateFeeGracePeriod", Number(e.value))
                                    }
                                />
                                <Slider
                                    value={settings.accountLateFeeGracePeriod ?? 0}
                                    onChange={(e: SliderChangeEvent) =>
                                        changeSettings("accountLateFeeGracePeriod", Number(e.value))
                                    }
                                    min={0}
                                    max={10}
                                    className='w-full'
                                />
                                <label className='float-label'>Late fee grace period</label>
                            </span>
                        </div>
                        <div className='col-3'>
                            <PercentInput
                                className='settings-account__input'
                                title='Late fee percentage'
                                labelPosition='top'
                                value={settings.accountLateFeePercentage}
                                onChange={(e: InputNumberChangeEvent) =>
                                    changeSettings("accountLateFeePercentage", Number(e.value))
                                }
                            />
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </SettingsSection>
    );
});
