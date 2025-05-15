import { Outlet } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import { Card, Rate, Tag } from "antd";

export default function Forum() {
  const { products } = useProducts();
  const suggestedProducts = products?.slice(0, 5); // Lấy 5 sản phẩm đầu tiên

  return (
    <div className="mx-auto min-h-screen px-4 py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Phần gợi ý sản phẩm bên trái */}
        <div className="w-1/4">
          <Card 
            title="Sản phẩm gợi ý" 
            className="sticky top-0"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="space-y-4">
              {suggestedProducts?.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex gap-3">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2 text-sm">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Rate 
                          disabled 
                          defaultValue={Number(product.rating)} 
                          allowHalf 
                          className="text-xs"
                        />
                        <span className="text-xs text-gray-500">
                          ({product.reviewcount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-primary font-semibold text-sm">
                          {formatCurrency(product.basePrice)}
                        </p>
                        <Tag color="blue" className="text-xs">
                          {product.categoryName}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Phần nội dung chính */}
        <div className="w-3/4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
