import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThread } from "../../../context/ThreadContext";
import { useUser } from "../../../context/UserContext";
import dayjs from "../../../utils/dayjs-adapter";
import { IoArrowBack } from "react-icons/io5";
import { FaRegPaperPlane, FaReply, FaImage } from "react-icons/fa";
import { Button, Input, Avatar, Card, Space, Divider, Upload, message, Spin } from "antd";
import { useToast } from "../../../context/ToastContext";

const { TextArea } = Input;

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { threads, messages, setMessages, sendMessage, setSelectedThread, fetchAllMessages } = useThread();
  const { user } = useUser();
  const [messageContent, setMessageContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const messageInputRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const thread = threads?.find((t) => t.id === id);

  useEffect(() => {
    if (!id || !threads) return;
    const thread = threads?.find((t) => t.id === id);
    if (thread) {
      setSelectedThread(thread);
      fetchAllMessages(thread.id);
    }
  }, [id, threads]);

  const handleSendMessage = async () => {
    if ((!messageContent.trim() && !selectedFile) || !user) {
      showToast("Vui lòng nhập nội dung hoặc chọn ảnh!", "error");
      return;
    }

    setSending(true);
    try {
      const messageData = {
        thread_id: thread.id,
        sender_id: user.id,
        content: messageContent.trim(),
        parent_message_id: replyTo?.id || null
      };

      if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          messageData.img = reader.result;
          await sendMessage(messageData);
          setMessageContent("");
          setReplyTo(null);
          setSelectedFile(null);
          setPreviewUrl(null);
          setSending(false);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        await sendMessage(messageData);
        setMessageContent("");
        setReplyTo(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setSending(false);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      showToast(error.message || "Có lỗi xảy ra khi gửi tin nhắn!", "error");
      setSending(false);
    }
  };

  const handleFileChange = (info) => {
    if (info.file) {
      setSelectedFile(info.file);
      setPreviewUrl(URL.createObjectURL(info.file));
    }
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleReply = (message) => {
    setReplyTo(message);
    // Scroll to message input
    messageInputRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="space-y-6">
      <Button 
        icon={<IoArrowBack />}
        onClick={() => navigate(-1)}
        type="text"
      >
        Quay lại
      </Button>

      <Card>
        <h2 className="text-2xl font-bold mb-4">{thread?.title}</h2>
        <div className="flex items-center gap-3 mb-4">
          <Avatar 
            src={thread?.created_by_avatar} 
            size={40}
          />
          <div>
            <p className="font-semibold">{thread?.created_by_name}</p>
            <p className="text-sm text-gray-500">
              {dayjs(thread?.created_at).fromNow()}
            </p>
          </div>
        </div>
        <p className="text-gray-700 whitespace-pre-line">{thread?.description}</p>
        
        {thread?.img && (
          <div className="mt-4">
            <img
              src={thread.img}
              alt="thread image"
              className="max-h-96 w-full object-contain rounded-lg"
            />
          </div>
        )}
        
        {/* Tags */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {thread?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex gap-3" ref={messageInputRef}>
          <Avatar 
            src={user?.img} 
            size={40}
          />
          <div className="flex-1">
            {replyTo && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Đang trả lời <span className="font-medium">{replyTo.sender_name}</span>
                </span>
                <Button type="text" size="small" onClick={handleCancelReply} disabled={sending}>
                  Hủy
                </Button>
              </div>
            )}
            <TextArea
              placeholder="Nhập bình luận của bạn..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled={sending}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            {previewUrl && (
              <div className="mt-2 relative">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="max-h-40 rounded-lg"
                />
                <Button
                  type="text"
                  danger
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={sending}
                >
                  ×
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <Space>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleFileChange({ file });
                    return false;
                  }}
                  disabled={sending}
                >
                  <Button icon={<FaImage />} disabled={sending}>Thêm ảnh</Button>
                </Upload>
              </Space>
              <Button
                type="primary"
                icon={<FaRegPaperPlane />}
                onClick={handleSendMessage}
                disabled={(!messageContent.trim() && !selectedFile) || sending}
                loading={sending}
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Bình luận">
        {loading ? (
          <div className="text-center py-4">
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Chưa có bình luận nào
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            onReply={handleReply}
            currentUser={user}
          />
        )}
      </Card>
    </div>
  );
}

function MessageList({ messages, parentId = null, onReply, currentUser }) {
  const filteredMessages = messages?.filter(
    (msg) => msg.parent_message_id === parentId
  );

  return (
    <div className="space-y-4">
      {filteredMessages?.map((msg) => (
        <div key={msg.id} className="flex gap-3">
          <Avatar 
            src={msg.sender_avatar} 
            size={40}
          />
          <div className="flex-1">
            <Card size="small" className="bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <Space>
                  <span className="font-semibold">{msg.sender_name}</span>
                  <span className="text-sm text-gray-500">
                    {dayjs(msg.created_at).fromNow()}
                  </span>
                </Space>
                {currentUser && (
                  <Button 
                    type="text" 
                    size="small"
                    icon={<FaReply />}
                    onClick={() => onReply(msg)}
                  >
                    Trả lời
                  </Button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-line">{msg.content}</p>
              {msg.img && (
                <div className="mt-2">
                  <img
                    src={msg.img}
                    alt="message image"
                    className="max-h-40 rounded-lg"
                  />
                </div>
              )}
            </Card>
            <div className="ml-8 mt-2">
              <MessageList 
                messages={messages} 
                parentId={msg.id}
                onReply={onReply}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
