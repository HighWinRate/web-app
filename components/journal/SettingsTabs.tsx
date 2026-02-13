'use client';

import { useState } from 'react';
import { SymbolsTab } from './settings/SymbolsTab';
import { SetupsTab } from './settings/SetupsTab';
import { EntryChecklistsTab } from './settings/EntryChecklistsTab';
import { ExitChecklistsTab } from './settings/ExitChecklistsTab';
import type {
  TradingSymbol,
  TradingSetup,
  EntryChecklist,
  ExitChecklist,
} from '@/lib/types/journal';

interface SettingsTabsProps {
  initialSymbols: TradingSymbol[];
  initialSetups: TradingSetup[];
  initialEntryChecklists: EntryChecklist[];
  initialExitChecklists: ExitChecklist[];
}

type TabType = 'symbols' | 'setups' | 'entry-checklists' | 'exit-checklists';

export function SettingsTabs({
  initialSymbols,
  initialSetups,
  initialEntryChecklists,
  initialExitChecklists,
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('symbols');

  const tabs = [
    { id: 'symbols' as TabType, label: 'سمبل‌ها', count: initialSymbols.length },
    { id: 'setups' as TabType, label: 'ستاپ‌ها', count: initialSetups.length },
    {
      id: 'entry-checklists' as TabType,
      label: 'چک‌لیست ورود',
      count: initialEntryChecklists.length,
    },
    {
      id: 'exit-checklists' as TabType,
      label: 'چک‌لیست خروج',
      count: initialExitChecklists.length,
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-700 mb-6">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'symbols' && (
          <SymbolsTab initialSymbols={initialSymbols} />
        )}
        {activeTab === 'setups' && <SetupsTab initialSetups={initialSetups} />}
        {activeTab === 'entry-checklists' && (
          <EntryChecklistsTab initialChecklists={initialEntryChecklists} />
        )}
        {activeTab === 'exit-checklists' && (
          <ExitChecklistsTab initialChecklists={initialExitChecklists} />
        )}
      </div>
    </div>
  );
}
