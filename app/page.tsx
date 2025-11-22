'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiClient.getProducts();
        setProducts(data.slice(0, 6)); // Show first 6 products
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          فروشگاه استراتژی‌های معاملاتی
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          بهترین استراتژی‌های معاملاتی با بالاترین نرخ برد
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${product.price}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">نرخ برد:</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400 mr-1">
                      {product.winrate}%
                    </span>
                  </div>
                </div>
                <Link href={`/products/${product.id}`}>
                  <Button className="w-full">مشاهده جزئیات</Button>
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                مشاهده همه محصولات
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
