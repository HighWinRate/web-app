'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { TradingSymbol } from '@/lib/types/journal';

interface SymbolsTabProps {
  initialSymbols: TradingSymbol[];
}

export function SymbolsTab({ initialSymbols }: SymbolsTabProps) {
  const [symbols, setSymbols] = useState(initialSymbols);
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newSymbol.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/journal/symbols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newSymbol.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در افزودن سمبل');
      }

      setSymbols([...symbols, data.symbol]);
      setNewSymbol('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این سمبل اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/journal/symbols?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('خطا در حذف سمبل');
      }

      setSymbols(symbols.filter((s) => s.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          افزودن سمبل جدید
        </h3>
        <div className="flex gap-3">
          <Input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="مثال: BTCUSDT, EURUSD, XAUUSD"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button
            variant="primary"
            onClick={handleAdd}
            isLoading={isAdding}
            disabled={!newSymbol.trim()}
          >
            افزودن
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          نکته: سمبل‌ها به صورت خودکار به حروف بزرگ تبدیل می‌شوند
        </p>
      </Card>

      {symbols.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">هنوز سمبلی اضافه نکرده‌اید</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {symbols.map((symbol) => (
            <Card
              key={symbol.id}
              className="p-3 flex items-center justify-between"
            >
              <span className="text-white font-medium">{symbol.name}</span>
              <button
                onClick={() => handleDelete(symbol.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
