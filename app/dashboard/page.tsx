'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Course, Product, File as FileType } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      async function fetchData() {
        try {
          const [coursesData, productsData, filesData] = await Promise.all([
            apiClient.getUserCourses(user.id),
            apiClient.getOwnedProducts(user.id),
            apiClient.getUserFiles(user.id),
          ]);
          setCourses(coursesData);
          setProducts(productsData);
          setFiles(filesData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingData(false);
        }
      }
      fetchData();
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || loadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleDownloadFile = (fileId: string) => {
    const url = apiClient.getFileUrl(fileId);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        داشبورد کاربری
      </h1>
      <p className="text-gray-600 mb-8">
        خوش آمدید {user.first_name} {user.last_name}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">محصولات خریداری شده</h2>
          {products.length === 0 ? (
            <Card>
              <p className="text-gray-600">شما هنوز محصولی خریداری نکرده‌اید.</p>
              <Link href="/products">
                <Button variant="primary" className="mt-4">
                  مشاهده محصولات
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <h3 className="font-semibold mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">${product.price}</span>
                    <span className="text-green-600">نرخ برد: {product.winrate}%</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">دوره‌های قابل دسترسی</h2>
          {courses.length === 0 ? (
            <Card>
              <p className="text-gray-600">شما به هیچ دوره‌ای دسترسی ندارید.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm">{course.description}</p>
                  {course.duration_minutes && (
                    <p className="text-xs text-gray-500 mt-2">
                      مدت زمان: {course.duration_minutes} دقیقه
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">فایل‌های قابل دانلود</h2>
        {files.length === 0 ? (
          <Card>
            <p className="text-gray-600">شما به هیچ فایلی دسترسی ندارید.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id}>
                <h3 className="font-semibold mb-2">{file.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  نوع: {file.type} | حجم: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadFile(file.id)}
                >
                  دانلود
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

