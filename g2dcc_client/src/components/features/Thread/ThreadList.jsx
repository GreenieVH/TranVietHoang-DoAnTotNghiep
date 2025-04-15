import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { IoEllipsisVerticalCircleSharp } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useThread } from "../../../context/ThreadContext";

export default function ThreadList() {
  const navigate = useNavigate();
  const { threads } = useThread();

  const handleShow = (id) => {
    console.log("Show menu" + id);
  };

  return (
    <div className="space-y-4">
      {threads?.map((thread) => (
        <div
          key={thread.id}
          className="block bg-white p-4 rounded-lg shadow hover:bg-gray-100"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src={`http://localhost:4000${thread.created_by_avatar}`}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  // Kiểm tra nếu người dùng chỉ đang chọn text thì không chuyển trang
                  if (window.getSelection().toString()) return;
                  navigate(`/forum/thread/${thread.id}`);
                }}
              >
                <h3 className="text-lg font-bold ">{thread.title}</h3>
                <div className="flex items-center">
                  <p className="font-semibold text-sm text-gray-500 hover:underline">
                    {thread.created_by_name}
                  </p>
                  <LuDot className="text-gray-500 size-6" />
                  <p className="font-semibold text-sm text-gray-500 hover:underline">
                    {formatDistanceToNow(new Date(thread.created_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            </div>
            <IoEllipsisVerticalCircleSharp
              className="text-gray-500 size-6"
              onClick={() => handleShow(thread.id)}
            />
          </div>
          <p className="text-gray-600 whitespace-pre-line mt-2 px-3">
            {thread.description}
          </p>
          {/* Tags */}
          <div className="mt-2 flex gap-2 flex-wrap">
            {thread.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-gray-200 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
