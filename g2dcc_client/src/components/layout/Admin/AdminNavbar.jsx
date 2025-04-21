// import React from "react";
// import { IoHomeOutline } from "react-icons/io5";
// import { HiOutlineUserGroup } from "react-icons/hi2";
// import { useNavigate } from "react-router-dom";

// function AdminNavbar() {
//   const navigate = useNavigate()
//   return (
//     <div className="bg-white text-black w-1/5 max-w-[250px] min-h-screen shadow-md shadow-gray-600">
//       <div className="mb-2">
//         <p className="p-4 py-4 font-bold text-base">Navigation</p>
//         <div className="hover:border-l-2 hover:bg-[#EFEFEF] cursor-pointer border-yellow-400 text-gray-500 " onClick={() =>navigate("/admin")}>
//           <div className="p-6 py-2 flex items-center gap-4">
//             <IoHomeOutline className="w-5 h-5"/>
//             <p className="font-bold text-base">Home</p>
//           </div>
//         </div>
//       </div>
//       <div className="border-t-1 border-gray-400 mb-2">
//         <p className="p-4 py-4 font-bold text-base">Table</p>
//         <div className="hover:border-l-2 hover:bg-[#EFEFEF] cursor-pointer border-yellow-400 text-gray-500 " onClick={() =>navigate("/admin/user-lists")}>
//           <div className="p-6 py-2 flex items-center gap-4">
//             <HiOutlineUserGroup className="w-5 h-5"/>
//             <p className="font-bold text-base">Users</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminNavbar;

import React from "react";
import { Menu } from "antd";
import { IoHomeOutline } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = React.useState([]);

  const items = [
    {
      key: "home",
      label: "Home",
      icon: <IoHomeOutline className="w-5 h-5" />,
      onClick: () => navigate("/admin"),
    },
    {
      key: "users",
      label: "Users",
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      children: [
        {
          key: "user-list",
          label: "User List",
          onClick: () => navigate("/admin/user-lists"),
        },
        {
          key: "roles",
          label: "Roles",
          onClick: () => navigate("/admin/roles"),
        },
      ],
    },
    ,
    {
      key: "products",
      label: "Products",
      icon: <HiOutlineUserGroup className="w-5 h-5" />,
      children: [
        {
          key: "category",
          label: "Category",
          onClick: () => navigate("/admin/category-lists"),
        },
        {
          key: "Product",
          label: "Products",
          onClick: () => navigate("/admin/product-lists"),
        },
        {
          key: "Brand",
          label: "brand",
          onClick: () => navigate("/admin/brand-lists"),
        },
      ],
    },
  ];

  return (
    <div className="bg-white text-black w-1/5 max-w-[250px] min-h-screen shadow-md shadow-gray-600">
      <Menu
        mode="inline"
        items={items}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        className="border-r-0"
      />
    </div>
  );
}

export default AdminNavbar;
