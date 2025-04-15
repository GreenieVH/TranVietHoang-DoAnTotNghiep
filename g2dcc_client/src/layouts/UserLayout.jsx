import React from "react";
import UserHeader from "../components/layout/UserHeader";
import UserFooter from "../components/layout/UserFooter";
import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div className="max-w-[1536px] w-screen mx-auto">
      <UserHeader />
        <Outlet />
      <UserFooter />
    </div>
  );
}

export default UserLayout;
