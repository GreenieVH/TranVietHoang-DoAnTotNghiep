import { Carousel } from "antd";
import React, { useEffect, useState } from "react";
import { getAllBanners } from "../api/banners";
import { useToast } from "../context/ToastContext";
// import { useUser } from "../context/UserContext";

function Home() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getAllBanners();
        // Lọc các banner đang active và sắp xếp theo display_order
        const activeBanners = response.data
          .filter(banner => banner.is_active)
          .sort((a, b) => a.display_order - b.display_order);
        setBanners(activeBanners);
      } catch (error) {
        showToast('Lỗi khi tải banner', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gbg text-gtext px-10 pt-5">
      <div className="h-screen mx-auto">
        {/* Banner Slider */}
        <Carousel 
          autoplay 
          className="mb-8"
          effect="scrollx"
          autoplaySpeed={4000}
        >
          {banners.map((banner) => (
            <div key={banner.id}>
              {banner.redirect_url ? (
                <a 
                  href={banner.redirect_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </a>
              ) : (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

export default Home;
