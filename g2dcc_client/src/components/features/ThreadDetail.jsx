import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThread } from "../../context/ThreadContext";
import { useUser } from "../../context/UserContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import socket from "../../services/socket";

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { threads, messages, setMessages, sendMessage,setSelectedThread, fetchAllMessages } =
    useThread();
  const { user } = useUser();
  const [messageContent, setMessageContent] = useState("");
  const thread = threads?.find((t) => t.id === id);

  useEffect(() => {
    if (!id || !threads) return;
    const thread = threads?.find((t) => t.id === id);
    if (thread) {
      setSelectedThread(thread);
      fetchAllMessages(thread.id);
    }
  }, [id, threads]);


  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    if (!user) return alert("Vui lòng đăng nhập!");

    sendMessage({
      thread_id: thread.id,
      sender_id: user.id,
      content: messageContent,
      parent_message_id: null,
    });
    setMessageContent("");
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-blue-500 mb-3">
        ← Quay lại
      </button>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">{thread?.title}</h2>
        <p className="mt-2 whitespace-pre-line">{thread?.description}</p>
      </div>

      <div className="mt-4">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Nhập bình luận..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          onClick={handleSendMessage}
        >
          Gửi
        </button>
      </div>

      <h3 className="text-lg font-bold mt-4">Bình luận</h3>
      <MessageList messages={messages} />
    </div>
  );
}

// Hiển thị danh sách tin nhắn
function MessageList({ messages, parentId = null }) {
  const filteredMessages = messages?.filter(
    (msg) => msg.parent_message_id === parentId
  );

  return (
    <div className="ml-4 mt-2">
      {filteredMessages?.map((msg) => (
        <div key={msg.id} className="border-l-2 border-gray-300 pl-3 mb-3">
          <div className="flex gap-2 items-start">
            <img
              src={`http://localhost:4000${msg.sender_avatar}`}
              alt=""
              className="size-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{msg.sender_name}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(msg.created_at), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
          <MessageList messages={messages} parentId={msg.id} />
        </div>
      ))}
    </div>
  );
}
