import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { IoEllipsisVerticalCircleSharp } from "react-icons/io5";
import { LuDot } from "react-icons/lu";
import { useThread } from "../../../context/ThreadContext";
import { FaRegComment, FaPlus, FaFlag, FaImage, FaTag, FaTimes, FaEdit } from "react-icons/fa";
import { Dropdown, Modal, message, Menu, Input, Button, Upload } from "antd";
import { useUser } from "../../../context/UserContext";
import { useToast } from "../../../context/ToastContext";
import { deleteThread, createThread, updateThread } from "../../../api/thread";
import { useState } from "react";

const { TextArea } = Input;

export default function ThreadList() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { threads, fetchAllThreads } = useThread();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingThread, setEditingThread] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    img: null,
    tags: []
  });
  const [tagInput, setTagInput] = useState("");

  const handleDelete = async (id) => {
    try {
      const response = await deleteThread(id);
      if (response.error) {
        showToast(response.error, "error");
        return;
      }
      showToast("Xóa thread thành công!", "success");
      fetchAllThreads();
    } catch (error) {
      if (!error.response?.data?.error) {
        showToast("Có lỗi xảy ra khi xóa thread!", "error");
      }
    }
  };

  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa thread này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => handleDelete(id),
    });
  };

  const handleReport = (threadId) => {
    Modal.confirm({
      title: "Báo cáo bài viết",
      content: (
        <div className="mt-4">
          <p className="mb-2">Lý do báo cáo:</p>
          <select className="w-full p-2 border rounded">
            <option value="spam">Spam</option>
            <option value="inappropriate">Nội dung không phù hợp</option>
            <option value="harassment">Quấy rối</option>
            <option value="other">Khác</option>
          </select>
        </div>
      ),
      okText: "Gửi báo cáo",
      cancelText: "Hủy",
      onOk: () => {
        showToast("Báo cáo đã được gửi!", "success");
      },
    });
  };

  const handleEdit = (thread) => {
    setEditingThread(thread);
    setFormData({
      title: thread.title,
      description: thread.description,
      img: null,
      tags: thread.tags || []
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateThread = async () => {
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      if (formData.img) {
        submitData.append('img', formData.img);
      }
      if (formData.tags.length > 0) {
        submitData.append('tags', JSON.stringify(formData.tags));
      }

      const response = await updateThread(editingThread.id, submitData);
      if (response.error) {
        showToast(response.error, "error");
        return;
      }
      showToast("Cập nhật bài viết thành công!", "success");
      setIsEditModalOpen(false);
      setEditingThread(null);
      setFormData({ title: "", description: "", img: null, tags: [] });
      fetchAllThreads();
    } catch (error) {
      if (!error.response?.data?.error) {
        showToast("Có lỗi xảy ra khi cập nhật bài viết!", "error");
      }
    }
  };

  const getMenuItems = (thread) => {
    if (user?.id === thread.created_by) {
      return (
        <Menu
          items={[
            {
              key: "edit",
              label: "Chỉnh sửa",
              icon: <FaEdit />,
              onClick: () => handleEdit(thread),
            },
            {
              key: "delete",
              label: "Xóa",
              danger: true,
              icon: <FaTimes />,
              onClick: () => showDeleteConfirm(thread.id),
            },
          ]}
        />
      );
    } else {
      return (
        <Menu
          items={[
            {
              key: "report",
              label: "Báo cáo",
              icon: <FaFlag />,
              onClick: () => handleReport(thread.id),
            },
          ]}
        />
      );
    }
  };

  const handleCreateThread = async () => {
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('created_by', user.id);
      if (formData.img) {
        submitData.append('img', formData.img);
      }
      if (formData.tags.length > 0) {
        submitData.append('tags', JSON.stringify(formData.tags));
      }

      const response = await createThread(submitData);
      if (response.error) {
        showToast(response.error, "error");
        return;
      }
      showToast("Tạo bài viết thành công!", "success");
      setIsModalOpen(false);
      setFormData({ title: "", description: "", img: null, tags: [] });
      fetchAllThreads();
    } catch (error) {
      if (!error.response?.data?.error) {
        showToast("Có lỗi xảy ra khi tạo bài viết!", "error");
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const renderThreadForm = (isEdit = false) => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <img
          src={user?.img || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user?.username}</p>
          <p className="text-sm text-gray-500">Công khai</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Tiêu đề bài viết"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="text-lg"
        />
        
        <TextArea
          placeholder="Bạn đang nghĩ gì?"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="text-base"
        />

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Thêm tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onPressEnter={handleAddTag}
            />
            <Button onClick={handleAddTag}>Thêm</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preview Image */}
        {formData.img && (
          <div className="relative">
            <img
              src={URL.createObjectURL(formData.img)}
              alt="preview"
              className="max-h-96 w-full object-contain rounded-lg"
            />
            <button
              onClick={() => setFormData(prev => ({ ...prev, img: null }))}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                setFormData(prev => ({ ...prev, img: file }));
                return false;
              }}
            >
              <Button icon={<FaImage />}>Thêm ảnh</Button>
            </Upload>
            <Button icon={<FaTag />}>Thêm tag</Button>
          </div>
          <Button
            type="primary"
            onClick={isEdit ? handleUpdateThread : handleCreateThread}
            disabled={!formData.title || !formData.description}
          >
            {isEdit ? "Cập nhật" : "Đăng"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Nút thêm mới */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-thead rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FaPlus />
          <span>Tạo bài viết mới</span>
        </button>
      </div>

      {/* Modal tạo bài viết */}
      <Modal
        title="Tạo bài viết mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        className="create-thread-modal"
      >
        {renderThreadForm()}
      </Modal>

      {/* Modal chỉnh sửa bài viết */}
      <Modal
        title="Chỉnh sửa bài viết"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingThread(null);
          setFormData({ title: "", description: "", img: null, tags: [] });
        }}
        footer={null}
        width={700}
        className="edit-thread-modal"
      >
        {renderThreadForm(true)}
      </Modal>

      {/* Thread List */}
      {threads?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))?.map((thread) => (
        <div
          key={thread.id}
          className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={thread.created_by_avatar || "/default-avatar.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div
                className="cursor-pointer"
                onClick={(e) => {
                  if (window.getSelection().toString()) return;
                  navigate(`/forum/thread/${thread.id}`);
                }}
              >
                <h3 className="text-xl font-bold hover:text-primary transition-colors">
                  {thread.title}
                </h3>
                <div className="flex items-center text-sm">
                  <p className="font-medium text-gray-600 hover:text-primary transition-colors">
                    {thread.created_by_name}
                  </p>
                  <LuDot className="text-gray-400 size-5" />
                  <p className="text-gray-500">
                    {formatDistanceToNow(new Date(thread.created_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-500">
                <FaRegComment className="size-4" />
                <span className="text-sm">{thread.message_count || 0}</span>
              </div>
              <Dropdown
                overlay={getMenuItems(thread)}
                trigger={["click"]}
                placement="bottomRight"
              >
                <IoEllipsisVerticalCircleSharp
                  className="text-gray-400 size-6 hover:text-primary transition-colors cursor-pointer"
                />
              </Dropdown>
            </div>
          </div>
          
          <p className="text-gray-600 whitespace-pre-line mt-4 line-clamp-3">
            {thread.description}
          </p>

          {/* Image */}
          {thread.img && (
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
            {thread.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
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
