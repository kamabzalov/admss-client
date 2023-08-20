import { useRef, useState } from "react";
import "./index.css";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import logo from "assets/images/logo.svg";
import userCabinet from "assets/images/icons/user-cabinet.svg";

export default function Header() {
  const [dealerName] = useState("Dealer name");
  const menuRight = useRef<Menu>(null);
  let items: MenuItem[] = [
    { label: "My Profile" },
    { label: "General Settings" },
    { separator: true },
    { label: "Change location" },
    { label: "Users" },
    { separator: true },
    { label: "Contact support" },
    { label: "Support history" },
    { label: "Help" },
    { separator: true },
    { label: "Logout" },
    { separator: true },
    { label: "Sign up" }
  ];
  if (menuRight) {
    return <header className="header">
      <div className="flex h-full align-items-center">
        <div className="header__logo">
          <img src={logo} alt="ADMSS" />
        </div>
        <div className="grid m-0 head-container  justify-content-between">
          <div className="header-dealer-info">
            <p className="header-dealer-info__name font-bold">{dealerName}</p>
            <span className="header-dealer-location">Location</span>
          </div>
          <div className="header-user-menu ml-auto">
            <Menu model={items} popup ref={menuRight} popupAlignment="right" />
            <img className="header-user-menu__toggle" onClick={(event) => menuRight?.current?.toggle(event)}
                 src={userCabinet} alt="User cabinet" />
          </div>
        </div>
      </div>
    </header>;
  }
  return null;

}
