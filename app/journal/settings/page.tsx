import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserSymbols,
  getUserSetups,
  getUserEntryChecklists,
  getUserExitChecklists,
} from '@/lib/data/journal';
import { SettingsTabs } from '@/components/journal/SettingsTabs';

export default async function JournalSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectedFrom=/journal/settings');
  }

  const [symbols, setups, entryChecklists, exitChecklists] = await Promise.all([
    getUserSymbols(user.id),
    getUserSetups(user.id),
    getUserEntryChecklists(user.id),
    getUserExitChecklists(user.id),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">تنظیمات ژورنال</h1>
        <p className="text-gray-400">
          مدیریت سمبل‌ها، ستاپ‌ها و چک‌لیست‌های معاملاتی
        </p>
      </div>

      <SettingsTabs
        initialSymbols={symbols}
        initialSetups={setups}
        initialEntryChecklists={entryChecklists}
        initialExitChecklists={exitChecklists}
      />
    </div>
  );
}
