'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { DateTimeInput } from './DateTimeInput';
import { ChecklistSelector } from './ChecklistSelector';
import { PnLModal, PnLData } from './PnLModal';
import type {
  TradingAccount,
  JournalEntry,
  UpdateJournalEntryData,
  OperationType,
  Direction,
  TradingSymbol,
  TradingSetup,
  EntryChecklist,
  ExitChecklist,
  ChecklistResults,
} from '@/lib/types/journal';

interface EditTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
  entry: JournalEntry;
  account: TradingAccount;
  symbols: TradingSymbol[];
  setups: TradingSetup[];
  entryChecklists: EntryChecklist[];
  exitChecklists: ExitChecklist[];
}

export function EditTradeModal({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  entry,
  account,
  symbols,
  setups,
  entryChecklists,
  exitChecklists,
}: EditTradeModalProps) {
  const [formData, setFormData] = useState<UpdateJournalEntryData>({
    entry_date: entry.entry_date,
    show_entry_time: entry.show_entry_time,
    symbol_id: entry.symbol_id,
    operation_type: entry.operation_type,
    setup_id: entry.setup_id,
    direction: entry.direction,
    size: entry.size,
    entry_emotions: entry.entry_emotions,
    entry_checklist_id: entry.entry_checklist_id,
    risk_percentage: entry.risk_percentage,
    net_pnl: entry.net_pnl,
    gross_pnl: entry.gross_pnl,
    commission: entry.commission,
    swap: entry.swap,
    exit_date: entry.exit_date,
    show_exit_time: entry.show_exit_time,
    exit_checklist_id: entry.exit_checklist_id,
    exit_emotions: entry.exit_emotions,
    notes: entry.notes,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPnlModalOpen, setIsPnlModalOpen] = useState(false);
  const [checklistResults, setChecklistResults] = useState<ChecklistResults>(
    entry.entry_checklist_results || {}
  );
  const [exitChecklistResults, setExitChecklistResults] = useState<ChecklistResults>(
    entry.exit_checklist_results || {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrors({});

    try {
      // Add checklist data to form
      const submitData = {
        ...formData,
        entry_checklist_results: formData.entry_checklist_id ? checklistResults : undefined,
        exit_checklist_results: formData.exit_checklist_id ? exitChecklistResults : undefined,
      };

      const res = await fetch(`/api/journal/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در به‌روزرسانی ترید');
      }

      onSuccess(data.entry);
    } catch (error: any) {
      alert(error.message || 'خطا در به‌روزرسانی ترید');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePnlSave = (pnlData: PnLData) => {
    setFormData({
      ...formData,
      net_pnl: pnlData.net_pnl,
      gross_pnl: pnlData.gross_pnl,
      commission: pnlData.commission,
      swap: pnlData.swap,
    });
    setIsPnlModalOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm('آیا از حذف این ورودی اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/journal/entries/${entry.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'خطا در حذف ورودی');
      }

      onDelete(entry.id);
      onClose();
    } catch (error: any) {
      alert(error.message || 'خطا در حذف ورودی');
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="ویرایش ورودی"
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

          {/* Symbol */}
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
            </div>
          )}

          {/* Setup */}
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

          {/* Direction */}
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

          {/* Size & Risk */}
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
            />
          </div>

          {/* PnL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              سود/زیان
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPnlModalOpen(true)}
              className="w-full"
            >
              {formData.net_pnl !== undefined && formData.net_pnl !== null
                ? `Net PnL: ${formData.net_pnl} ${account.currency}`
                : 'وارد کردن Net PnL'}
            </Button>
          </div>

          {/* Exit Date */}
          <DateTimeInput
            label="تاریخ و ساعت خروج"
            value={formData.exit_date || ''}
            onChange={(value) => setFormData({ ...formData, exit_date: value })}
            showTime={formData.show_exit_time}
            onShowTimeChange={(show) =>
              setFormData({ ...formData, show_exit_time: show })
            }
            optional
          />

          {/* Emotions */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="احساسات ورود"
              type="text"
              value={formData.entry_emotions || ''}
              onChange={(e) =>
                setFormData({ ...formData, entry_emotions: e.target.value })
              }
            />
            <Input
              label="احساسات خروج"
              type="text"
              value={formData.exit_emotions || ''}
              onChange={(e) =>
                setFormData({ ...formData, exit_emotions: e.target.value })
              }
            />
          </div>

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
            />
          </div>

          <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              حذف ورودی
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                ذخیره تغییرات
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {isPnlModalOpen && (
        <PnLModal
          isOpen={isPnlModalOpen}
          onClose={() => setIsPnlModalOpen(false)}
          onSave={handlePnlSave}
          initialData={{
            mode: formData.gross_pnl ? 'detailed' : 'simple',
            net_pnl: formData.net_pnl,
            gross_pnl: formData.gross_pnl,
            commission: formData.commission,
            swap: formData.swap,
          }}
        />
      )}
    </>
  );
}
