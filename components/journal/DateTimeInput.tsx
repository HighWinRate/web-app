'use client';

import { Input } from '../ui/Input';

interface DateTimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showTime?: boolean;
  onShowTimeChange?: (show: boolean) => void;
  optional?: boolean;
}

export function DateTimeInput({
  label,
  value,
  onChange,
  showTime = true,
  onShowTimeChange,
  optional = false,
}: DateTimeInputProps) {
  // Convert ISO string to datetime-local format
  const datetimeLocalValue = value ? value.slice(0, 16) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      // Convert back to ISO string
      onChange(new Date(newValue).toISOString());
    } else {
      onChange('');
    }
  };

  const handleInsertNow = () => {
    onChange(new Date().toISOString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          {label} {!optional && '*'}
        </label>
        <button
          type="button"
          onClick={handleInsertNow}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          الان
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="datetime-local"
          value={datetimeLocalValue}
          onChange={handleChange}
          required={!optional}
        />
        {onShowTimeChange && (
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showTime}
                onChange={(e) => onShowTimeChange(e.target.checked)}
                className="w-4 h-4"
              />
              نمایش ساعت
            </label>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">
        فرمت تاریخ: میلادی (برای راحتی ورود)
      </p>
    </div>
  );
}
