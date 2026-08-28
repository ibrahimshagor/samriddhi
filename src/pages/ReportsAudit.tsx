import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/formatters';
import { FileSpreadsheet, Download, Filter, ShieldCheck, Printer, CheckCircle } from 'lucide-react';

export const ReportsAudit: React.FC = () => {
  const { lang, auditLogs, loans, joinedPackages } = useApp();
  const [filterType, setFilterType] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType === 'all') return true;
    const actions = ((log.actionEn || '') + (log.actionBn || '')).toLowerCase();
    return actions.includes((filterType || '').toLowerCase());
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['User', 'Role', 'Action (BN)', 'Action (EN)', 'Details', 'Timestamp'];
    const rows = filteredLogs.map((log) => [
      `"${log.performedBy || ''}"`,
      `"${log.role || ''}"`,
      `"${log.actionBn || ''}"`,
      `"${log.actionEn || ''}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${log.timestamp || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '১২. রিপোর্টস ও অডিট লগস' : '12. Reports & Audit Logs'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সকল ট্রানজ্যাকশন রিপোর্ট, ইউজার সিস্টেম এক্টিভিটি ও অডিট ট্রেইল'
              : 'Complete financial reports, user access history, and system audit trail'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সিএসভি ডাউনলোড (CSV)' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রিন্ট / এক্সপোর্ট' : 'Print / Export'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-bold">মোট লোন আবেদন</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{loans.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-bold">মোট অডিট রেকর্ড</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{auditLogs.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-bold">সিকিউরিটি স্ট্যাটাস</span>
          <p className="text-lg font-black text-emerald-600 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-5 h-5" /> 100% Encrypted
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {lang === 'bn' ? 'সিস্টেম অডিট ট্রেইল (Audit Logs)' : 'System Audit Trail'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-extrabold text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">ইউজার</th>
                <th className="p-3">একশন</th>
                <th className="p-3">বিবরণ</th>
                <th className="p-3">সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{log.performedBy} ({log.role})</td>
                  <td className="p-3 font-mono text-emerald-600 font-semibold">{lang === 'bn' ? log.actionBn : log.actionEn}</td>
                  <td className="p-3 text-slate-500">{log.details}</td>
                  <td className="p-3 font-mono text-slate-400 text-[10px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
