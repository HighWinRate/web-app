'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiClient.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">همه محصولات</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">نرخ برد:</span>
                  <span className="text-lg font-semibold text-green-600 mr-1">
                    {product.winrate}%
                  </span>
                </div>
              </div>
              {product.keywords && product.keywords.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {product.keywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Link href={`/products/${product.id}`}>
                <Button className="w-full">مشاهده جزئیات</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

