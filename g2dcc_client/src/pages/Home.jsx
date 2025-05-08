import { Carousel } from "antd";
import React, { useEffect, useState } from "react";
import { getAllBanners } from "../api/banners";
import { getProducts } from "../api/product";
import { useToast } from "../context/ToastContext";
// import { useUser } from "../context/UserContext";
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
          .filter(banner => banner.is_active)
          .sort((a, b) => a.display_order - b.display_order);
        setBanners(activeBanners);

        // Fetch featured products
        const productResponse = await getProducts({ 
          is_featured: "true",
          sort: 'created_at:desc',
          limit: 8 
        });
        setProducts(productResponse.products);
      } catch (error) {
        showToast('Lỗi khi tải dữ liệu', 'error');
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
        window.open(banner.redirect_url, '_blank', 'noopener,noreferrer');
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
                }
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                }
              }
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
      </div>
    </div>
  );
}

export default Home;
