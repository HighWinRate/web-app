'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { register, isAuthenticated, loading, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const hasRedirected = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) {
      return;
    }

    // Redirect if authenticated and on register page
    if (isAuthenticated && user && pathname === '/register' && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, user, router, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setRegisterSuccess(false);
    hasRedirected.current = false;

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      setRegisterSuccess(true);
      // useEffect will handle the redirect if authenticated
      // If email confirmation is required, user won't be authenticated yet
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
      </div>
    );
  }

  // Don't render form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10">
        <div className="space-y-3">
          <h2 className="text-center text-4xl font-bold text-foreground tracking-tight">
            ایجاد حساب کاربری
          </h2>
          <p className="text-center text-base text-muted-foreground">
            یا{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
              وارد شوید
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`px-5 py-4 rounded-lg border-2 font-medium ${
              error.includes('موفقیت') 
                ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400'
                : 'bg-destructive/10 border-destructive/50 text-destructive'
            }`}>
              {error}
            </div>
          )}
          <div className="space-y-5">
            <Input
              label="نام"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              placeholder="نام"
            />
            <Input
              label="نام خانوادگی"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              placeholder="نام خانوادگی"
            />
            <Input
              label="ایمیل"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="example@email.com"
            />
            <Input
              label="رمز عبور"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="حداقل 6 کاراکتر"
              minLength={6}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              ثبت‌نام
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

