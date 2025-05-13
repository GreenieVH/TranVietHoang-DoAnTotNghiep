import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Table,
  Space,
  Typography,
  message,
  InputNumber,
  Row,
  Col,
  Modal,
  Radio,
  Checkbox,
  Spin,
  Popconfirm,
  QRCode,
  List,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createOrder, addOrderItem } from "../../../api/orders";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../../api/addresses";
import { validatePromotionCode } from "../../../api/promotions";
import { useToast } from "../../../context/ToastContext";
import { formatCurrency } from "../../../utils/format";

const { Title, Text } = Typography;

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const defaultCenter = {
  lat: 20.967379346986693,
  lng: 105.76195558875337,
};

// Shipping fee calculation based on order total, location and shipping method
const calculateShippingFee = (orderTotal, city, state, shippingMethod) => {
  // Free shipping for orders over 25,000,000đ
  if (orderTotal > 25000000) {
    return 0;
  }

  // Check if address is in Hanoi or HCM
  const isHanoi = city.toLowerCase().includes('hà nội') || city.toLowerCase().includes('hanoi');
  const isHCM = city.toLowerCase().includes('hồ chí minh') || city.toLowerCase().includes('hcm') || 
                city.toLowerCase().includes('tp.hcm') || city.toLowerCase().includes('tphcm');

  // Define shipping rates for different areas
  const shippingRates = {
    innerCity: {
      standard: 0,      // Nội thành - giao tiêu chuẩn: 0đ
      express: 50000    // Nội thành - giao nhanh: 50,000đ
    },
    outerCity: {
      standard: 100000, // Ngoại thành - giao tiêu chuẩn: 100,000đ
      express: 200000   // Ngoại thành - giao nhanh: 200,000đ
    },
    otherProvince: {
      standard: 300000, // Tỉnh khác - giao tiêu chuẩn: 300,000đ
      express: 800000   // Tỉnh khác - giao nhanh: 800,000đ
    }
  };

  if (isHanoi || isHCM) {
    // Check if it's inner city or outer city
    const isInnerCity = state.toLowerCase().includes('quận') || 
                       state.toLowerCase().includes('district') ||
                       state.toLowerCase().includes('phường') ||
                       state.toLowerCase().includes('ward');
    
    if (isInnerCity) {
      return shippingRates.innerCity[shippingMethod];
    } else {
      return shippingRates.outerCity[shippingMethod];
    }
  } else {
    return shippingRates.otherProvince[shippingMethod];
  }
};

