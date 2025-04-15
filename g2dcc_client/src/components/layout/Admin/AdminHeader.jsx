import React, { useState } from "react";
import { CgMenuLeft, CgMenu } from "react-icons/cg";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
function AdminHeader() {
  const [isMenu, setIsMenu] = useState(false);

  return (
    <div className="flex justify-between px-10 bg-amber-400 h-14">
      <div className="flex justify-start items-center gap-10">
        <div className="cursor-pointer">Logo</div>
        <div onClick={() => setIsMenu(!isMenu)} className="cursor-pointer">
          {isMenu ? (
            <CgMenuLeft className="w-5 h-5" />
          ) : (
            <CgMenu className="w-5 h-5" />
          )}
        </div>
        <div className="cursor-pointer">
          <PiMagnifyingGlassBold className="w-5 h-5" />
        </div>
      </div>
      <div className="flex justify-end items-center gap-10">
        <div className="cursor-pointer">
          <FaRegBell className="w-5 h-5" />
        </div>
        <div className="cursor-pointer">
          <MdOutlineEmail className="w-5 h-5" />
        </div>
        <div className="cursor-pointer">
          <img /> dasds
        </div>
      </div>
    </div>
  );
}

export default AdminHeader;
