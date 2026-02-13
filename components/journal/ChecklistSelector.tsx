'use client';

import { useState, useEffect } from 'react';
import type { EntryChecklist, ChecklistResults } from '@/lib/types/journal';

interface ChecklistSelectorProps {
  checklists: EntryChecklist[];
  selectedChecklistId?: string;
  results?: ChecklistResults;
  onChange: (checklistId: string | undefined, results: ChecklistResults) => void;
}

export function ChecklistSelector({
  checklists,
  selectedChecklistId,
  results = {},
  onChange,
}: ChecklistSelectorProps) {
  const [localChecklistId, setLocalChecklistId] = useState(selectedChecklistId);
  const [localResults, setLocalResults] = useState<ChecklistResults>(results);

  const selectedChecklist = checklists.find((c) => c.id === localChecklistId);

  useEffect(() => {
    setLocalChecklistId(selectedChecklistId);
    setLocalResults(results);
  }, [selectedChecklistId, results]);

  const handleChecklistChange = (checklistId: string) => {
    const newChecklistId = checklistId || undefined;
    setLocalChecklistId(newChecklistId);
    
    // Reset results when changing checklist
    const newResults: ChecklistResults = {};
    if (newChecklistId) {
      const checklist = checklists.find((c) => c.id === newChecklistId);
      if (checklist) {
        // Initialize all items as unchecked
        checklist.items.forEach((item) => {
          newResults[item.id] = false;
        });
      }
    }
    setLocalResults(newResults);
    onChange(newChecklistId, newResults);
  };

  const handleItemToggle = (itemId: string) => {
    const newResults = {
      ...localResults,
      [itemId]: !localResults[itemId],
    };
    setLocalResults(newResults);
    onChange(localChecklistId, newResults);
  };

  const checkedCount = Object.values(localResults).filter((v) => v === true).length;
  const totalCount = selectedChecklist?.items.length || 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          چک‌لیست ورود
        </label>
        <select
          value={localChecklistId || ''}
          onChange={(e) => handleChecklistChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">بدون چک‌لیست</option>
          {checklists.map((checklist) => (
            <option key={checklist.id} value={checklist.id}>
              {checklist.name}
            </option>
          ))}
        </select>
        {checklists.length === 0 && (
          <p className="text-yellow-400 text-sm mt-1">
            ابتدا از تنظیمات، چک‌لیست‌های خود را اضافه کنید
          </p>
        )}
      </div>

      {selectedChecklist && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <span className="text-sm font-medium text-gray-300">
              شرایط ورود:
            </span>
            <span className="text-sm font-bold text-blue-400">
              امتیاز: {checkedCount} / {totalCount}
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedChecklist.items.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  localResults[item.id]
                    ? 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20'
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={localResults[item.id] || false}
                  onChange={() => handleItemToggle(item.id)}
                  className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                />
                <span className="flex-1 text-gray-300">{item.text}</span>
                {localResults[item.id] && (
                  <span className="text-green-400 text-lg">✓</span>
                )}
              </label>
            ))}
          </div>

          {checkedCount < totalCount && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-2">
              <p className="text-yellow-400 text-xs">
                ⚠️ {totalCount - checkedCount} مورد از شرایط ورود رعایت نشده
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
