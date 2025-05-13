import React from "react";
import { Row, Col, Typography, Pagination } from "antd";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/features/Product/ProductCard";
import ProductFilter from "../components/features/Product/ProductFilter";
import ProductBreadcrumb from "../components/common/ProductBreadcrumb";
import { getCategories } from "../api/category";
import { getBrands } from "../api/brand";
import LoadingPage from "@/components/common/LoadingPage";
import { useLocation } from "react-router-dom";

const { Title } = Typography;

const Product = () => {
  const { products, loading, pagination, fetchProducts } = useProducts();
  const [categories, setCategories] = React.useState([]);
  const [brands, setBrands] = React.useState([]);
  const [filterParams, setFilterParams] = React.useState({});
  const location = useLocation();

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

  React.useEffect(() => {
    if (location.state?.filterParams) {
      const params = {
        ...location.state.filterParams,
        category: location.state.filterParams.category_id,
        page: 1
      };
      setFilterParams(params);
      fetchProducts(params);
    }
  }, [location.state]);

  const handleFilter = (values) => {
    const params = {
      ...values,
      minPrice: values.priceRange?.[0],
      maxPrice: values.priceRange?.[1],
      page: 1
    };
    delete params.priceRange;
    setFilterParams(params);
    fetchProducts(params);
  };

  const handlePageChange = (page) => {
    const params = {
      ...filterParams,
      page
    };
    setFilterParams(params);
    fetchProducts(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <ProductBreadcrumb 
        categories={categories}
        currentCategoryId={filterParams.category}
      />

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
            {filterParams.category_name ? `Sản phẩm ${filterParams.category_name}` : 'Sản phẩm nổi bật'}
          </Title>

          {loading ? (
            <LoadingPage />
          ) : (
            <>
              {/* Pagination */}
              {pagination && pagination.total > 0 && (
                <div className="flex justify-center mb-4">
                  <Pagination
                    current={pagination.page}
                    total={pagination.total}
                    pageSize={pagination.limit}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} sản phẩm`}
                  />
                </div>
              )}
              <Row gutter={[16, 16]}>
                {products?.map((product) => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={8} xl={8}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              
              {/* Pagination */}
              {pagination && pagination.total > 0 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={pagination.page}
                    total={pagination.total}
                    pageSize={pagination.limit}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} sản phẩm`}
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Product;
