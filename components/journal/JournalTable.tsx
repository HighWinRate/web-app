'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { AddTradeModal } from './AddTradeModal';
import { EditTradeModal } from './EditTradeModal';
import { ChecklistViewModal } from './ChecklistViewModal';
import { ScreenshotModal } from './ScreenshotModal';
import {
  enhanceJournalEntry,
  getOutcomeDisplay,
  formatPersianNumber,
  formatCurrency,
  formatPercentage,
  getValueColorClass,
} from '@/lib/utils/journalCalculations';
import type {
  TradingAccount,
  JournalEntry,
  JournalEntryWithCalculations,
  TrialLimits,
  TradingSymbol,
  TradingSetup,
  EntryChecklist,
  ExitChecklist,
} from '@/lib/types/journal';

interface JournalTableProps {
  account: TradingAccount;
  initialEntries: JournalEntry[];
  limits: TrialLimits;
  symbols: TradingSymbol[];
  setups: TradingSetup[];
  entryChecklists: EntryChecklist[];
  exitChecklists: ExitChecklist[];
}

export function JournalTable({
  account,
  initialEntries,
  limits,
  symbols,
  setups,
  entryChecklists,
  exitChecklists,
}: JournalTableProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Enhance entries with calculated fields
  const enhancedEntries: JournalEntryWithCalculations[] = entries.map(
    (entry, index) => enhanceJournalEntry(entry, account, entries, index),
  );

  const handleTradeAdded = (newEntry: JournalEntry) => {
    setEntries([newEntry, ...entries]);
    setIsAddModalOpen(false);
  };

  const handleTradeUpdated = (updatedEntry: JournalEntry) => {
    setEntries(entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
    setEditingEntry(null);
  };

  const handleTradeDeleted = (entryId: string) => {
    setEntries(entries.filter((e) => e.id !== entryId));
  };

  const canAddTrade =
    limits.can_add_trade || entries.filter((e) => e.operation_type === 'trade').length < 10;

  if (entries.length === 0) {
    return (
      <>
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              هنوز تریدی ثبت نکرده‌اید
            </h3>
            <p className="text-gray-400 mb-6">
              شروع کنید به ثبت تریدهای خود و آنها را تحلیل کنید
            </p>
            {!canAddTrade && (
              <p className="text-red-400 text-sm mb-4">
                به محدودیت تریدها رسیده‌اید. برای ادامه اشتراک خریداری کنید.
              </p>
            )}
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              disabled={!canAddTrade}
            >
              {canAddTrade ? 'افزودن اولین ترید' : 'محدودیت تریدها'}
            </Button>
          </div>
        </Card>

        <AddTradeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleTradeAdded}
          account={account}
          symbols={symbols}
          setups={setups}
          entryChecklists={entryChecklists}
          exitChecklists={exitChecklists}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          ژورنال تریدها ({entries.length})
        </h2>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          disabled={!canAddTrade}
        >
          {canAddTrade ? 'افزودن ترید جدید' : 'محدودیت تریدها'}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-3 py-3 text-right text-gray-400 font-medium sticky right-0 bg-gray-900 z-10">
                  ردیف
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  نتیجه
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  روز هفته
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  تاریخ ورود
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  سمبل
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  نوع
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  ستاپ
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  جهت
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  سایز
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  چک‌لیست ورود
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  امتیاز ورود
                </th>
                <th className="px-3 py-3 text-center text-gray-400 font-medium">
                  اسکرین‌شات ورود
                </th>
                <th className="px-3 py-3 text-center text-gray-400 font-medium">
                  اسکرین‌شات خروج
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  Net PnL
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  کمیسیون
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  سواپ
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  تاریخ خروج
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  چک‌لیست خروج
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  امتیاز خروج
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  بالانس جدید
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  درصد تغییر
                </th>
                <th className="px-3 py-3 text-right text-gray-400 font-medium">
                  یادداشت
                </th>
                <th className="px-3 py-3 text-center text-gray-400 font-medium">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {enhancedEntries.map((entry, index) => (
                <JournalRow
                  key={entry.id}
                  entry={entry}
                  rowNumber={index + 1}
                  currency={account.currency}
                  onEdit={() => setEditingEntry(entries.find((e) => e.id === entry.id)!)}
                  onDelete={() => handleTradeDeleted(entry.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTradeAdded}
        account={account}
        symbols={symbols}
        setups={setups}
        entryChecklists={entryChecklists}
        exitChecklists={exitChecklists}
      />

      {editingEntry && (
        <EditTradeModal
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          onSuccess={handleTradeUpdated}
          onDelete={handleTradeDeleted}
          entry={editingEntry}
          account={account}
          symbols={symbols}
          setups={setups}
          entryChecklists={entryChecklists}
          exitChecklists={exitChecklists}
        />
      )}
    </>
  );
}

interface JournalRowProps {
  entry: JournalEntryWithCalculations;
  rowNumber: number;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}

function JournalRow({ entry, rowNumber, currency, onEdit, onDelete }: JournalRowProps) {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showExitChecklist, setShowExitChecklist] = useState(false);
  const [showEntryScreenshot, setShowEntryScreenshot] = useState(false);
  const [showExitScreenshot, setShowExitScreenshot] = useState(false);
  const outcome = getOutcomeDisplay(entry.outcome);

  const handleDelete = async () => {
    if (!confirm('آیا از حذف این ورودی اطمینان دارید؟')) return;

    try {
      const res = await fetch(`/api/journal/entries/${entry.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('خطا در حذف ورودی');
      }

      onDelete();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleScreenshotUpload = async (file: File, type: 'entry' | 'exit') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entry_id', entry.id);
    formData.append('type', type);

    const res = await fetch('/api/journal/screenshots', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'خطا در آپلود اسکرین‌شات');
    }

    // Refresh page to show new screenshot
    window.location.reload();
  };

  const handleScreenshotDelete = async (type: 'entry' | 'exit') => {
    const res = await fetch(
      `/api/journal/screenshots?entry_id=${entry.id}&type=${type}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'خطا در حذف اسکرین‌شات');
    }

    // Refresh page to update UI
    window.location.reload();
  };

  return (
    <tr className="hover:bg-gray-750 transition-colors">
      {/* Row Number */}
      <td className="px-3 py-3 text-white font-medium sticky right-0 bg-gray-800 z-10">
        {rowNumber}
      </td>

      {/* Outcome Icon */}
      <td className="px-3 py-3">
        <span className="text-lg">{outcome.icon}</span>
      </td>

      {/* Day of Week */}
      <td className="px-3 py-3 text-gray-300">{entry.entry_day_of_week}</td>

      {/* Entry Date */}
      <td className="px-3 py-3 text-gray-300 whitespace-nowrap">
        {new Date(entry.entry_date).toLocaleDateString('fa-IR')}
        {entry.show_entry_time &&
          ` ${new Date(entry.entry_date).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`}
      </td>

      {/* Symbol */}
      <td className="px-3 py-3 text-white font-medium">
        {entry.symbol?.name || '-'}
      </td>

      {/* Operation Type */}
      <td className="px-3 py-3">
        <span
          className={`px-2 py-1 rounded text-xs ${
            entry.operation_type === 'trade'
              ? 'bg-blue-500/20 text-blue-400'
              : entry.operation_type === 'deposit'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          {entry.operation_type === 'trade'
            ? 'ترید'
            : entry.operation_type === 'deposit'
              ? 'واریز'
              : 'برداشت'}
        </span>
      </td>

      {/* Setup */}
      <td className="px-3 py-3 text-gray-300">
        {entry.setup?.name || '-'}
      </td>

      {/* Direction */}
      <td className="px-3 py-3">
        {entry.direction && (
          <span
            className={`px-2 py-1 rounded text-xs ${
              entry.direction === 'buy'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {entry.direction === 'buy' ? 'خرید' : 'فروش'}
          </span>
        )}
      </td>

      {/* Size */}
      <td className="px-3 py-3 text-gray-300">
        {entry.size ? formatPersianNumber(entry.size) : '-'}
      </td>

      {/* Checklist */}
      <td className="px-3 py-3 text-center">
        {entry.entry_checklist_results && Object.keys(entry.entry_checklist_results).length > 0 ? (
          <button
            onClick={() => setShowChecklist(true)}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            مشاهده
          </button>
        ) : (
          <span className="text-gray-500 text-xs">-</span>
        )}
        {showChecklist && entry.entry_checklist && (
          <ChecklistViewModal
            isOpen={showChecklist}
            onClose={() => setShowChecklist(false)}
            checklist={entry.entry_checklist}
            results={entry.entry_checklist_results}
          />
        )}
      </td>

      {/* Entry Score */}
      <td className="px-3 py-3 text-center">
        {entry.entry_score > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
            {entry.entry_score}
          </span>
        )}
      </td>

      {/* Entry Screenshot */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => setShowEntryScreenshot(true)}
          className={`text-sm ${
            entry.entry_screenshot_url
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-gray-500 hover:text-gray-400'
          }`}
          title={entry.entry_screenshot_url ? 'مشاهده اسکرین‌شات' : 'افزودن اسکرین‌شات'}
        >
          {entry.entry_screenshot_url ? '📸' : '➕'}
        </button>
        {showEntryScreenshot && (
          <ScreenshotModal
            isOpen={showEntryScreenshot}
            onClose={() => setShowEntryScreenshot(false)}
            onSave={(file) => handleScreenshotUpload(file, 'entry')}
            onDelete={
              entry.entry_screenshot_url
                ? () => handleScreenshotDelete('entry')
                : undefined
            }
            currentImageUrl={entry.entry_screenshot_url}
            title="اسکرین‌شات ورود"
          />
        )}
      </td>

      {/* Exit Screenshot */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => setShowExitScreenshot(true)}
          className={`text-sm ${
            entry.exit_screenshot_url
              ? 'text-blue-400 hover:text-blue-300'
              : 'text-gray-500 hover:text-gray-400'
          }`}
          title={entry.exit_screenshot_url ? 'مشاهده اسکرین‌شات' : 'افزودن اسکرین‌شات'}
        >
          {entry.exit_screenshot_url ? '📸' : '➕'}
        </button>
        {showExitScreenshot && (
          <ScreenshotModal
            isOpen={showExitScreenshot}
            onClose={() => setShowExitScreenshot(false)}
            onSave={(file) => handleScreenshotUpload(file, 'exit')}
            onDelete={
              entry.exit_screenshot_url
                ? () => handleScreenshotDelete('exit')
                : undefined
            }
            currentImageUrl={entry.exit_screenshot_url}
            title="اسکرین‌شات خروج"
          />
        )}
      </td>

      {/* Net PnL */}
      <td className={`px-3 py-3 font-medium ${getValueColorClass(entry.net_pnl || 0)}`}>
        {entry.net_pnl !== undefined && entry.net_pnl !== null
          ? formatCurrency(entry.net_pnl, currency)
          : '-'}
      </td>

      {/* Commission */}
      <td className="px-3 py-3 text-gray-400 text-xs">
        {entry.commission ? formatCurrency(entry.commission, currency) : '-'}
      </td>

      {/* Swap */}
      <td className="px-3 py-3 text-gray-400 text-xs">
        {entry.swap ? formatCurrency(entry.swap, currency) : '-'}
      </td>

      {/* Exit Date */}
      <td className="px-3 py-3 text-gray-300 whitespace-nowrap">
        {entry.exit_date
          ? `${new Date(entry.exit_date).toLocaleDateString('fa-IR')}${
              entry.show_exit_time
                ? ` ${new Date(entry.exit_date).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
                : ''
            }`
          : '-'}
      </td>

      {/* Exit Checklist */}
      <td className="px-3 py-3 text-center">
        {entry.exit_checklist_results && Object.keys(entry.exit_checklist_results).length > 0 ? (
          <button
            onClick={() => setShowExitChecklist(true)}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            مشاهده
          </button>
        ) : (
          <span className="text-gray-500 text-xs">-</span>
        )}
        {showExitChecklist && entry.exit_checklist && (
          <ChecklistViewModal
            isOpen={showExitChecklist}
            onClose={() => setShowExitChecklist(false)}
            checklist={entry.exit_checklist}
            results={entry.exit_checklist_results}
          />
        )}
      </td>

      {/* Exit Score */}
      <td className="px-3 py-3 text-center">
        {entry.exit_score > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
            {entry.exit_score}
          </span>
        )}
      </td>

      {/* New Balance */}
      <td className="px-3 py-3 text-white font-medium whitespace-nowrap">
        {formatCurrency(entry.new_balance, currency)}
      </td>

      {/* Balance Change % */}
      <td
        className={`px-3 py-3 font-medium ${getValueColorClass(entry.balance_change_percentage)}`}
      >
        {entry.balance_change_percentage >= 0 ? '+' : ''}
        {formatPercentage(entry.balance_change_percentage)}
      </td>

      {/* Notes */}
      <td className="px-3 py-3 text-gray-400 text-xs max-w-xs truncate">
        {entry.notes || '-'}
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onEdit}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="ویرایش"
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
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="حذف"
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
      </td>
    </tr>
  );
}
