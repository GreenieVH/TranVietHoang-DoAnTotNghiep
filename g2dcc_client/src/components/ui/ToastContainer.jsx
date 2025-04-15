// import { useEffect, useState } from "react";
// import { TiDeleteOutline } from "react-icons/ti";

// const ToastContainer = ({ toasts, removeToast }) => {
//   return (
//     <div className="fixed top-15 right-5 flex flex-col gap-2">
//       {toasts.map((toast) => (
//         <Toast
//           key={toast.id}
//           message={toast.message}
//           type={toast.type}
//           onClose={() => removeToast(toast.id)}
//         />
//       ))}
//     </div>
//   );
// };

// const Toast = ({ message, type, onClose }) => {
//   const [progress, setProgress] = useState("100%");
//   useEffect(() => {
//     const timer = setTimeout(onClose, 4000);
//     setProgress("0%");
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div
//       className={`relative px-4 py-3 pr-6 text-base font-semibold rounded shadow-lg text-white
//         ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
//     >
//       <div className="absolute top-1 right-1 cursor-pointer" onClick={() => onClose()}>
//         <TiDeleteOutline />
//       </div>
//       {message}
//       <span
//         className="absolute bottom-0 left-0 h-1 rounded-lg bg-white transition-all duration-[4s] ease-linear"
//         style={{ width: progress }}
//       ></span>
//     </div>
//   );
// };

// export default ToastContainer;
import { Alert, Space } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const ToastItem = ({ toast, removeToast }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const step = 100 / (toast.timeout / 100);
    const interval = setInterval(() => {
      setProgress(prev => Math.max(prev - step, 0));
    }, 100);

    return () => clearInterval(interval);
  }, [toast.timeout]);

  return (
    <motion.div
      className="my-2 relative"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Alert
        message={toast.message}
        type={toast.type === "success" ? "success" : "error"}
        showIcon
        closable
        onClose={() => removeToast(toast.id)}
        className="min-w-[300px] shadow-lg pb-6"
      />
      <div className="absolute bottom-0 rounded-b-md left-0 right-0 h-1 bg-gray-200">
        <div 
          className="h-full transition-all duration-100 ease-linear rounded-b-md "
          style={{ 
            width: `${progress}%`,
            backgroundColor: toast.type === "success" ? '#52c41a' : '#ff4d4f'
          }}
        />
      </div>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-14 right-4 z-[9999]">
      <Space direction="vertical" size={12}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              removeToast={removeToast} 
            />
          ))}
        </AnimatePresence>
      </Space>
    </div>
  );
};

export default ToastContainer;
