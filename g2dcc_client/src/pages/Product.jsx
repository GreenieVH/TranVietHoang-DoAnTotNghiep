import React from "react";
import { Row, Col, Carousel, Typography } from "antd";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/features/Product/ProductCard";
import ProductFilter from "../components/features/Product/ProductFilter";
import { getCategories } from "../api/category";
import { getBrands } from "../api/brand";
import LoadingPage from "@/components/common/LoadingPage";

const { Title } = Typography;

const Product = () => {
  const { products, loading, pagination, fetchProducts } = useProducts();
  const [categories, setCategories] = React.useState([]);
  const [brands, setBrands] = React.useState([]);
  const [filterParams, setFilterParams] = React.useState({});

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    const loadBrands = async () => {
      try {
        const data = await getBrands();
        setBrands(data.data);
      } catch (error) {
        console.error("Error loading brands:", error);
      }
    };
    loadBrands();
    loadCategories();
  }, []);

  const handleFilter = (values) => {
    const params = {
      ...values,
      minPrice: values.priceRange?.[0],
      maxPrice: values.priceRange?.[1],
    };
    delete params.priceRange;
    setFilterParams(params);
    fetchProducts(params);
  };
  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Row gutter={[24, 24]}>
        {/* Filter Sidebar */}
        <Col xs={24} md={6}>
          <ProductFilter
            categories={categories}
            brands={brands}
            onFilter={handleFilter}
            initialValues={filterParams}
          />
        </Col>

        {/* Product List */}
        <Col xs={24} md={18}>
          <Title level={3} className="mb-6">
            Sản phẩm nổi bật
          </Title>

          {loading ? (
            <div className="text-center py-12">Đang tải sản phẩm...</div>
          ) : (
            <Row gutter={[16, 16]}>
              {products?.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={8} xl={8}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Product;
