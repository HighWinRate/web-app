'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getThumbnailUrl = (product: Product) => {
    if (product.thumbnail) {
      return apiClient.getProductThumbnailUrl(product.id);
    }
    return null;
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              در حال بارگذاری...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            همه محصولات
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            بهترین استراتژی‌های معاملاتی با بالاترین نرخ برد
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            محصولی یافت نشد
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const thumbnailUrl = getThumbnailUrl(product);
              const finalPrice = product.discountedPrice || product.price;
              const hasDiscount =
                product.discountedPrice &&
                product.discountedPrice < product.price;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group"
                >
                  {thumbnailUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={thumbnailUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          تخفیف
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-6xl text-white opacity-50">📈</span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      {product.category && (
                        <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                          {product.category.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {product.winrate.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {product.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatPrice(finalPrice)} تومان
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(product.price)} تومان
                          </span>
                        )}
                      </div>
                    </div>

                    {product.backtest_trades_count && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        📊{' '}
                        {product.backtest_trades_count.toLocaleString('fa-IR')}{' '}
                        معامله بکتست شده
                      </div>
                    )}

                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full text-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300"
                    >
                      مشاهده جزئیات
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
