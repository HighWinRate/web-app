'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ChecklistEditor } from '../ChecklistEditor';
import type { EntryChecklist, ChecklistItem } from '@/lib/types/journal';

interface EntryChecklistsTabProps {
  initialChecklists: EntryChecklist[];
}

export function EntryChecklistsTab({
  initialChecklists,
}: EntryChecklistsTabProps) {
  const [checklists, setChecklists] = useState(initialChecklists);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = (newChecklist: EntryChecklist) => {
    setChecklists([...checklists, newChecklist]);
    setIsCreating(false);
  };

  const handleUpdate = (updatedChecklist: EntryChecklist) => {
    setChecklists(
      checklists.map((c) =>
        c.id === updatedChecklist.id ? updatedChecklist : c,
      ),
    );
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این چک‌لیست اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/journal/checklists/entry?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('خطا در حذف چک‌لیست');
      }

      setChecklists(checklists.filter((c) => c.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          افزودن چک‌لیست جدید
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4 mb-6">
          <ChecklistEditor
            type="entry"
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </Card>
      )}

      {checklists.length === 0 && !isCreating ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">
            هنوز چک‌لیست ورودی اضافه نکرده‌اید
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist) => (
            <Card key={checklist.id} className="p-4">
              {editingId === checklist.id ? (
                <ChecklistEditor
                  type="entry"
                  initialData={checklist}
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-semibold text-lg">
                      {checklist.name}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(checklist.id)}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(checklist.id)}
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
                  </div>
                  <ul className="space-y-2">
                    {checklist.items.map((item, index) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">
                          {index + 1}.
                        </span>
                        <span className="text-gray-300">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
