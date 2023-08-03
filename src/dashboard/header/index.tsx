import { useRef, useState } from "react";
import "./index.css";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";

export default function Header() {
  const [dealerName] = useState("Dealer name");
  const menuRight = useRef<Menu>(null);
  let items: MenuItem[] = [
    { label: "My Profile" },
    { label: "General Settings" },
    { separator: true},
    { label: "Change location" },
    { label: "Users" },
    { separator: true},
    { label: "Contact support" },
    { label: "Support history" },
    { label: "Help" },
    { separator: true},
    { label: "Logout" },
    { separator: true},
    { label: "Sign up" },
  ];
  if (menuRight) {
    return <header className="header">
      <div className="flex h-full align-items-center">
        <div className="header__logo">
          <img src="/images/logo.svg" alt="ADMSS" />
        </div>
        <div className="header-dealer-info header__dealer">
          <p className="header-dealer-info__name">{dealerName}</p>
          <span className="header-dealer-location">Location</span>
        </div>
        <div className="header-user-menu ml-auto">
          <Menu model={items} popup ref={menuRight} popupAlignment="right" />
          <span className='header-user-menu__toggle' onClick={(event) => menuRight?.current?.toggle(event)}>
            <i className="header-user-menu__avatar admss-icon-user-cabinet"></i>
          </span>
        </div>
      </div>
    </header>;
  }
  return null;

}
