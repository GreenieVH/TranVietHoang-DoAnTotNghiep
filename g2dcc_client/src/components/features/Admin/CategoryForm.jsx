import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Switch } from "antd";
import { useCategories } from "../../../hooks/useCategorys";
import { useToast } from "../../../context/ToastContext";
import { createCategory, updateCategory } from "../../../api/category";

const { Option } = Select;

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const { categories, fetchCategories } = useCategories();
  const showToast = useToast();

  useEffect(() => {
    fetchCategories();
    if (category) {
      form.setFieldsValue({
        ...category,
        is_active: category.is_active,
        parent_id: category.parent_id || null,
      });
    } else {
      form.resetFields();
    }
  }, [category]);

  const handleFinish = async (values) => {
    try {
      if (category) {
        // Nếu đang sửa danh mục
        await updateCategory(category.id, {
          name: values.name,
          description: values.description,
          parentId: values.parent_id || null,
        });
        showToast("Cập nhật danh mục thành công!", "success");
      } else {
        // Nếu đang thêm mới
        await createCategory({
          name: values.name,
          description: values.description,
          parentId: values.parent_id || null,
        });
        showToast("Thêm danh mục thành công!", "success");
      }

      onSave(); // Load lại bảng và đóng modal
    } catch (error) {
      showToast("Có lỗi xảy ra!", "error");
    }
  };

  return (
    <Modal
      title={category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      open={true}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText={category ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          name: category?.name || "",
          description: category?.description || "",
          parent_id: category?.parent_id || null,
        }}
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Danh mục cha" name="parent_id">
          <Select allowClear placeholder="Không có (danh mục gốc)">
            {categories
              .filter((cat) => !category || cat.id !== category.id)
              .map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item label="Kích hoạt" name="is_active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
