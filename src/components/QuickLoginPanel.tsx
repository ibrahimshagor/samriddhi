import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, Users, User, Zap } from 'lucide-react';

export const QuickLoginPanel: React.FC = () => {
  const { lang, quickLogin, settings } = useApp();

  if (!settings.demoMode) return null;

  const roles: { role: UserRole; titleBn: string; titleEn: string; username: string; icon: any; color: string }[] = [
    {
      role: 'super_admin',
      titleBn: 'সুপার এডমিন (স্মার্ট এডমিন)',
      titleEn: 'Super Admin (Full Access)',
      username: 'smfadmin',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700 text-white',
    },
    {
      role: 'branch_manager',
      titleBn: 'শাখা ম্যানেজার',
      titleEn: 'Branch Manager',
      username: 'smfmanager',
      icon: UserCheck,
      color: 'from-blue-600 to-indigo-700 text-white',
    },
    {
      role: 'branch_staff',
      titleBn: 'শাখা স্টাফ',
      titleEn: 'Branch Staff',
      username: 'smfstaff',
      icon: Users,
      color: 'from-amber-600 to-orange-700 text-white',
    },
    {
      role: 'customer',
      titleBn: 'কাস্টমার / সম্মানিত গ্রাহক',
      titleEn: 'Customer / Member',
      username: 'smfcustomer',
      icon: User,
      color: 'from-purple-600 to-indigo-800 text-white',
    },
  ];

  return (
    <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs">
      <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
        <Zap className="w-4 h-4 text-amber-600" />
        <span>{lang === 'bn' ? 'কুইক লগইন অপশন (ডেমো মোড চালূ)' : 'Quick Login Options (Demo Mode Active)'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {roles.map((r) => {
          const IconComponent = r.icon;
          return (
            <button
              key={r.role}
              onClick={() => quickLogin(r.role)}
              className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${r.color} shadow-sm hover:opacity-95 transition-all active:scale-95 text-left cursor-pointer`}
            >
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-xs">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-xs">{lang === 'bn' ? r.titleBn : r.titleEn}</p>
                <p className="text-[10px] opacity-80 font-mono">
                  ID: {r.username} | Pass: 123456
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
