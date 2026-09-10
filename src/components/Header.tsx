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
  Flame,
  Cloud,
  MessageSquare,
  Sparkles,
  Inbox,
  ArrowRight,
  Megaphone,
  X,
} from 'lucide-react';
import { DigitalIdCard } from './DigitalIdCard';
import { GoogleDriveBackupModal } from './GoogleDriveBackupModal';
import { resolveLogo, DEFAULT_SAMRIDDHI_LOGO_DATA_URI } from '../utils/logo';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate?: (menu: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigate }) => {
  const {
    currentUser,
    lang,
    darkMode,
    settings,
    toggleLanguage,
    toggleDarkMode,
    setDemoMode,
    logout,
    customers,
    customerMessages,
    notices,
    getAccessibleNotices,
    markNoticeAsRead,
    adjustmentRequests,
    supportTickets,
    joinedPackages,
    savingsRequests,
    loans,
    firebaseConnected,
    branches,
    activeBranchId,
    setActiveBranchId,
    getUserAccessibleBranches,
    markMessageAsRead,
  } = useApp();

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [dismissedBannerNoticeId, setDismissedBannerNoticeId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isCustomer = currentUser?.role === 'customer';
  const accessibleBranches = getUserAccessibleBranches ? getUserAccessibleBranches() : [];

  const myCustomerRecord = isCustomer
    ? customers.find((c) => c.userId === currentUser?.id || c.email === currentUser?.email)
    : null;

  // Unread messages for customer
  const customerUnreadMsgs = isCustomer && myCustomerRecord
    ? (customerMessages || []).filter(
        (m) => m.customerId === myCustomerRecord.id && !m.isRead && m.senderRole !== 'customer'
      )
    : [];

  // Unread messages for staff / manager / admin
  const staffUnreadMsgs = !isCustomer
    ? (customerMessages || []).filter((m) => {
        if (m.isRead || m.senderRole !== 'customer') return false;
        if (isSuperAdmin) return true;
        const targetCust = customers.find((c) => c.id === m.customerId);
        if (!targetCust) return true;
        if (activeBranchId && activeBranchId !== 'all') {
          return targetCust.branchId === activeBranchId;
        }
        const accessibleIds = accessibleBranches.map((b) => b.id);
        return accessibleIds.length === 0 || accessibleIds.includes(targetCust.branchId);
      })
    : [];

  // Accessible & unread notices
  const accessibleNotices = getAccessibleNotices ? getAccessibleNotices(currentUser) : notices || [];
  const unreadNotices = currentUser
    ? accessibleNotices.filter((n) => !n.readByUserIds?.includes(currentUser.id))
    : [];

  const latestUnreadNotice = unreadNotices.length > 0 ? unreadNotices[0] : null;
  const showBanner = latestUnreadNotice && dismissedBannerNoticeId !== latestUnreadNotice.id;

  const pendingAdjustments = adjustmentRequests.filter((a) => a.status === 'pending').length;
  const pendingTickets = supportTickets.filter((t) => t.status === 'pending').length;
  const pendingJoinedPkgs = joinedPackages.filter((j) => j.status === 'pending').length;
  const pendingSavingsReqs = savingsRequests.filter((s) => s.status === 'pending').length;
  const pendingLoanApps = loans.filter((l) => l.status === 'pending').length;

  const totalNotifications = isCustomer
    ? customerUnreadMsgs.length + unreadNotices.length
    : pendingAdjustments +
      pendingTickets +
      pendingJoinedPkgs +
      pendingSavingsReqs +
      pendingLoanApps +
      staffUnreadMsgs.length +
      unreadNotices.length;

  const handleNotificationClick = (menuTarget: string, msgId?: string, noticeId?: string) => {
    if (msgId) {
      markMessageAsRead(msgId);
    }
    if (noticeId) {
      markNoticeAsRead(noticeId);
    }
    setShowNotificationMenu(false);
    if (onNavigate) {
      onNavigate(menuTarget);
    }
  };

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
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-emerald-600/20 flex items-center justify-center bg-emerald-700 shrink-0">
                <img
                  src={resolveLogo(settings?.logoSvg)}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_SAMRIDDHI_LOGO_DATA_URI;
                  }}
                />
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

            {/* Firebase Cloud Database Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                firebaseConnected
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
              title={lang === 'bn' ? 'ফায়ারবেস ক্লাউড কানেক্টেড (samriddhi-fms)' : 'Firebase Cloud Connected (samriddhi-fms)'}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden xl:inline">Firebase</span>
            </div>

            {/* Google Drive Backup Button (Super Admin) */}
            {currentUser?.role === 'super_admin' && (
              <button
                onClick={() => setShowDriveModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/70 dark:border-blue-800/50 transition-colors shadow-2xs cursor-pointer"
                title={lang === 'bn' ? 'গুগল ড্রাইভ ব্যাকআপ ও রিস্টোর' : 'Google Drive Backup & Restore'}
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'bn' ? 'ড্রাইভ ব্যাকআপ' : 'Drive Backup'}</span>
              </button>
            )}

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

            {/* Notification Bell (Enabled for ALL Roles including Customers!) */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationMenu(!showNotificationMenu);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors relative cursor-pointer"
                  title={lang === 'bn' ? 'নোটিফিকেশন ও বার্তা' : 'Notifications & Messages'}
                >
                  <Bell className="w-4 h-4" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">
                      {totalNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Menu */}
                {showNotificationMenu && (
                  <div className="absolute right-0 mt-2 w-84 max-w-[90vw] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <Bell className="w-4 h-4 text-emerald-600" />
                        {lang === 'bn' ? 'নোটিফিকেশন ও বার্তা' : 'Notifications & Alerts'}
                      </span>
                      {totalNotifications > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {totalNotifications} {lang === 'bn' ? 'টি নতুন' : 'New'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {lang === 'bn' ? 'সব পঠিত' : 'All Clear'}
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/80 custom-scrollbar">
                      {/* Official Unread Notices for all roles */}
                      {unreadNotices.map((notice) => (
                        <div
                          key={notice.id}
                          onClick={() => handleNotificationClick('notices', undefined, notice.id)}
                          className="p-3 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 flex items-start gap-2.5 cursor-pointer transition-colors"
                        >
                          <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 animate-bounce" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                                {lang === 'bn' ? notice.titleBn : notice.titleEn}
                              </p>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                                notice.priority === 'urgent'
                                  ? 'bg-rose-500 text-white'
                                  : notice.priority === 'high'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {notice.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              {notice.memoNo} • {notice.scope === 'global' ? (lang === 'bn' ? 'গ্লোবাল নোটিশ' : 'Global') : notice.scope === 'institution' ? (lang === 'bn' ? 'ইনস্টিটিউশন' : 'Institution') : (lang === 'bn' ? 'শাখা ভিত্তিক' : 'Branch')}
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                              {lang === 'bn' ? notice.contentBn : notice.contentEn}
                            </p>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
                              <span>{lang === 'bn' ? 'বিজ্ঞপ্তি দেখতে ক্লিক করুন' : 'Click to view circular'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Customer Incoming Official Messages */}
                      {isCustomer && customerUnreadMsgs.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => handleNotificationClick('inbox', msg.id)}
                          className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 flex items-start gap-2.5 cursor-pointer transition-colors"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                📩 {msg.senderName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">{msg.sentAt.split(',')[0]}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                              {msg.message}
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                              <span>{lang === 'bn' ? 'উত্তর দিতে ক্লিক করুন' : 'Click to reply in inbox'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Staff/Admin Incoming Customer Replies */}
                      {!isCustomer && staffUnreadMsgs.map((msg) => {
                        const senderCust = customers.find((c) => c.id === msg.customerId);
                        return (
                          <div
                            key={msg.id}
                            onClick={() => handleNotificationClick('inbox', msg.id)}
                            className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 flex items-start gap-2.5 cursor-pointer transition-colors"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  💬 {senderCust ? (lang === 'bn' ? senderCust.nameBn : senderCust.nameEn) : msg.senderName}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">{msg.sentAt.split(',')[0]}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                                {msg.message}
                              </p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                <span>{lang === 'bn' ? 'ইনবক্সে উত্তর দিন' : 'Reply in Inbox'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pending Approvals for Staff/Managers */}
                      {!isCustomer && pendingJoinedPkgs > 0 && (
                        <div
                          onClick={() => handleNotificationClick('pkg_requests')}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingJoinedPkgs} {lang === 'bn' ? 'টি নতুন প্যাকেজ যুক্ত হওয়ার আবেদন' : 'Package Join Requests'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {lang === 'bn' ? 'গ্রাহকরা প্যাকেজে অংশগ্রহণের রিকোয়েস্ট পাঠিয়েছে' : 'Customers requested to join packages'}
                            </p>
                          </div>
                        </div>
                      )}

                      {!isCustomer && pendingSavingsReqs > 0 && (
                        <div
                          onClick={() => handleNotificationClick('pkg_requests')}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingSavingsReqs} {lang === 'bn' ? 'টি সাধারণ সঞ্চয় জমা/উত্তোলন রিকোয়েস্ট' : 'Savings Requests'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {lang === 'bn' ? 'অনুমোদনের জন্য সাধারণ সঞ্চয় রিকোয়েস্ট অপেক্ষমাণ' : 'Pending savings review'}
                            </p>
                          </div>
                        </div>
                      )}

                      {!isCustomer && pendingLoanApps > 0 && (
                        <div
                          onClick={() => handleNotificationClick('pkg_loan')}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingLoanApps} {lang === 'bn' ? 'টি নতুন লোনের আবেদন' : 'Loan Applications'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {lang === 'bn' ? 'গ্রাহকদের লোনের আবেদন অনুমোদনের অপেক্ষায়' : 'Loan applications pending review'}
                            </p>
                          </div>
                        </div>
                      )}

                      {!isCustomer && pendingAdjustments > 0 && (
                        <div
                          onClick={() => handleNotificationClick('adjustment_requests')}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingAdjustments} {lang === 'bn' ? 'টি পেমেন্ট অ্যাডজাস্টমেন্ট রিকোয়েস্ট' : 'Adjustment Requests'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {lang === 'bn' ? 'ম্যানুয়াল ডিপোজিট পেমেন্ট প্রুফ ভেরিফিকেশন' : 'Payment proofs pending verification'}
                            </p>
                          </div>
                        </div>
                      )}

                      {!isCustomer && pendingTickets > 0 && (
                        <div
                          onClick={() => handleNotificationClick('complaints')}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingTickets} {lang === 'bn' ? 'টি সাপোর্ট অভিযোগ/টিকিট' : 'Support Tickets'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {lang === 'bn' ? 'গ্রাহকের উত্তর না দেয়া সাপোর্ট টিকিট' : 'Unanswered support tickets'}
                            </p>
                          </div>
                        </div>
                      )}

                      {totalNotifications === 0 && (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-1.5 opacity-60" />
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            {lang === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No new notifications'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {lang === 'bn' ? 'সকল বার্তা ও পেন্ডিং রিকোয়েস্ট আপডেট রয়েছে' : 'Everything is up to date'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* View Full Inbox Link */}
                    <div className="p-2 pt-2.5 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleNotificationClick('inbox')}
                        className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সম্পূর্ণ ইনবক্স ও বার্তা দেখুন' : 'Open Inbox & Messages'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Digital ID Card Button */}
            {currentUser && (
              <button
                onClick={() => setShowIdCardModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
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
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                        if (onNavigate) onNavigate('inbox');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                    >
                      <Inbox className="w-4 h-4 text-emerald-600" />
                      {lang === 'bn' ? 'ইনবক্স ও বার্তা' : 'Inbox & Messages'}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowIdCardModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      {lang === 'bn' ? 'ডিজিটাল আইডি কার্ড দেখুন' : 'View Digital ID Card'}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 mt-1 cursor-pointer"
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

        {/* Official Notice Top Alert Banner */}
        {showBanner && latestUnreadNotice && (
          <div className="mt-2.5 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md transition-all border border-amber-400/40">
            <div
              onClick={() => handleNotificationClick('notices', undefined, latestUnreadNotice.id)}
              className="flex items-center gap-2.5 text-xs min-w-0 flex-1 cursor-pointer"
            >
              <span className="p-1 rounded-lg bg-white/20 shrink-0">
                <Megaphone className="w-4 h-4 text-white animate-bounce" />
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-extrabold truncate">
                  {lang === 'bn' ? '📢 নতুন অফিসিয়াল নোটিশ:' : '📢 New Official Notice:'} {lang === 'bn' ? latestUnreadNotice.titleBn : latestUnreadNotice.titleEn}
                </span>
                <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                  latestUnreadNotice.priority === 'urgent' ? 'bg-rose-500' : 'bg-amber-900/60'
                }`}>
                  {latestUnreadNotice.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleNotificationClick('notices', undefined, latestUnreadNotice.id)}
                className="flex items-center gap-1.5 text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl transition-colors cursor-pointer"
              >
                <span>{lang === 'bn' ? 'বিজ্ঞপ্তি পড়ুন' : 'Read Notice'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissedBannerNoticeId(latestUnreadNotice.id);
                }}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                title={lang === 'bn' ? 'বাতিল করুন' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Customer Unread Message Alert Banner */}
        {isCustomer && customerUnreadMsgs.length > 0 && (
          <div
            onClick={() => handleNotificationClick('inbox')}
            className="mt-2.5 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md cursor-pointer hover:opacity-95 transition-all animate-pulse border border-emerald-400/40"
          >
            <div className="flex items-center gap-2.5 text-xs min-w-0">
              <span className="p-1 rounded-lg bg-white/20 shrink-0">
                <Inbox className="w-4 h-4 text-white" />
              </span>
              <span className="font-extrabold truncate">
                {lang === 'bn'
                  ? `আপনার ${customerUnreadMsgs.length}টি নতুন অফিশিয়াল বার্তা রয়েছে`
                  : `You have ${customerUnreadMsgs.length} new official message(s)`}
              </span>
              <span className="text-emerald-100 hidden md:inline truncate">
                : "{customerUnreadMsgs[0].message}"
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl shrink-0 transition-colors">
              <span>{lang === 'bn' ? 'ইনবক্স দেখুন' : 'View Inbox'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

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

      {/* Google Drive Backup & Restore Modal */}
      {showDriveModal && (
        <GoogleDriveBackupModal
          isOpen={showDriveModal}
          onClose={() => setShowDriveModal(false)}
        />
      )}
    </>
  );
};
