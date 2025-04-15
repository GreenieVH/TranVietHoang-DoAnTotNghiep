import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center p-8 max-w-md"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
          className="text-9xl font-bold text-blue-600 mb-4"
        >
          404
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Ồ! Không tìm thấy trang
        </h1>
        <p className="text-gray-600 mb-6">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate("/")}
          className="flex items-center mx-auto"
        >
          Quay lại trang chủ
        </Button>

        <motion.div
          className="mt-8"
          animate={{
            x: [0, 10, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
        >
          <img
            src="https://illustrations.popsy.co/amber/falling.svg"
            // src="https://media.tenor.com/5ht6PgzAg50AAAAM/kazuma.gif"

            alt="404 illustration"
            className="w-64 mx-auto"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
