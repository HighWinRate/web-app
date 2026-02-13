'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface PnLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PnLData) => void;
  initialData?: PnLData;
}

export interface PnLData {
  mode: 'simple' | 'detailed';
  net_pnl?: number;
  gross_pnl?: number;
  commission?: number;
  swap?: number;
}

export function PnLModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PnLModalProps) {
  const [mode, setMode] = useState<'simple' | 'detailed'>(
    initialData?.mode || 'simple',
  );
  const [netPnl, setNetPnl] = useState<string>(
    initialData?.net_pnl?.toString() || '',
  );
  const [grossPnl, setGrossPnl] = useState<string>(
    initialData?.gross_pnl?.toString() || '',
  );
  const [commission, setCommission] = useState<string>(
    initialData?.commission?.toString() || '',
  );
  const [swap, setSwap] = useState<string>(initialData?.swap?.toString() || '');

  const handleSave = () => {
    if (mode === 'simple') {
      if (!netPnl) {
        alert('مقدار Net PnL الزامی است');
        return;
      }
      onSave({
        mode: 'simple',
        net_pnl: parseFloat(netPnl),
      });
    } else {
      if (!grossPnl) {
        alert('مقدار Gross PnL الزامی است');
        return;
      }
      const calculated =
        parseFloat(grossPnl) -
        (parseFloat(commission) || 0) +
        (parseFloat(swap) || 0);
      onSave({
        mode: 'detailed',
        net_pnl: calculated,
        gross_pnl: parseFloat(grossPnl),
        commission: parseFloat(commission) || undefined,
        swap: parseFloat(swap) || undefined,
      });
    }
  };

  const calculatedNetPnl =
    mode === 'detailed' && grossPnl
      ? parseFloat(grossPnl) -
        (parseFloat(commission) || 0) +
        (parseFloat(swap) || 0)
      : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="وارد کردن Net PnL">
      <div className="space-y-4">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            حالت ورود
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === 'simple'}
                onChange={() => setMode('simple')}
                className="w-4 h-4"
              />
              مستقیم (Net PnL)
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === 'detailed'}
                onChange={() => setMode('detailed')}
                className="w-4 h-4"
              />
              جزئیات (Gross + Commission + Swap)
            </label>
          </div>
        </div>

        {mode === 'simple' ? (
          /* Simple Mode */
          <Input
            label="Net PnL"
            type="number"
            step="0.01"
            value={netPnl}
            onChange={(e) => setNetPnl(e.target.value)}
            placeholder="مثال: 150.50 یا -75.25"
            required
          />
        ) : (
          /* Detailed Mode */
          <>
            <Input
              label="Gross PnL"
              type="number"
              step="0.01"
              value={grossPnl}
              onChange={(e) => setGrossPnl(e.target.value)}
              placeholder="سود/زیان ناخالص"
              required
            />
            <div>
              <Input
                label="کمیسیون"
                type="number"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="مقدار کمیسیون (عدد مثبت)"
              />
              <p className="text-xs text-gray-400 mt-1">
                مقدار کمیسیون به صورت مثبت وارد شود
              </p>
            </div>
            <div>
              <Input
                label="سواپ"
                type="number"
                step="0.01"
                value={swap}
                onChange={(e) => setSwap(e.target.value)}
                placeholder="مقدار سواپ (مثبت یا منفی)"
              />
              <p className="text-xs text-gray-400 mt-1">
                سواپ مثبت (دریافتی) یا منفی (پرداختی)
              </p>
            </div>

            {calculatedNetPnl !== null && (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">
                  Net PnL محاسبه شده:
                </div>
                <div
                  className={`text-2xl font-bold ${
                    calculatedNetPnl >= 0 ? 'text-blue-400' : 'text-red-400'
                  }`}
                >
                  {calculatedNetPnl >= 0 ? '+' : ''}
                  {calculatedNetPnl.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  = Gross ({grossPnl || 0}) - کمیسیون ({commission || 0}) +
                  سواپ ({swap || 0})
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={
              mode === 'simple'
                ? !netPnl
                : !grossPnl
            }
          >
            ذخیره
          </Button>
        </div>
      </div>
    </Modal>
  );
}
