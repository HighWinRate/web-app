'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '@/lib/api';

interface TicketsClientProps {
  tickets: Ticket[];
}

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  waiting_for_user: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  closed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  urgent: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'باز',
  in_progress: 'در حال بررسی',
  waiting_for_user: 'در انتظار کاربر',
  resolved: 'حل شده',
  closed: 'بسته شده',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'پایین',
  medium: 'متوسط',
  high: 'بالا',
  urgent: 'فوری',
};

const typeLabels: Record<TicketType, string> = {
  technical: 'فنی',
  billing: 'مالی',
  general: 'عمومی',
  feature_request: 'درخواست',
  bug_report: 'گزارش باگ',
};

export default function TicketsClient({ tickets }: TicketsClientProps) {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesType =
        typeFilter === 'all' || ticket.type === typeFilter;
      return matchesStatus && matchesPriority && matchesType;
    });
  }, [tickets, statusFilter, priorityFilter, typeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            مدیریت و پیگیری تیکت‌های پشتیبانی
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Link href="/tickets/new">
            <Button className="w-full sm:w-auto">
              <span className="text-xl">+</span> تیکت جدید
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectFilter
            label="وضعیت"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as TicketStatus | 'all')}
            options={[
              ['all', 'همه'],
              ['open', 'باز'],
              ['in_progress', 'در حال بررسی'],
              ['waiting_for_user', 'در انتظار کاربر'],
              ['resolved', 'حل شده'],
              ['closed', 'بسته شده'],
            ]}
          />
          <SelectFilter
            label="اولویت"
            value={priorityFilter}
            onChange={(value) => setPriorityFilter(value as TicketPriority | 'all')}
            options={[
              ['all', 'همه'],
              ['low', 'پایین'],
              ['medium', 'متوسط'],
              ['high', 'بالا'],
              ['urgent', 'فوری'],
            ]}
          />
          <SelectFilter
            label="نوع"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as TicketType | 'all')}
            options={[
              ['all', 'همه'],
              ['technical', 'فنی'],
              ['billing', 'مالی'],
              ['general', 'عمومی'],
              ['feature_request', 'درخواست ویژگی'],
              ['bug_report', 'گزارش باگ'],
            ]}
          />
        </div>
      </div>

      <Link
        href="/tickets/new"
        className="fixed bottom-6 right-6 sm:hidden z-50"
      >
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-16 h-16 shadow-2xl flex items-center justify-center"
          aria-label="ایجاد تیکت جدید"
        >
          <span className="text-3xl font-bold">+</span>
        </button>
      </Link>

      {filteredTickets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">هیچ تیکتی یافت نشد</p>
            <Link href="/tickets/new">
              <Button>ایجاد تیکت جدید</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/tickets/${ticket.id}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h3>
                      {ticket.reference_number && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          #{ticket.reference_number}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{ticket.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status]}`}>
                        {statusLabels[ticket.status]}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority]}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                        {typeLabels[ticket.type]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        تاریخ ایجاد:{' '}
                        {new Date(ticket.created_at).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {ticket.messages && ticket.messages.length > 0 && (
                        <span>{ticket.messages.length} پیام</span>
                      )}
                      {ticket.assigned_to && (
                        <span>
                          اختصاص داده شده به: {ticket.assigned_to.first_name}{' '}
                          {ticket.assigned_to.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      مشاهده
                    </Button>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface SelectFilterProps {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}

function SelectFilter({ label, value, options, onChange }: SelectFilterProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}

