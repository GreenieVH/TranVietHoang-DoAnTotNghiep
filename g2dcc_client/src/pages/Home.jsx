import { Carousel } from "antd";
import React, { useEffect } from "react";
// import { useUser } from "../context/UserContext";

function Home() {
  return (
    <div className="min-h-screen bg-gbg text-gtext">
      <div className="h-screen mx-auto">
        {/* Banner Slider */}
        <Carousel autoplay className="mb-8">
          <div>
            <img
              src="/banner1.jpg"
              alt="Banner 1"
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
          <div>
            <img
              src="/banner2.jpg"
              alt="Banner 2"
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        </Carousel>
      </div>
    </div>
  );
}

export default Home;
