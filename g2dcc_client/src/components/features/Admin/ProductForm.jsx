import React, { useState, useEffect, use } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import { useBrands } from "../../../hooks/useBrands";
import { useCategories } from "../../../hooks/useCategorys";
import { useToast } from "../../../context/ToastContext";
import {
  createProduct,
  updateProduct,
  getProductById,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../../../api/product";

const ProductForm = ({ visible, onCancel, productId, onSuccess }) => {
  const [form] = Form.useForm();
  const { brands, loading: brandsLoading } = useBrands();
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(false);
  const showToast = useToast();
  const [variantFields, setVariantFields] = useState([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [formErrors, setFormErrors] = useState({
    brand: null,
    category: null,
    general: null,
  });

  useEffect(() => {
    const fetchProductData = async () => {
      if (productId) {
        setLoading(true);
        try {
          const productData = await getProductById(productId);
          form.setFieldsValue({
            name: productData.name,
            categoryId: productData.category_id,
            brandId: productData.brand_id,
            description: productData.description,
            basePrice: productData.base_price,
            stock: productData.stock,
            isFeatured: productData.is_featured,
          });

          if (productData.variants && productData.variants.length > 0) {
            setVariantFields(
              productData.variants.map((v) => ({
                ...v,
                id: v.id,
                color: v.color,
                batteryCapacity: v.batteryCapacity,
                motorPower: v.motorPower,
                speed: v.speed,
                rangePerCharge: v.rangePerCharge,
                price: v.price,
                stock: v.stock,
                weight: v.weight,
                dimensions: v.dimensions,
                is_default: v.is_default,
              }))
            );
          }
        } catch (error) {
          showToast("Không tải được dữ liệu sản phẩm", "error");
        } finally {
          setLoading(false);
        }
      } else {
        form.resetFields();
        setVariantFields([]);
      }
    };
    // Chỉ fetch khi brands và categories đã sẵn sàng
    if ((brands?.length > 0 && categories?.length > 0) || !productId) {
      fetchProductData();
    }
  }, [productId, form, brands, categories]);

  const handleAddVariant = () => {
    setVariantFields((prev) => [
      ...prev,
      {
        id: null,
        color: "",
        batteryCapacity: "",
        motorPower: "",
        speed: "",
        rangePerCharge: "",
        price: "",
        stock: "",
        weight: "",
        dimensions: "",
        is_default: false,
      },
    ]);
    setEditingVariantIndex(variantFields.length);
  };

  const handleRemoveVariant = async (index, variantId) => {
    if (variantId) {
      try {
        await deleteVariant(variantId);
        showToast("Biến thể đã được xóa thành công", "success");
      } catch (error) {
        showToast("Không xóa được biến thể", "error");
        return;
      }
    }

    const newVariantFields = [...variantFields];
    newVariantFields.splice(index, 1);
    setVariantFields(newVariantFields);
  };

  const handleSetDefaultVariant = (index) => {
    const updatedVariants = variantFields.map((variant, i) => ({
      ...variant,
      is_default: i === index,
    }));
    setVariantFields(updatedVariants);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setFormErrors({
        brand: null,
        category: null,
        general: null,
      });
      // Prepare product data
      const productData = {
        name: values.name,
        categoryId: values.categoryId,
        brandId: values.brandId,
        description: values.description,
        basePrice: values.basePrice,
        stock: values.stock,
        isFeatured: values.isFeatured || false,
      };

      let product;
      if (productId) {
        product = await updateProduct(productId, productData);
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        product = await createProduct(productData);
        showToast("Thêm sản phẩm thành công!", "success");
      }

      // Handle variants
      if (variantFields.length > 0) {
        const variantPromises = variantFields.map(async (variant, index) => {
          const variantData = {
            color: variant.color,
            batteryCapacity: variant.batteryCapacity,
            motorPower: variant.motorPower,
            speed: variant.speed,
            rangePerCharge: variant.rangePerCharge,
            price: variant.price,
            stock: variant.stock,
            weight: variant.weight,
            dimensions: variant.dimensions,
            is_default: variant.is_default || false,
          };

          if (variant.id) {
            return updateVariant(variant.id, variantData);
          } else {
            return createVariant(product.id, variantData);
          }
        });

        await Promise.all(variantPromises);
        showToast("Các biến thể đã được lưu thành công", "success");
      }

      onSuccess();
      onCancel();
    } catch (error) {
      showToast("Không lưu được biến thể", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={productId ? "Chỉnh sửa" : "Thêm mới"}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isFeatured: false }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select loading={categoriesLoading}>
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Thương hiệu"
              name="brandId"
              validateStatus={formErrors.brand ? "error" : ""}
              help={formErrors.brand}
              rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
            >
              <Select
                loading={brandsLoading}
                onChange={() => setFormErrors({ ...formErrors, brand: null })}
              >
                {brands.map((brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Nổi bật"
              name="isFeatured"
              valuePropName="checked"
            >
              <Select>
                <Select.Option value={true}>Yes</Select.Option>
                <Select.Option value={false}>No</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá cơ bản"
              name="basePrice"
              rules={[{ required: true, message: "Vui lòng nhập giá cơ bản" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Kho"
              name="stock"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng tồn kho" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>
        {!productId && (
          <div style={{ margin: "16px 0", color: "#888" }}>
            Lưu ý: Bạn có thể thêm biến thể sau khi tạo sản phẩm
          </div>
        )}
        {/* Variants Section */}
        {productId && (
          <Form.Item label="Biến thể sản phẩm">
            <div style={{ marginBottom: 16 }}>
              <Button
                type="dashed"
                onClick={handleAddVariant}
                style={{ width: "100%" }}
              >
                Thêm mới
              </Button>
            </div>

            {variantFields.map((variant, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="Màu sắc"
                      name={`variant_color_${index}`}
                      initialValue={variant.color}
                      rules={[
                        { required: true, message: "Please enter color" },
                      ]}
                    >
                      <Input
                        value={variantFields[index]?.color || null}
                        onChange={(e) => {
                          const newVariants = [...variantFields];
                          newVariants[index].color = e.target.value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Giá"
                      name={`variant_price_${index}`}
                      initialValue={variant.price}
                      rules={[
                        { required: true, message: "Please enter price" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        value={variantFields[index]?.price || null}
                        onChange={(value) => {
                          const newVariants = [...variantFields];
                          newVariants[index].price = value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Kho"
                      name={`variant_stock_${index}`}
                      initialValue={variant.stock}
                      rules={[
                        { required: true, message: "Please enter stock" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        value={variantFields[index]?.stock || null}
                        onChange={(value) => {
                          const newVariants = [...variantFields];
                          newVariants[index].stock = value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Mặc định">
                      <Button
                        type={variant.is_default ? "primary" : "default"}
                        onClick={() => handleSetDefaultVariant(index)}
                      >
                        {variant.is_default ? "Mặc định" : "Đặt làm mặc định"}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="Dung lượng pin"
                      name={`variant_battery_${index}`}
                      initialValue={variant.batteryCapacity}
                    >
                      <Input
                        value={variantFields[index]?.batteryCapacity || null}
                        onChange={(e) => {
                          const newVariants = [...variantFields];
                          newVariants[index].batteryCapacity = e.target.value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Công suất động cơ"
                      name={`variant_motor_${index}`}
                      initialValue={variant.motorPower}
                    >
                      <Input
                        value={variantFields[index]?.motorPower || null}
                        onChange={(e) => {
                          const newVariants = [...variantFields];
                          newVariants[index].motorPower = e.target.value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Tốc độ"
                      name={`variant_speed_${index}`}
                      initialValue={variant.speed}
                    >
                      <Input
                        value={variantFields[index]?.speed || null}
                        onChange={(e) => {
                          const newVariants = [...variantFields];
                          newVariants[index].speed = e.target.value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Phạm vi cho mỗi lần sạc"
                      name={`variant_range_${index}`}
                      initialValue={variant.rangePerCharge}
                    >
                      <Input
                        value={variantFields[index]?.rangePerCharge || null}
                        onChange={(e) => {
                          const newVariants = [...variantFields];
                          newVariants[index].rangePerCharge = e.target.value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="Cân nặng (kg)"
                      name={`variant_weight_${index}`}
                      initialValue={variant.weight}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        value={variantFields[index]?.weight || null}
                        onChange={(value) => {
                          const newVariants = [...variantFields];
                          newVariants[index].weight = value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label="Kích thước"
                      name={`variant_dimensions_${index}`}
                      initialValue={variant.dimensions}
                    >
                      <Input
                        value={variantFields[index]?.dimensions || null}
                        onChange={(e) => {
                          const newVariants = [...variantFields];
                          newVariants[index].dimensions = e.target.value;
                          setVariantFields(newVariants);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12} style={{ textAlign: "right", paddingTop: 29 }}>
                    <Button
                      type="primary"
                      onClick={() => handleRemoveVariant(index, variant.id)}
                    >
                      Loại bỏ biến thể
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {productId ? "Chỉnh sửa" : "Tạo mới"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
