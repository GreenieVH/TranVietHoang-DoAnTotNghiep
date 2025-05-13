import { Carousel, Card, Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import { getAllBanners } from "../api/banners";
import { getProducts } from "../api/product";
import { useToast } from "../context/ToastContext";
import {
  CheckCircleOutlined,
  CarOutlined,
  CreditCardOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import ProductCard from "../components/features/Product/ProductCard";

function Home() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banners
        const bannerResponse = await getAllBanners();
        const activeBanners = bannerResponse.data
          .filter((banner) => banner.is_active)
          .sort((a, b) => a.display_order - b.display_order);
        setBanners(activeBanners);

        // Fetch featured products
        const productResponse = await getProducts({
          is_featured: "true",
          sort: "created_at:desc",
          limit: 8,
        });
        setProducts(productResponse.products);
      } catch (error) {
        showToast("Lỗi khi tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const BannerItem = ({ banner }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
      setIsDragging(false);
    };

    const handleMouseMove = () => {
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      if (!isDragging && banner.redirect_url) {
        window.open(banner.redirect_url, "_blank", "noopener,noreferrer");
      }
    };

    return (
      <div
        className="relative cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gbg text-gtext px-10 pt-5">
      <div className="mx-auto">
        {/* Banner Slider */}
        <Carousel
          autoplay
          className="mb-8"
          effect="scrollx"
          autoplaySpeed={4000}
          draggable={true}
          swipeToSlide={true}
          touchMove={true}
          infinite={true}
          pauseOnHover={true}
        >
          {banners.map((banner) => (
            <div key={banner.id}>
              <BannerItem banner={banner} />
            </div>
          ))}
        </Carousel>

        {/* Featured Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm mới</h2>
          <Carousel
            autoplay
            autoplaySpeed={3000}
            dots={true}
            slidesToShow={4}
            slidesToScroll={1}
            draggable={true}
            swipeToSlide={true}
            touchMove={true}
            infinite={true}
            pauseOnHover={true}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ]}
            className="product-carousel"
          >
            {products.map((product) => (
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Carousel>
        </div>
        <ServiceCards />
      </div>
    </div>
  );
}
const ServiceCards = () => {
  const services = [
    {
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      title: "CAM KẾT CHẤT LƯỢNG",
      description: "CHÍNH HÃNG",
    },
    {
      icon: <CarOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
      title: "GIAO HÀNG MIỄN PHÍ",
      description: "NHANH – UY TÍN",
    },
    {
      icon: <CreditCardOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
      title: "MUA HÀNG TRẢ GÓP",
      description: "THỦ TỤC NHANH GỌN",
    },
    {
      icon: <ToolOutlined style={{ fontSize: 32, color: "#eb2f96" }} />,
      title: "SỬA CHỮA TẬN NƠI",
      description: "CỨU HỘ KHẨN CẤP",
    },
  ];

  return (
    <div className="my-12">
      <Row gutter={[16, 16]}>
        {services.map((item, index) => (
          <Col key={index} xs={24} sm={12} md={6}>
            <Card
              hoverable
              bordered
              style={{ textAlign: "center", borderRadius: 12,backgroundColor:"pink" }}
            >
              <div style={{ marginBottom: 12 }}>{item.icon}</div>
              <h4 style={{ fontWeight: "bold" }}>{item.title}</h4>
              <p style={{ color: "gray" }}>{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
