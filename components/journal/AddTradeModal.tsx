'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DateTimeInput } from './DateTimeInput';
import { ChecklistSelector } from './ChecklistSelector';
import type {
  TradingAccount,
  JournalEntry,
  CreateJournalEntryData,
  OperationType,
  Direction,
  TradingSymbol,
  TradingSetup,
  EntryChecklist,
  ExitChecklist,
  ChecklistResults,
} from '@/lib/types/journal';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (entry: JournalEntry) => void;
  account: TradingAccount;
  symbols: TradingSymbol[];
  setups: TradingSetup[];
  entryChecklists: EntryChecklist[];
  exitChecklists: ExitChecklist[];
}

export function AddTradeModal({
  isOpen,
  onClose,
  onSuccess,
  account,
  symbols,
  setups,
  entryChecklists,
  exitChecklists,
}: AddTradeModalProps) {
  const [formData, setFormData] = useState<CreateJournalEntryData>({
    account_id: account.id,
    entry_date: new Date().toISOString(),
    show_entry_time: true,
    operation_type: 'trade' as OperationType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistResults, setChecklistResults] = useState<ChecklistResults>({});
  const [exitChecklistResults, setExitChecklistResults] = useState<ChecklistResults>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.entry_date) {
      newErrors.entry_date = 'تاریخ ورود الزامی است';
    }
    if (formData.operation_type === 'trade' && !formData.symbol_id) {
      newErrors.symbol_id = 'سمبل برای تریدها الزامی است';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Add checklist data to form
      const submitData = {
        ...formData,
        entry_checklist_results: formData.entry_checklist_id ? checklistResults : undefined,
        exit_checklist_results: formData.exit_checklist_id ? exitChecklistResults : undefined,
      };

      const res = await fetch(`/api/journal/accounts/${account.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limit_reached) {
          alert(data.error);
          onClose();
          return;
        }
        throw new Error(data.error || 'خطا در افزودن ترید');
      }

      onSuccess(data.entry);
      // Reset form
      setFormData({
        account_id: account.id,
        entry_date: new Date().toISOString(),
        show_entry_time: true,
        operation_type: 'trade',
      });
      setChecklistResults({});
      setExitChecklistResults({});
    } catch (error: any) {
      alert(error.message || 'خطا در افزودن ترید');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        account_id: account.id,
        entry_date: new Date().toISOString(),
        show_entry_time: true,
        operation_type: 'trade',
      });
      setChecklistResults({});
      setExitChecklistResults({});
      setErrors({});
      onClose();
    }
  };

  const handleChecklistChange = (checklistId: string | undefined, results: ChecklistResults) => {
    setFormData({
      ...formData,
      entry_checklist_id: checklistId,
    });
    setChecklistResults(results);
  };

  const handleExitChecklistChange = (checklistId: string | undefined, results: ChecklistResults) => {
    setFormData({
      ...formData,
      exit_checklist_id: checklistId,
    });
    setExitChecklistResults(results);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="افزودن ورودی جدید"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Operation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            نوع عملیات *
          </label>
          <select
            value={formData.operation_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                operation_type: e.target.value as OperationType,
              })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          >
            <option value="trade">ترید</option>
            <option value="deposit">واریز</option>
            <option value="withdrawal">برداشت</option>
          </select>
        </div>

        {/* Entry Date & Time */}
        <DateTimeInput
          label="تاریخ و ساعت ورود"
          value={formData.entry_date || ''}
          onChange={(value) => setFormData({ ...formData, entry_date: value })}
          showTime={formData.show_entry_time}
          onShowTimeChange={(show) =>
            setFormData({ ...formData, show_entry_time: show })
          }
        />

        {/* Symbol (only for trades) */}
        {formData.operation_type === 'trade' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              سمبل *
            </label>
            <select
              value={formData.symbol_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, symbol_id: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">انتخاب سمبل...</option>
              {symbols.map((symbol) => (
                <option key={symbol.id} value={symbol.id}>
                  {symbol.name}
                </option>
              ))}
            </select>
            {errors.symbol_id && (
              <p className="text-red-400 text-sm mt-1">{errors.symbol_id}</p>
            )}
            {symbols.length === 0 && (
              <p className="text-yellow-400 text-sm mt-1">
                ابتدا از تنظیمات، سمبل‌های خود را اضافه کنید
              </p>
            )}
          </div>
        )}

        {/* Setup (only for trades) */}
        {formData.operation_type === 'trade' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ستاپ
            </label>
            <select
              value={formData.setup_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, setup_id: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">انتخاب ستاپ...</option>
              {setups.map((setup) => (
                <option key={setup.id} value={setup.id}>
                  {setup.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Direction (only for trades) */}
        {formData.operation_type === 'trade' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              جهت
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="buy"
                  checked={formData.direction === 'buy'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      direction: e.target.value as Direction,
                    })
                  }
                  className="w-4 h-4"
                />
                خرید
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="sell"
                  checked={formData.direction === 'sell'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      direction: e.target.value as Direction,
                    })
                  }
                  className="w-4 h-4"
                />
                فروش
              </label>
            </div>
          </div>
        )}

        {/* Size & Risk (only for trades) */}
        {formData.operation_type === 'trade' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="سایز"
              type="number"
              step="0.01"
              value={formData.size || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  size: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="0.01"
            />
            <Input
              label="ریسک (%)"
              type="number"
              step="0.1"
              value={formData.risk_percentage || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  risk_percentage: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="1.0"
            />
          </div>
        )}

        {/* Entry Emotions */}
        <Input
          label="احساسات ورود"
          type="text"
          value={formData.entry_emotions || ''}
          onChange={(e) =>
            setFormData({ ...formData, entry_emotions: e.target.value })
          }
          placeholder="آرام، استرس، اعتماد به نفس، ..."
        />

        {/* Entry Checklist (only for trades) */}
        {formData.operation_type === 'trade' && (
          <ChecklistSelector
            checklists={entryChecklists}
            selectedChecklistId={formData.entry_checklist_id}
            results={checklistResults}
            onChange={handleChecklistChange}
          />
        )}

        {/* Exit Checklist (only for trades) */}
        {formData.operation_type === 'trade' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              چک‌لیست خروج
            </label>
            <ChecklistSelector
              checklists={exitChecklists}
              selectedChecklistId={formData.exit_checklist_id}
              results={exitChecklistResults}
              onChange={handleExitChecklistChange}
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            یادداشت
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
            rows={3}
            placeholder="یادداشت‌های اضافی..."
          />
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
            افزودن ورودی
          </Button>
        </div>
      </form>
    </Modal>
  );
}
