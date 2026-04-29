import { ReactNode } from "react";

interface SettingsSectionProps {
    title: string;
    className?: string;
    children: ReactNode;
}

export const SettingsSection = ({ title, className = "", children }: SettingsSectionProps) => {
    const sectionClassName = ["settings-form", className].filter(Boolean).join(" ");

    return (
        <div className={sectionClassName}>
            <div className='settings-form__title heading-condensed'>{title}</div>
            {children}
        </div>
    );
};
