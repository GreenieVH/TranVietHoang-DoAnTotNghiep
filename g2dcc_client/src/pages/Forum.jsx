import { Outlet } from "react-router-dom";

export default function Forum() {
  return (
    <div className="mx-auto min-h-screen px-24 p-4 bg-gbg">
      <div className="flex gap-6">
        <div className="w-2/3"><Outlet /></div>
        <div className="w-1/3 bg-green-200 rounded-lg">
  
        </div>
      </div>
    </div>
  );
}
