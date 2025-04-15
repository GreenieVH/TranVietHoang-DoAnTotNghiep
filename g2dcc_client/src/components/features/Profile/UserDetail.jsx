import React from "react";
import { BiSolidUserAccount } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdHelpCircle } from "react-icons/io";
import { MdFeedback } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import user_default from "../../assets/Images/img_user_default.png";


function UserDetail({ showDetail, user, setIsLoad, setShowDetail }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const usercheck = localStorage.getItem("user");

  const handleLogout = async () => {
    if (!usercheck) return;
    try {
      const res = await logout();
      setIsLoad(true);
      setTimeout(() => {
        navigate("/login");
        setIsLoad(false);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {showDetail && (
        <div className="absolute z-10 bg-ghead text-thead top-[130%] right-1/2 w-64 rounded-xl">
          <div className="flex gap-3 items-center border-b-1 p-3 px-4">
            <div className="border-1 rounded-full">
              <img
                src={
                  user?.img && user.img.startsWith("http")
                    ? user.img
                    : `http://localhost:4000${user?.img || user_default}`
                }
                alt="user"
                className="object-cover w-10 h-10 rounded-full"
              />
            </div>
            <div>
              <h4 className="text-base font-bold">{user?.username}</h4>
              <p className="italic text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="border-b-1 flex flex-col mt-1">
            <div
              className="flex gap-2 p-2 px-4 items-center hover:bg-[#56595f]"
              onClick={() => {
                navigate("/profile"), setShowDetail(false);
              }}
            >
              <BiSolidUserAccount />
              <p>Tài khoản</p>
            </div>
            <div
              className="flex gap-2 p-2 px-4 items-center hover:bg-[#56595f] mb-1"
              onClick={handleLogout}
            >
              <FiLogOut />
              <p>Đăng xuất</p>
            </div>
          </div>
          <div className=" flex flex-col mt-1">
            <div className="flex gap-2 p-2 px-4 items-center hover:bg-[#56595f]">
              <IoSettingsSharp />
              <p>Cài đặt</p>
            </div>
            <div className="flex gap-2 p-2 px-4 items-center hover:bg-[#56595f]">
              <MdFeedback />
              <p>Phản hồi</p>
            </div>
            <div className="flex gap-2 p-2 px-4 items-center hover:bg-[#56595f] mb-3">
              <IoMdHelpCircle />
              <p>Trợ giúp</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserDetail;
