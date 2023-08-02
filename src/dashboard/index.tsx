import Sidebar from "./sidebar";
import Header from "./header";
import { Outlet } from "react-router-dom";
import "./index.css";

export default function Dashboard() {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </>
  );
}
