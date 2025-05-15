import { createContext, useContext, useEffect, useState } from "react";
import { getAllMessageThread, getAllThread } from "../api/thread";
import socket from "../services/socket";

const ThreadContext = createContext();

export const ThreadProvider = ({ children }) => {
  const [threads, setThreads] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    fetchAllThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchAllMessages(selectedThread.id);
      socket.emit("joinThread", selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    socket.on("messageAdded", (newMessage) => {
      if (newMessage.thread_id === selectedThread?.id) {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
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
    setLoading(true);
    try {
      const res = await getAllMessageThread(thread_id);
      setMessages(res || []);
    } catch (error) {
      console.error("Lỗi khi lấy messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData) => {
    return new Promise((resolve, reject) => {
      try {
        socket.emit("sendMessage", messageData, (response) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(true);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
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
        fetchAllThreads,
        loading
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
};

export const useThread = () => useContext(ThreadContext);
// Compare this snippet from g2dcc_server/routes/thread.js:
