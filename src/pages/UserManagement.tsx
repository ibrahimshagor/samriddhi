import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldCheck, UserPlus, Search, Edit2, Trash2, KeyRound } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { lang, users = [], customers = [] } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const staffList = (users || []).filter((u) => u.role !== 'customer');
  const members = customers || [];

  const allUsers = [
    ...(staffList || []).map((s) => ({ ...s, type: 'Staff/Manager' })),
    ...(members || []).map((m) => ({ ...m, role: 'customer' as UserRole, type: 'Customer' })),
  ];

  const filteredUsers = allUsers.filter((u) => {
    const query = (searchQuery || '').toLowerCase();
    const nameBn = (u.nameBn || '').toLowerCase();
    const nameEn = (u.nameEn || '').toLowerCase();
    const membershipId = (u.membershipId || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const mobile = (u.mobile || '').toLowerCase();
    return nameBn.includes(query) || nameEn.includes(query) || membershipId.includes(query) || username.includes(query) || mobile.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '১৫. ইউজার ও পারমিশন ম্যানেজমেন্ট' : '15. User Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সকল সুপার এডমিন, ম্যানেজার, ফিল্ড স্টাফ ও গ্রাহক অ্যাকাউন্ট নিয়ন্ত্রণ'
              : 'Role-based access controls and account status'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'ইউজার নাম বা আইডি দিয়ে খুঁজুন...' : 'Search users...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-extrabold text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">আইডি</th>
                <th className="p-3">ইউজার নাম</th>
                <th className="p-3">টাইপ / ভূমিকা</th>
                <th className="p-3">মোবাইল</th>
                <th className="p-3">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(filteredUsers || []).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-emerald-600">{u.membershipId}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? u.nameBn : u.nameEn}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {(u.role || 'customer').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{u.mobile}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
