import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  UserCheck,
  LogOut,
  ShieldAlert,
  CreditCard,
  Building,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { DigitalIdCard } from './DigitalIdCard';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    lang,
    darkMode,
    settings,
    toggleLanguage,
    toggleDarkMode,
    setDemoMode,
    logout,
    adjustmentRequests,
    supportTickets,
  } = useApp();

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pendingAdjustments = adjustmentRequests.filter((a) => a.status === 'pending').length;
  const pendingTickets = supportTickets.filter((t) => t.status === 'pending').length;
  const totalNotifications = pendingAdjustments + pendingTickets;

  const roleLabelBn =
    currentUser?.role === 'super_admin'
      ? 'সুপার এডমিন'
      : currentUser?.role === 'branch_manager'
      ? 'শাখা ম্যানেজার'
      : currentUser?.role === 'branch_staff'
      ? 'শাখা স্টাফ'
      : 'কাস্টমার';

  const roleLabelEn =
    currentUser?.role === 'super_admin'
      ? 'Super Admin'
      : currentUser?.role === 'branch_manager'
      ? 'Branch Manager'
      : currentUser?.role === 'branch_staff'
      ? 'Branch Staff'
      : 'Customer';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left Section: Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors focus:outline-none"
              title={lang === 'bn' ? 'মেনু খুলুন' : 'Open Menu'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                সম
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                  {lang === 'bn' ? settings.siteNameBn : settings.siteNameEn}
                </h1>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Building className="w-3 h-3 inline" />
                  {lang === 'bn' ? 'সমবায় সমিতি ও মাইক্রো-ব্যাংকিং' : 'Cooperative Society & Micro-Banking'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Language, Theme, Demo Mode, ID Card & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Demo Mode Toggle (Admin only or visible to admin) */}
            {currentUser?.role === 'super_admin' && (
              <button
                onClick={() => setDemoMode(!settings.demoMode)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                  settings.demoMode
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title="Toggle Demo Mode"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{settings.demoMode ? 'ডেমো মোড: চালূ' : 'ডেমো মোড: বন্ধ'}</span>
              </button>
            )}

            {/* Digital ID Card Button */}
            {currentUser && (
              <button
                onClick={() => setShowIdCardModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
                title={lang === 'bn' ? 'ডিজিটাল আইডি কার্ড' : 'Digital ID Card'}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{lang === 'bn' ? 'আইডি কার্ড' : 'ID Card'}</span>
              </button>
            )}

            {/* User Profile Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow">
                    {(currentUser.nameEn || 'U').charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                      {lang === 'bn' ? currentUser.nameBn : currentUser.nameEn}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {lang === 'bn' ? roleLabelBn : roleLabelEn}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {lang === 'bn' ? currentUser.nameBn : currentUser.nameEn}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {currentUser.membershipId}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        {lang === 'bn' ? roleLabelBn : roleLabelEn}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowIdCardModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      {lang === 'bn' ? 'ডিজিটাল আইডি কার্ড দেখুন' : 'View Digital ID Card'}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      {lang === 'bn' ? 'লগআউট করুন' : 'Log Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Global Notice Banner if set */}
        {settings.noticeBannerBn && (
          <div className="mt-2 text-center text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 truncate">
            📢 <span className="font-semibold">{lang === 'bn' ? settings.noticeBannerBn : settings.noticeBannerEn}</span>
          </div>
        )}
      </header>

      {/* ID Card Modal */}
      {showIdCardModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <DigitalIdCard user={currentUser} onClose={() => setShowIdCardModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};
