import React from "react";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";
import { Outlet } from "react-router-dom";
import CategoryMenu from "../../components/features/Product/CategoryMenu";
function UserLayout() {
  return (
    <div className="max-w-[1536px] w-screen mx-auto bg-gbg text-gtext">
      <UserHeader />
      <CategoryMenu/>
        <Outlet />
      <UserFooter />
    </div>
  );
}

export default UserLayout;
