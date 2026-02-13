'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type {
  EntryChecklist,
  ExitChecklist,
  ChecklistItem,
} from '@/lib/types/journal';

interface ChecklistEditorProps {
  type: 'entry' | 'exit';
  initialData?: EntryChecklist | ExitChecklist;
  onSave: (checklist: EntryChecklist | ExitChecklist) => void;
  onCancel: () => void;
}

export function ChecklistEditor({
  type,
  initialData,
  onSave,
  onCancel,
}: ChecklistEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [items, setItems] = useState<Omit<ChecklistItem, 'id'>[]>(
    initialData?.items.map((item) => ({ text: item.text, order: item.order })) ||
      [{ text: '', order: 0 }],
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { text: '', order: items.length }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('نام چک‌لیست الزامی است');
      return;
    }

    const filteredItems = items.filter((item) => item.text.trim());
    if (filteredItems.length === 0) {
      alert('حداقل یک آیتم در چک‌لیست الزامی است');
      return;
    }

    setIsSaving(true);
    try {
      const endpoint =
        type === 'entry'
          ? '/api/journal/checklists/entry'
          : '/api/journal/checklists/exit';

      const method = initialData ? 'PATCH' : 'POST';
      const url = initialData ? `${endpoint}?id=${initialData.id}` : endpoint;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          items: filteredItems.map((item, index) => ({
            id: `item-${index}`,
            text: item.text.trim(),
            order: index,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در ذخیره چک‌لیست');
      }

      onSave(data.checklist);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="نام چک‌لیست"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`مثال: چک‌لیست ${type === 'entry' ? 'ورود' : 'خروج'} اصلی`}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          آیتم‌های چک‌لیست
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={item.text}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={`آیتم ${index + 1}`}
              />
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="px-3 text-red-400 hover:text-red-300"
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
              )}
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddItem}
          className="mt-2"
        >
          + افزودن آیتم
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          انصراف
        </Button>
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          {initialData ? 'ذخیره تغییرات' : 'ایجاد چک‌لیست'}
        </Button>
      </div>
    </div>
  );
}
