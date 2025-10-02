import { useEffect, useMemo, useState } from "react";
import { useStore } from "store/hooks";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ServerUserSettings, UserSettings as BaseUserSettings } from "common/models/user";

export interface TableColumnsListSettings {
    field: string;
    header?: unknown;
    checked?: boolean;
}

type ModuleKey = keyof ServerUserSettings;

interface UserProfileSettingsResult<
    TModuleSettings extends BaseUserSettings,
    TColumn extends TableColumnsListSettings,
> {
    serverSettings?: ServerUserSettings;
    moduleSettings?: TModuleSettings;
    activeColumns: TColumn[];
    setActiveColumnsAndSave: (columns: TColumn[]) => void;
    setModuleSettings: (settings: Partial<TModuleSettings>) => void;
    settingsLoaded: boolean;
}

export const useUserProfileSettings = <
    TModuleSettings extends BaseUserSettings,
    TColumn extends TableColumnsListSettings,
>(
    moduleKey: ModuleKey,
    availableColumns: TColumn[]
): UserProfileSettingsResult<TModuleSettings, TColumn> => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();
    const [activeColumns, setActiveColumns] = useState<TColumn[]>([]);
    const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!authUser) return;
        getUserSettings(authUser.useruid)
            .then((response) => {
                if (response?.profile?.length) {
                    let allSettings: ServerUserSettings = {} as ServerUserSettings;
                    try {
                        allSettings = JSON.parse(response.profile);
                    } catch (_) {
                        allSettings = {} as ServerUserSettings;
                    }
                    setServerSettings(allSettings);

                    const moduleSettings = (allSettings?.[moduleKey] ||
                        ({} as TModuleSettings)) as TModuleSettings & {
                        activeColumns?: unknown[];
                    };

                    const savedActive = moduleSettings?.activeColumns;
                    if (Array.isArray(savedActive) && savedActive.length) {
                        if (typeof savedActive[0] === "string") {
                            const fields = savedActive as string[];
                            const cols = Array.from(new Set(fields))
                                .map((field) => availableColumns.find((c) => c.field === field))
                                .filter((c): c is TColumn => Boolean(c));
                            setActiveColumns(cols);
                        } else {
                            setActiveColumns(savedActive as TColumn[]);
                        }
                    } else {
                        setActiveColumns(
                            availableColumns.filter(({ checked }) => checked) as TColumn[]
                        );
                    }
                } else {
                    setActiveColumns(
                        availableColumns.filter(({ checked }) => checked) as TColumn[]
                    );
                }
            })
            .finally(() => setSettingsLoaded(true));
    }, [authUser]);

    const moduleSettings = useMemo(() => {
        return (
            (serverSettings?.[moduleKey] as unknown as TModuleSettings) || ({} as TModuleSettings)
        );
    }, [serverSettings, moduleKey]);

    const persist = (updated: ServerUserSettings) => {
        if (!authUser) return;
        setServerSettings(updated);
        setUserSettings(authUser.useruid, updated);
    };

    const setModuleSettings = (settings: Partial<TModuleSettings>) => {
        const updated = {
            ...serverSettings,
            [moduleKey]: { ...(serverSettings?.[moduleKey] as object), ...settings },
        } as ServerUserSettings;
        persist(updated);
    };

    const setActiveColumnsAndSave = (columns: TColumn[]) => {
        setActiveColumns(columns);
        if (moduleKey === "contacts") {
            setModuleSettings({ activeColumns: columns } as unknown as Partial<TModuleSettings>);
        } else {
            setModuleSettings({
                activeColumns: columns.map(({ field }) => field),
            } as unknown as Partial<TModuleSettings>);
        }
    };

    return {
        serverSettings,
        moduleSettings,
        activeColumns,
        setActiveColumnsAndSave,
        setModuleSettings,
        settingsLoaded,
    };
};
