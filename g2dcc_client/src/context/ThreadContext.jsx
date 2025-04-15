import { createContext, useContext, useEffect, useState } from "react";
import { getAllMessageThread, getAllThread } from "../api/thread";
import socket from "../services/socket";

const ThreadContext = createContext();

export const ThreadProvider = ({ children }) => {
  const [threads, setThreads] = useState(null);
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    fetchAllThreads();
  }, []);
  useEffect(() => {
    fetchAllMessages();
  }, []);
  useEffect(() => {
    if (selectedThread) {
      fetchAllMessages(selectedThread.id);
      socket.emit("joinThread", selectedThread.id); // Tham gia vào thread khi chọn
    }
  }, [selectedThread]);
  useEffect(() => {
    socket.on("messageAdded", async (newMessage) => {
      if (newMessage.thread_id === selectedThread?.id) {
        setMessages((prev) => [...prev, newMessage]);// Cập nhật tin nhắn mới real-time
      }
    });

    return () => {
      socket.off("messageAdded");
    };
  }, [selectedThread]);
  const fetchAllThreads = async () => {
    try {
      const res = await getAllThread();
      setThreads(res);
    } catch (error) {
      console.error("Lỗi khi lấy threads:", error);
      setThreads(null);
    }
  };

  const fetchAllMessages = async (thread_id) => {
    if (!thread_id) return;
    try {
      const res = await getAllMessageThread(thread_id);
      setMessages(res);
    } catch (error) {
      console.error("Lỗi khi lấy messages:", error);
      setMessages(null);
    }
  };
  const sendMessage = (messageData) => {
    socket.emit("sendMessage", messageData);
  };
  return (
    <ThreadContext.Provider
      value={{
        threads,
        messages,
        setMessages,
        fetchAllMessages,
        selectedThread,
        setSelectedThread,
        sendMessage,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
};

export const useThread = () => useContext(ThreadContext);
// Compare this snippet from g2dcc_server/routes/thread.js:
