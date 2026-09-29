'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useAuditLog } from '../../hooks/useAuditLog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

export function AuditLogTable(): React.JSX.Element {
  const [page, setPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [questionIdSearch, setQuestionIdSearch] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const limit = 25;

  const { data, isLoading, isError } = useAuditLog({
    questionId: questionIdSearch.trim() || undefined,
    page,
    limit,
  });

  const rawLogs = data?.data ?? [];

  // Client filtering for action & date range
  const filteredLogs = rawLogs.filter((entry) => {
    if (selectedAction !== 'ALL') {
      const normAction = entry.action?.toUpperCase();
      if (selectedAction === 'APPROVED' && !normAction.includes('APPROV')) return false;
      if (selectedAction === 'REJECTED' && !normAction.includes('REJECT')) return false;
      if (selectedAction === 'ARCHIVED' && !normAction.includes('ARCHIV')) return false;
    }

    if (fromDate) {
      const entryTime = new Date(entry.createdAt).getTime();
      const fromTime = fromDate.setHours(0, 0, 0, 0);
      if (entryTime < fromTime) return false;
    }

    if (toDate) {
      const entryTime = new Date(entry.createdAt).getTime();
      const toTime = toDate.setHours(23, 59, 59, 999);
      if (entryTime > toTime) return false;
    }

    return true;
  });

  const totalCount = data?.total ?? filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startItem = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalCount);

  // Formatter: "DD MMM YYYY, HH:mm" using native Intl.DateTimeFormat (no date-fns)
  const formatTimestamp = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-GB', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return 'Pick a date';
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getActionBadge = (action: string) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('APPROV')) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          Approved
        </span>
      );
    }
    if (act.includes('REJECT')) {
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
          Rejected
        </span>
      );
    }
    if (act.includes('ARCHIV')) {
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-600/20">
          Archived
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
        {action}
      </span>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white p-6">
      {/* Page Title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Audit Log</h2>
        <p className="text-xs text-slate-500">
          Chronological record of question approvals, rejections, status modifications, and editor activity.
        </p>
      </div>

      {/* Filters (Single row above table) */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        {/* Action Type Select */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Actions</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Date Range Picker (From Date Popover + Calendar) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">From:</span>
          <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start text-left text-xs font-normal bg-white"
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                <span>{fromDate ? formatDateDisplay(fromDate) : 'Start date'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                selectedDate={fromDate}
                onSelectDate={(date) => {
                  setFromDate(date);
                  setIsFromOpen(false);
                  setPage(1);
                }}
              />
            </PopoverContent>
          </Popover>
          {fromDate && (
            <button
              onClick={() => setFromDate(null)}
              className="text-slate-400 hover:text-slate-600"
              title="Clear from date"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date Range Picker (To Date Popover + Calendar) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">To:</span>
          <Popover open={isToOpen} onOpenChange={setIsToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start text-left text-xs font-normal bg-white"
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                <span>{toDate ? formatDateDisplay(toDate) : 'End date'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                selectedDate={toDate}
                onSelectDate={(date) => {
                  setToDate(date);
                  setIsToOpen(false);
                  setPage(1);
                }}
              />
            </PopoverContent>
          </Popover>
          {toDate && (
            <button
              onClick={() => setToDate(null)}
              className="text-slate-400 hover:text-slate-600"
              title="Clear to date"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search by Question ID Input */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={questionIdSearch}
            onChange={(e) => {
              setQuestionIdSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by question ID…"
            className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Reset Filters */}
        {(selectedAction !== 'ALL' || fromDate || toDate || questionIdSearch) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAction('ALL');
              setFromDate(null);
              setToDate(null);
              setQuestionIdSearch('');
              setPage(1);
            }}
            className="h-8 text-xs text-slate-500 hover:text-slate-900"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600">
            Failed to load audit logs. Please try again later.
          </div>
        ) : filteredLogs.length === 0 ? (
          /* Empty state: No audit events yet with a small clock SVG icon */
          <div className="flex h-64 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Clock className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-800">
              No audit events yet
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Actions will appear here as questions are approved, rejected, or modified.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[130px]">Action</TableHead>
                <TableHead className="min-w-[240px]">Question preview</TableHead>
                <TableHead className="w-[180px]">Performed by</TableHead>
                <TableHead className="min-w-[200px]">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const questionText =
                  typeof log.details === 'object' && log.details !== null && 'text' in log.details
                    ? String((log.details as Record<string, unknown>).text)
                    : `Question #${log.questionId?.slice(0, 8) || 'N/A'}`;

                const truncatedPreview =
                  questionText.length > 60
                    ? `${questionText.slice(0, 60)}…`
                    : questionText;

                const detailText =
                  log.reason ||
                  (log.action.includes('REJECT') && typeof log.details === 'string'
                    ? log.details
                    : '—');

                return (
                  <TableRow key={log.id}>
                    {/* Timestamp: formatted "DD MMM YYYY, HH:mm" */}
                    <TableCell className="font-mono text-slate-600">
                      {formatTimestamp(log.createdAt)}
                    </TableCell>

                    {/* Action: colored chip */}
                    <TableCell>{getActionBadge(log.action)}</TableCell>

                    {/* Question preview: first 60 chars of question text (link to /questions/:id) */}
                    <TableCell>
                      {log.questionId ? (
                        <Link
                          href={`/questions/${log.questionId}`}
                          className="font-medium text-slate-800 hover:text-indigo-600 hover:underline"
                        >
                          {truncatedPreview}
                        </Link>
                      ) : (
                        <span className="text-slate-600">{truncatedPreview}</span>
                      )}
                    </TableCell>

                    {/* Performed by: admin name + role chip */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">
                          {log.actor?.name || 'Admin'}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          ADMIN
                        </span>
                      </div>
                    </TableCell>

                    {/* Detail: rejection reason if action = QUESTION_REJECTED, else "—" */}
                    <TableCell className="text-slate-600 italic">
                      {detailText}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination: Simple numbered pagination (25 rows per page) */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div>
          Showing {startItem}–{endItem} of {totalCount} events
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>
          <span className="text-xs font-medium text-slate-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="h-8 gap-1 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuditLogTable;