// Map click handler component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const OrderForm = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [form] = Form.useForm();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [validatingPromotion, setValidatingPromotion] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [addressForm] = Form.useForm();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [marker, setMarker] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const searchInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isVietQRModalVisible, setIsVietQRModalVisible] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    accountNumber: "0563255494",
    accountName: "TRAN VIET HOANG",
    bankName: "MBBANK",
    bankBranch: "Chi nhánh Hà Nội",
    transferContent: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load shipping methods
    setShippingMethods([
      { id: 1, name: "Giao hàng tiêu chuẩn", basePrice: 30000 },
      { id: 2, name: "Giao hàng nhanh", basePrice: 50000 },
    ]);

    // Load user addresses
    loadAddresses();
  }, []);

  // Update shipping fee when order total, address or shipping method changes
  useEffect(() => {
    if (selectedAddress) {
      const orderTotal = calculateTotal();
      const shippingMethod = form.getFieldValue('shipping_method_id') === 1 ? 'standard' : 'express';
      const fee = calculateShippingFee(
        orderTotal,
        selectedAddress.city,
        selectedAddress.state,
        shippingMethod
      );
      setShippingFee(fee);
    }
  }, [selectedAddress, cart, form.getFieldValue('shipping_method_id')]);

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    setMarker(latlng);

    // Reverse geocoding using Nominatim
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
    )
      .then((response) => response.json())
      .then((data) => {
        const addressData = {
          address_line1: data.address.road || data.address.house_number || "",
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          state:
            data.address.suburb ||
            data.address.county ||
            data.address.state ||
            "",
          postal_code: data.address.postcode || "",
        };

        // Update form with address data
        addressForm.setFieldsValue({
          address_line1: addressData.address_line1.trim(),
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postal_code,
        });
      })
      .catch((error) => {
        console.error("Error in reverse geocoding:", error);
        showToast("Không thể lấy thông tin địa chỉ", "error");
      });
  };

  const handleSearch = async () => {
    const searchInput = searchInputRef.current.value;
    if (!searchInput) {
      showToast("Vui lòng nhập địa chỉ cần tìm", "warning");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults([]);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchInput
        )}&countrycodes=vn&limit=5`
      );

      if (!response.ok) {
        throw new Error('Lỗi kết nối đến dịch vụ tìm kiếm');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchError("Không tìm thấy địa chỉ phù hợp");
        showToast("Không tìm thấy địa chỉ", "warning");
      }
    } catch (error) {
      console.error("Error in geocoding:", error);
      setSearchError("Có lỗi xảy ra khi tìm kiếm địa chỉ");
      showToast("Lỗi khi tìm kiếm địa chỉ", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    try {
      setIsSearching(true);
      const latlng = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
      setSelectedLocation(latlng);
      setMarker(latlng);

      // Get detailed address information
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );

      if (!response.ok) {
        throw new Error('Lỗi khi lấy thông tin chi tiết địa chỉ');
      }

      const detailedData = await response.json();
      const addressData = {
        address_line1:
          detailedData.address.road ||
          detailedData.address.house_number ||
          "",
        city:
          detailedData.address.city ||
          detailedData.address.town ||
          detailedData.address.village ||
          "",
        state:
          detailedData.address.suburb ||
          detailedData.address.county ||
          detailedData.address.state ||
          "",
        postal_code: detailedData.address.postcode || "",
      };

      addressForm.setFieldsValue({
        address_line1: addressData.address_line1.trim(),
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
      });

      // Clear search results after selection
      setSearchResults([]);
      searchInputRef.current.value = "";
    } catch (error) {
      console.error("Error in detailed geocoding:", error);
      showToast("Không thể lấy thông tin chi tiết địa chỉ", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await getUserAddresses();
      setAddresses(response.data);
      if (response.data.length > 0) {
        const defaultAddress =
          response.data.find((addr) => addr.isDefault) || response.data[0];
        setSelectedAddress(defaultAddress);
        form.setFieldsValue({
          shipping_address: formatAddress(defaultAddress),
          billing_address: formatAddress(defaultAddress),
        });
      }
    } catch (error) {
      showToast("Lỗi khi tải địa chỉ", "error");
    }
  };

  const formatAddress = (address) => {
    return `${address.recipient_name}, ${address.phone_number}\n${
      address.address_line1
    }${address.address_line2 ? `, ${address.address_line2}` : ""}, ${
      address.city
    }, ${address.state}, ${address.postal_code}`;
  };

  const handleEditAddress = (address) => {
    setIsEditMode(true);
    setEditingAddressId(address.id);
    setIsAddressModalVisible(true);
    addressForm.setFieldsValue({
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      address_line1: address.address_line1,
      address_line2: address.address_line2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      showToast("Xóa địa chỉ thành công", "success");
      loadAddresses();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi xóa địa chỉ",
        "error"
      );
    }
  };

  // Thêm tọa độ vào dữ liệu địa chỉ khi tạo/cập nhật
  const handleAddNewAddress = async (values) => {
    try {
      const addressData = {
        ...values,
        country: "Vietnam",
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
      };

      if (isEditMode) {
        await updateAddress(editingAddressId, addressData);
        showToast("Cập nhật địa chỉ thành công", "success");
      } else {
        await createAddress(addressData);
        showToast("Thêm địa chỉ mới thành công", "success");
      }

      // ... (phần còn lại giữ nguyên)
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi lưu địa chỉ",
        "error"
      );
    }
  };

  const handleShippingMethodChange = (value) => {
    if (selectedAddress) {
      const orderTotal = calculateTotal();
      const shippingMethod = value === 1 ? 'standard' : 'express';
      const fee = calculateShippingFee(
        orderTotal,
        selectedAddress.city,
        selectedAddress.state,
        shippingMethod
      );
      setShippingFee(fee);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);

    // Format địa chỉ để hiển thị
    const formattedAddress = formatAddress(address);
    form.setFieldsValue({
      shipping_address: formattedAddress,
      billing_address: formattedAddress,
    });

    // Calculate shipping fee based on new address
    const orderTotal = calculateTotal();
    const shippingMethod = form.getFieldValue('shipping_method_id') === 1 ? 'standard' : 'express';
    const fee = calculateShippingFee(orderTotal, address.city, address.state, shippingMethod);
    setShippingFee(fee);
  };

  const handleQuantityChange = (index, value) => {
    const newCart = [...cart];
    newCart[index].quantity = value;
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleRemoveItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleApplyPromotion = async () => {
    if (!promotionCode) {
      showToast("Vui lòng nhập mã giảm giá", "warning");
      return;
    }

    try {
      setValidatingPromotion(true);
      const totalAmount = calculateTotal();
      const response = await validatePromotionCode(promotionCode, totalAmount);
      setAppliedPromotion(response.data);
      showToast("Áp dụng mã giảm giá thành công", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Mã giảm giá không hợp lệ",
        "error"
      );
      setAppliedPromotion(null);
    } finally {
      setValidatingPromotion(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromotion) return 0;

    const total = calculateTotal();
    let discount = 0;

    if (appliedPromotion.discount_type === "percentage") {
      discount = (total * appliedPromotion.discount_value) / 100;
    } else {
      discount = appliedPromotion.discount_value;
    }

    return Math.min(discount, appliedPromotion.max_discount_amount || Infinity);
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const discount = calculateDiscount();
    return subtotal + shippingFee - discount;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const orderData = {
        ...values,
        total_amount: calculateTotal(),
        status: "pending",
        payment_status: "pending",
        payment_method: values.payment_method,
        shipping_address: values.shipping_address,
        billing_address: values.billing_address || values.shipping_address,
        shipping_fee: shippingFee,
        tax_amount: 0,
        discount_amount: calculateDiscount(),
        promotion_code: appliedPromotion?.code,
        final_price: calculateFinalTotal(),
      };

      const { data: order } = await createOrder(orderData);

      // Add order items
      for (const item of cart) {
        await addOrderItem({
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
        });
      }

      showToast("Đơn hàng đã được tạo thành công", "success");
      localStorage.removeItem("cart");
      navigate(`/orders/${order.id}`);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi tạo đơn hàng",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (value) => {
    if (value === "bank") {
      // Generate transfer content based on order info
      const transferContent = `Thanh toán G2DCC ${Date.now()}`;
      setBankInfo((prev) => ({
        ...prev,
        transferContent,
      }));
      setIsVietQRModalVisible(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showToast("Đã sao chép vào clipboard", "success");
      },
      () => {
        showToast("Không thể sao chép", "error");
      }
    );
  };

  const generateVietQRString = () => {
    const { accountNumber, accountName, bankName, transferContent } = bankInfo;
    // Round the amount to the nearest integer
    const amount = Math.round(calculateFinalTotal());

    // Tạo URL theo chuẩn VietQR
    const bankId = "MBBANK"; // Mã ngân hàng MBBank
    const template = "qr_only"; // Template hiển thị đầy đủ thông tin
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(accountName)}`;

    return qrUrl;
  };

  const handleQRClick = () => {
    const qrUrl = generateVietQRString();
    window.open(qrUrl, "_blank");
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <img
            src={record.productImage}
            alt={record.productName}
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
          <div>
            <Text strong>{record.name}</Text>
            {record.variantColor && (
              <Text type="secondary">Màu: {record.variantColor}</Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record, index) => (
        <Space>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(index, quantity - 1)}
            disabled={quantity <= 1}
          />
          <InputNumber
            min={1}
            value={quantity}
            onChange={(value) => handleQuantityChange(index, value)}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(index, quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: "Tổng",
      key: "total",
      render: (_, record) => formatCurrency(record.price * record.quantity),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, __, index) => (
        <Button danger onClick={() => handleRemoveItem(index)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="order-form" style={{ padding: "24px" }}>
      <Title level={2}>Đặt hàng</Title>

      <Card loading={loading}>
        {cart.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={cart}
              rowKey="id"
              pagination={false}
            />

            <div style={{ marginTop: "24px" }}>
              <Row gutter={16} align="middle">
                <Col span={12}>
                  <Space>
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      prefix={<TagOutlined />}
                    />
                    <Button
                      type="primary"
                      onClick={handleApplyPromotion}
                      loading={validatingPromotion}
                    >
                      Áp dụng
                    </Button>
                  </Space>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Space direction="vertical" align="end">
                    <Text>
                      Tổng tiền hàng: {formatCurrency(calculateTotal())}
                    </Text>
                    {appliedPromotion && (
                      <Text type="success">
                        Giảm giá: -{formatCurrency(calculateDiscount())}
                        {appliedPromotion.discount_type === "percentage" &&
                          ` (${appliedPromotion.discount_value}%)`}
                      </Text>
                    )}
                    <Text>
                      Phí vận chuyển: {formatCurrency(shippingFee)}
                      {calculateTotal() > 25000000 && " (Miễn phí cho đơn hàng > 25,000,000đ)"}
                      {selectedAddress && (
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                          {selectedAddress.city.toLowerCase().includes('hà nội') || 
                           selectedAddress.city.toLowerCase().includes('hồ chí minh') ? 
                           (selectedAddress.state.toLowerCase().includes('quận') || 
                            selectedAddress.state.toLowerCase().includes('phường') ? 
                            ' (Nội thành)' : ' (Ngoại thành)') : 
                           ' (Tỉnh khác)'}
                        </span>
                      )}
                    </Text>
                    <Title level={4}>
                      Tổng thanh toán: {formatCurrency(calculateFinalTotal())}
                    </Title>
                  </Space>
                </Col>
              </Row>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ marginTop: "24px" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="shipping_method_id"
                    label="Phương thức vận chuyển"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phương thức vận chuyển",
                      },
                    ]}
                  >
                    <Select onChange={handleShippingMethodChange}>
                      {shippingMethods.map((method) => (
                        <Select.Option key={method.id} value={method.id}>
                          {method.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="payment_method"
                    label="Phương thức thanh toán"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phương thức thanh toán",
                      },
                    ]}
                  >
                    <Select onChange={handlePaymentMethodChange}>
                      <Select.Option value="cod">
                        Thanh toán khi nhận hàng
                      </Select.Option>
                      <Select.Option value="bank">
                        Chuyển khoản ngân hàng
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <div style={{ marginBottom: "16px" }}>
                    <Space style={{ marginBottom: "8px" }}>
                      <Text strong>Địa chỉ giao hàng:</Text>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setIsEditMode(false);
                          setEditingAddressId(null);
                          setIsAddressModalVisible(true);
                        }}
                      >
                        Thêm địa chỉ mới
                      </Button>
                    </Space>
                    <Radio.Group
                      value={selectedAddress?.id}
                      onChange={(e) =>
                        handleAddressSelect(
                          addresses.find((addr) => addr.id === e.target.value)
                        )
                      }
                      style={{ width: "100%" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {addresses.map((address) => (
                          <Radio key={address.id} value={address.id}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <div>
                                <Text strong>{address.recipient_name}</Text> -{" "}
                                {address.phone_number}
                                <br />
                                <Text type="secondary">
                                  {address.address_line1}
                                  {address.address_line2 &&
                                    `, ${address.address_line2}`}
                                  {`, ${address.city}, ${address.state}, ${address.postal_code}`}
                                </Text>
                              </div>
                              <Space>
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAddress(address);
                                  }}
                                />
                                <Popconfirm
                                  title="Xóa địa chỉ này?"
                                  description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                                  onConfirm={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAddress(address.id);
                                  }}
                                  onCancel={(e) => e.stopPropagation()}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                >
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Popconfirm>
                              </Space>
                            </div>
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="shipping_address"
                    label="Địa chỉ giao hàng"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ giao hàng",
                      },
                    ]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="billing_address" label="Địa chỉ thanh toán">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Đặt hàng
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <ShoppingCartOutlined style={{ fontSize: "48px", color: "#ccc" }} />
            <Title level={3} style={{ marginTop: "16px" }}>
              Giỏ hàng trống
            </Title>
            <Text type="secondary">Hãy thêm sản phẩm vào giỏ hàng</Text>
          </div>
        )}
      </Card>

      <Modal
        title={isEditMode ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        open={isAddressModalVisible}
        onCancel={() => {
          setIsAddressModalVisible(false);
          addressForm.resetFields();
          setIsEditMode(false);
          setEditingAddressId(null);
          setSearchResults([]);
          setSearchError(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddNewAddress}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="search_address" label="Tìm kiếm địa chỉ">
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    ref={searchInputRef}
                    placeholder="Nhập địa chỉ để tìm kiếm"
                    onPressEnter={handleSearch}
                    allowClear
                  />
                  <Button 
                    type="primary" 
                    onClick={handleSearch}
                    loading={isSearching}
                  >
                    Tìm kiếm
                  </Button>
                </Space.Compact>
              </Form.Item>
              {searchError && (
                <Text type="danger" style={{ marginBottom: '16px' }}>
                  {searchError}
                </Text>
              )}
              {searchResults.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Kết quả tìm kiếm:</Text>
                  <List
                    size="small"
                    bordered
                    dataSource={searchResults}
                    renderItem={(item) => (
                      <List.Item
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectSearchResult(item)}
                      >
                        <Text>{item.display_name}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div
                style={{ height: "400px", width: "100%", position: "relative" }}
              >
                <MapContainer
                  center={[defaultCenter.lat, defaultCenter.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {marker && <Marker position={[marker.lat, marker.lng]} />}
                  <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>
              </div>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item
                name="recipient_name"
                label="Tên người nhận"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người nhận" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address_line1"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="address_line2" label="Địa chỉ phụ (tùy chọn)">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="state"
                label="Quận/Huyện"
                rules={[
                  { required: true, message: "Vui lòng nhập quận/huyện" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="postal_code"
            label="Mã bưu điện"
            rules={[{ required: true, message: "Vui lòng nhập mã bưu điện" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Thêm địa chỉ
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* VietQR Modal */}
      <Modal
        title="Thông tin chuyển khoản"
        open={isVietQRModalVisible}
        onCancel={() => setIsVietQRModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsVietQRModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              cursor: "pointer",
              position: "relative",
              display: "inline-block",
            }}
            onClick={handleQRClick}
          >
            <img
              src={generateVietQRString()}
              alt="VietQR Code"
              style={{
                width: "256px",
                height: "256px",
                marginBottom: "20px",
              }}
            />
          </div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Ngân hàng: </Text>
              <Text>{bankInfo.bankName}</Text>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(bankInfo.bankName)}
              />
            </div>
            <div>
              <Text strong>Số tài khoản: </Text>
              <Text>{bankInfo.accountNumber}</Text>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(bankInfo.accountNumber)}
              />
            </div>
            <div>
              <Text strong>Tên tài khoản: </Text>
              <Text>{bankInfo.accountName}</Text>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(bankInfo.accountName)}
              />
            </div>
            <div>
              <Text strong>Chi nhánh: </Text>
              <Text>{bankInfo.bankBranch}</Text>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(bankInfo.bankBranch)}
              />
            </div>
            <div>
              <Text strong>Số tiền: </Text>
              <Text>{formatCurrency(Math.round(calculateFinalTotal()))}</Text>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() =>
                  copyToClipboard(Math.round(calculateFinalTotal()).toString())
                }
              />
            </div>
            <div>
              <Text strong>Nội dung chuyển khoản: </Text>
              <Text>{bankInfo.transferContent}</Text>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(bankInfo.transferContent)}
              />
            </div>
          </Space>
          <div style={{ marginTop: "20px" }}>
            <Text type="secondary">
              Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử
              lý nhanh chóng
            </Text>
          </div>
          <div style={{ marginTop: "10px" }}>
            <Text type="secondary">
              Quét mã QR bằng ứng dụng MBBank để chuyển khoản nhanh chóng
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderForm;
