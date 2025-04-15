import { createContext, useContext, useState } from "react";
import ToastContainer from "../components/ui/ToastContainer"; // Import ToastContainer

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeout = 4000

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, timeout }]);
    setTimeout(() => removeToast(id), timeout);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast}/>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
