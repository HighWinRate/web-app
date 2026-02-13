'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { TradingSetup } from '@/lib/types/journal';

interface SetupsTabProps {
  initialSetups: TradingSetup[];
}

export function SetupsTab({ initialSetups }: SetupsTabProps) {
  const [setups, setSetups] = useState(initialSetups);
  const [newSetup, setNewSetup] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newSetup.name.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/journal/setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newSetup.name.trim(),
          description: newSetup.description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در افزودن ستاپ');
      }

      setSetups([...setups, data.setup]);
      setNewSetup({ name: '', description: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این ستاپ اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/journal/setups?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('خطا در حذف ستاپ');
      }

      setSetups(setups.filter((s) => s.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          افزودن ستاپ جدید
        </h3>
        <div className="space-y-3">
          <Input
            type="text"
            value={newSetup.name}
            onChange={(e) =>
              setNewSetup({ ...newSetup, name: e.target.value })
            }
            placeholder="نام ستاپ (مثال: Breakout، Support/Resistance)"
          />
          <Input
            type="text"
            value={newSetup.description}
            onChange={(e) =>
              setNewSetup({ ...newSetup, description: e.target.value })
            }
            placeholder="توضیحات (اختیاری)"
          />
          <Button
            variant="primary"
            onClick={handleAdd}
            isLoading={isAdding}
            disabled={!newSetup.name.trim()}
          >
            افزودن ستاپ
          </Button>
        </div>
      </Card>

      {setups.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">هنوز ستاپی اضافه نکرده‌اید</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {setups.map((setup) => (
            <Card key={setup.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">
                    {setup.name}
                  </h4>
                  {setup.description && (
                    <p className="text-sm text-gray-400">{setup.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(setup.id)}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
