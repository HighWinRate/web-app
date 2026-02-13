'use client';

import { Modal } from '../ui/Modal';
import type { EntryChecklist, ChecklistResults } from '@/lib/types/journal';

interface ChecklistViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: EntryChecklist;
  results?: ChecklistResults;
}

export function ChecklistViewModal({
  isOpen,
  onClose,
  checklist,
  results = {},
}: ChecklistViewModalProps) {
  const totalItems = checklist.items.length;
  const checkedItems = Object.values(results).filter((v) => v === true).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={checklist.name}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <span className="text-gray-300">امتیاز:</span>
          <span className="text-xl font-bold text-blue-400">
            {checkedItems} / {totalItems}
          </span>
        </div>

        <div className="space-y-2">
          {checklist.items.map((item, index) => {
            const isChecked = results[item.id] === true;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isChecked
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-red-500/50 bg-red-500/10'
                }`}
              >
                <span className="text-2xl">
                  {isChecked ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <span className="text-gray-300">{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {checkedItems < totalItems && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ توجه: {totalItems - checkedItems} مورد از شرایط ورود رعایت نشده است
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
