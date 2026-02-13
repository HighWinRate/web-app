'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { TradingAccount, CreateAccountData } from '@/lib/types/journal';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: TradingAccount) => void;
}

interface FormErrors {
  name?: string;
  initial_balance?: string;
  currency?: string;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAccountModalProps) {
  const [formData, setFormData] = useState<CreateAccountData>({
    name: '',
    initial_balance: 0,
    currency: 'USD',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name) {
      newErrors.name = 'نام حساب الزامی است';
    }
    if (!formData.initial_balance || formData.initial_balance <= 0) {
      newErrors.initial_balance = 'بالانس اولیه باید بیشتر از صفر باشد';
    }
    if (!formData.currency) {
      newErrors.currency = 'واحد پول الزامی است';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/journal/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limit_reached) {
          alert(data.error);
          onClose();
          return;
        }
        throw new Error(data.error || 'خطا در ایجاد حساب');
      }

      onSuccess(data.account);
      setFormData({ name: '', initial_balance: 0, currency: 'USD' });
    } catch (error: any) {
      alert(error.message || 'خطا در ایجاد حساب');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', initial_balance: 0, currency: 'USD' });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="ایجاد حساب جدید">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="نام حساب"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="مثال: فاندد نکست ۱۰۰ کا"
          required
        />

        <Input
          label="بالانس اولیه"
          type="number"
          value={formData.initial_balance || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              initial_balance: parseFloat(e.target.value) || 0,
            })
          }
          error={errors.initial_balance}
          placeholder="10000"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            واحد پول
          </label>
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          >
            <option value="USD">دلار (USD)</option>
            <option value="EUR">یورو (EUR)</option>
            <option value="IRR">تومان (IRR)</option>
            <option value="BTC">بیت کوین (BTC)</option>
          </select>
          {errors.currency && (
            <p className="text-red-400 text-sm mt-1">{errors.currency}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            انصراف
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            ایجاد حساب
          </Button>
        </div>
      </form>
    </Modal>
  );
}
