import React from 'react';
import { useApp } from '../context/AppContext';
import { resolveLogo, DEFAULT_SAMRIDDHI_LOGO_DATA_URI } from '../utils/logo';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Users,
  UserCheck,
  CreditCard,
  Briefcase,
  Landmark,
  Layers,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  User,
  ShieldCheck,
  FileCheck2,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PieChart,
  DollarSign,
  TrendingUp,
  Inbox,
  Megaphone,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeMenu,
  setActiveMenu,
}) => {
  const {
    currentUser,
    lang,
    settings,
    customers,
    customerMessages,
    notices,
    getAccessibleNotices,
    adjustmentRequests,
    supportTickets,
    kycRecords,
    joinedPackages,
    savingsRequests,
    loans,
    activeBranchId,
    getUserAccessibleBranches,
  } = useApp();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>('packages');

  if (!currentUser) return null;

  const role = currentUser.role;
  const custModules = settings?.customerVisibleModules;

  // Helper check if menu is visible for customer
  const isVisible = (moduleKey?: keyof typeof custModules) => {
    if (role !== 'customer') return true;
    if (!moduleKey || !custModules) return true;
    return custModules[moduleKey] !== false;
  };

  const myCust = role === 'customer'
    ? customers.find((c) => c.userId === currentUser.id || c.email === currentUser.email)
    : null;

  const unreadInboxCount = role === 'customer'
    ? myCust
      ? (customerMessages || []).filter(
          (m) => m.customerId === myCust.id && !m.isRead && m.senderRole !== 'customer'
        ).length
      : 0
    : (customerMessages || []).filter((m) => {
        if (m.isRead || m.senderRole !== 'customer') return false;
        if (role === 'super_admin') return true;
        const c = customers.find((cust) => cust.id === m.customerId);
        if (!c) return true;
        if (activeBranchId && activeBranchId !== 'all') return c.branchId === activeBranchId;
        const accessible = getUserAccessibleBranches ? getUserAccessibleBranches() : [];
        const ids = accessible.map((b) => b.id);
        return ids.length === 0 || ids.includes(c.branchId);
      }).length;

  const accessibleNotices = getAccessibleNotices ? getAccessibleNotices(currentUser) : notices || [];
  const unreadNoticesCount = accessibleNotices.filter((n) => !n.readByUserIds?.includes(currentUser.id)).length;

  const pendingAdjustments = adjustmentRequests.filter((a) => a.status === 'pending').length;
  const pendingTickets = supportTickets.filter((t) => t.status === 'pending').length;
  const pendingKycs = kycRecords.filter((k) => k.status === 'pending').length;

  const pendingJoinedPkgs = joinedPackages.filter((j) => j.status === 'pending').length;
  const pendingSavingsReqs = savingsRequests.filter((s) => s.status === 'pending').length;
  const pendingLoanApps = loans.filter((l) => l.status === 'pending').length;
  const totalPkgNotifications = pendingJoinedPkgs + pendingSavingsReqs + pendingLoanApps;

  const handleMenuClick = (id: string, hasSubmenu = false) => {
    if (hasSubmenu) {
      setOpenSubmenu((prev) => (prev === id ? null : id));
      setActiveMenu(id);
    } else {
      setActiveMenu(id);
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col lg:static lg:z-auto shrink-0 shadow-xl lg:shadow-none overflow-hidden ${
          isOpen
            ? 'w-72 translate-x-0'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:border-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-emerald-700 shrink-0">
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
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সমৃদ্ধি নেভিগেশন' : 'Samriddhi Navigation'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? '১৮টি সম্পূর্ণ মেনু সিস্টেম' : '18 Complete Menu Systems'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {/* 1. Dashboard Overview */}
          <button
            onClick={() => handleMenuClick('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>{lang === 'bn' ? '১. ড্যাশবোর্ড ওভারভিউ' : '1. Dashboard Overview'}</span>
            </div>
          </button>

          {/* Inbox & Messages (Universal for All Roles) */}
          {isVisible('inboxMessages') && (
            <button
              onClick={() => handleMenuClick('inbox')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeMenu === 'inbox'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'bn' ? 'ইনবক্স ও বার্তা' : 'Inbox & Messages'}</span>
              </div>
              {unreadInboxCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse">
                  {unreadInboxCount}
                </span>
              )}
            </button>
          )}

          {/* Official Notice Board (Universal / Role Controlled) */}
          {isVisible('notices') && (
            <button
              onClick={() => handleMenuClick('notices')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeMenu === 'notices'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>{lang === 'bn' ? 'নোটিশ ও বিজ্ঞপ্তি বোর্ড' : 'Notice Board & Circulars'}</span>
              </div>
              {unreadNoticesCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950 animate-pulse font-mono">
                  {unreadNoticesCount}
                </span>
              )}
            </button>
          )}

          {/* 2. Multi Institution Management (Super Admin) */}
          {role === 'super_admin' && (
            <button
              onClick={() => handleMenuClick('multi_institution')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'multi_institution'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>{lang === 'bn' ? '২. মাল্টি ইনস্টিটিউশন' : '2. Multi Institution'}</span>
              </div>
            </button>
          )}

          {/* 3. Institutions */}
          {isVisible('institutions') && (
            <button
              onClick={() => handleMenuClick('institutions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'institutions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'bn' ? '৩. ইনস্টিটিউশনস' : '3. Institutions'}</span>
              </div>
            </button>
          )}

          {/* 4. Branch Management */}
          {isVisible('branchManagement') && (
            <button
              onClick={() => handleMenuClick('branch_management')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'branch_management'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4" />
                <span>{lang === 'bn' ? '৪. শাখা ব্যবস্থাপনা' : '4. Branch Management'}</span>
              </div>
            </button>
          )}

          {/* 5. Staff and Managers */}
          <button
            onClick={() => handleMenuClick('staff_managers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeMenu === 'staff_managers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>{lang === 'bn' ? '৫. স্টাফ ও ম্যানেজার' : '5. Staff & Managers'}</span>
            </div>
          </button>

          {/* 6. Customer Directory */}
          {role !== 'customer' && (
            <button
              onClick={() => handleMenuClick('customer_directory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'customer_directory'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'bn' ? '৬. কাস্টমার ডাইরেক্টরি' : '6. Customer Directory'}</span>
              </div>
            </button>
          )}

          {/* 7. Payment Channels */}
          {isVisible('paymentChannels') && (
            <button
              onClick={() => handleMenuClick('payment_channels')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'payment_channels'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'bn' ? '৭. পেমেন্ট চ্যানেল' : '7. Payment Channels'}</span>
              </div>
            </button>
          )}

          {/* 8. Asset / Investment Management (With 8 Sub-menus) */}
          {isVisible('assetInvestments') && (
            <div>
              <button
                onClick={() => handleMenuClick('asset_investment', true)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeMenu.startsWith('inv_') || activeMenu === 'asset_investment'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span className="truncate">{lang === 'bn' ? '৮. সম্পদ/বিনিয়োগ ব্যবস্থাপনা' : '8. Asset/Investment'}</span>
                </div>
                {openSubmenu === 'asset_investment' ? (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0" />
                )}
              </button>

              {/* Submenus */}
              {openSubmenu === 'asset_investment' && (
                <div className="ml-4 mt-1 pl-2 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-0.5 text-[11px]">
                  {[
                    { id: 'inv_fdr', bn: 'এফডিআর এ বিনিয়োগ', en: 'FDR Investment' },
                    { id: 'inv_dps', bn: 'ডিপিএস এ বিনিয়োগ', en: 'DPS Investment' },
                    { id: 'inv_bank_savings', bn: 'ব্যাংক সঞ্চয়ে বিনিয়োগ', en: 'Bank Savings Inv.' },
                    { id: 'inv_business_fixed', bn: 'ব্যবসায়ে (নির্দিষ্ট সুদ)', en: 'Business Fixed Interest' },
                    { id: 'inv_business_profit_share', bn: 'ব্যবসায়ে (লাভ/ক্ষতি)', en: 'Business Profit Share' },
                    { id: 'inv_gold', bn: 'স্বর্ণে বিনিয়োগ', en: 'Gold Investment' },
                    { id: 'inv_land', bn: 'জমিতে বিনিয়োগ', en: 'Land Investment' },
                    { id: 'inv_mortgage_shop', bn: 'বন্ধক/দোকান ভাড়া আয়', en: 'Mortgage/Shop Rent' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveMenu(sub.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-all truncate ${
                        activeMenu === sub.id
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      • {lang === 'bn' ? sub.bn : sub.en}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. Institutional Borrowings */}
          {isVisible('institutionalBorrowings') && (
            <button
              onClick={() => handleMenuClick('borrowings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'borrowings'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Landmark className="w-4 h-4" />
                <span>{lang === 'bn' ? '৯. প্রতিষ্ঠানের গৃহীত ঋণ' : '9. Institutional Borrowings'}</span>
              </div>
            </button>
          )}

          {/* 10. Package & Schemes */}
          {isVisible('packageSchemes') && (
            <div>
              <button
                onClick={() => handleMenuClick('packages', true)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeMenu.startsWith('pkg_') || activeMenu === 'packages'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'bn' ? '১০. প্যাকেজ ও স্কিম' : '10. Package & Schemes'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {totalPkgNotifications > 0 && role !== 'customer' && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                      {totalPkgNotifications}
                    </span>
                  )}
                  {openSubmenu === 'packages' ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                </div>
              </button>

              {/* Package Submenus */}
              {openSubmenu === 'packages' && (
                <div className="ml-4 mt-1 pl-2 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-0.5 text-[11px]">
                  {(role === 'customer'
                    ? [
                        { id: 'pkg_general', bn: '১. সাধারণ সঞ্চয় (জমা ও উত্তোলন)', en: '1. General Savings (Deposit/Withdraw)' },
                        { id: 'pkg_joined', bn: '২. আমার যুক্ত হওয়া স্কিমসমূহ', en: '2. My Enrolled Schemes' },
                        { id: 'pkg_available', bn: '৩. উপলব্ধ সকল স্কিম প্যাকেজ', en: '3. Available Schemes' },
                        { id: 'pkg_coop', bn: '৪. সমবায় সমিতি প্যাকেজ', en: '4. Cooperative Package' },
                        { id: 'pkg_fdr', bn: '৫. এফডিআর প্যাকেজ', en: '5. FDR Package' },
                        { id: 'pkg_dps', bn: '৬. ডিপিএস প্যাকেজ', en: '6. DPS Package' },
                        { id: 'pkg_inv', bn: '৭. বিনিয়োগ প্যাকেজ', en: '7. Investment Package' },
                        { id: 'pkg_loan', bn: '৮. লোন প্যাকেজ', en: '8. Loan Package' },
                      ]
                    : [
                        { id: 'pkg_general', bn: '১. সাধারণ সঞ্চয় ব্যবস্থাপনা', en: '1. General Savings' },
                        {
                          id: 'pkg_requests',
                          bn: `২. পেন্ডিং রিকোয়েস্টসমূহ ${totalPkgNotifications > 0 ? `(${totalPkgNotifications})` : ''}`,
                          en: `2. Pending Requests ${totalPkgNotifications > 0 ? `(${totalPkgNotifications})` : ''}`,
                        },
                        { id: 'pkg_coop', bn: '৩. সমবায় সমিতি প্যাকেজ', en: '3. Cooperative Package' },
                        { id: 'pkg_fdr', bn: '৪. এফডিআর প্যাকেজ', en: '4. FDR Package' },
                        { id: 'pkg_dps', bn: '৫. ডিপিএস প্যাকেজ', en: '5. DPS Package' },
                        { id: 'pkg_inv', bn: '৬. বিনিয়োগ প্যাকেজ', en: '6. Investment Package' },
                        { id: 'pkg_loan', bn: '৭. লোন প্যাকেজ ও আবেদন', en: '7. Loan Package' },
                      ]
                  ).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveMenu(sub.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-all truncate ${
                        activeMenu === sub.id
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      • {lang === 'bn' ? sub.bn : sub.en}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 11. Complaints and Supports */}
          {isVisible('supportComplaints') && (
            <button
              onClick={() => handleMenuClick('complaints')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'complaints'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'bn' ? '১১. অভিযোগ ও সাপোর্ট' : '11. Support Tickets'}</span>
              </div>
              {pendingTickets > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white">
                  {pendingTickets}
                </span>
              )}
            </button>
          )}

          {/* 12. Reports and Audit Logs */}
          {isVisible('reportsAudit') && (
            <button
              onClick={() => handleMenuClick('reports')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'reports'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{lang === 'bn' ? '১২. রিপোর্টস ও অডিট' : '12. Reports & Audit'}</span>
              </div>
            </button>
          )}

          {/* 13. Website and Settings (Super Admin) */}
          {role === 'super_admin' && (
            <button
              onClick={() => handleMenuClick('website_settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'website_settings'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>{lang === 'bn' ? '১৩. ওয়েবসাইট ও সেটিংস' : '13. Website & Settings'}</span>
              </div>
            </button>
          )}

          {/* 14. Profile Settings */}
          <button
            onClick={() => handleMenuClick('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeMenu === 'profile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4" />
              <span>{lang === 'bn' ? '১৪. প্রোফাইল সেটিংস' : '14. Profile Settings'}</span>
            </div>
          </button>

          {/* 15. User Management (Super Admin) */}
          {role === 'super_admin' && (
            <button
              onClick={() => handleMenuClick('user_management')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'user_management'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'bn' ? '১৫. ইউজার ম্যানেজমেন্ট' : '15. User Management'}</span>
              </div>
            </button>
          )}

          {/* 16. KYC Form */}
          {isVisible('kycForm') && (
            <button
              onClick={() => handleMenuClick('kyc_form')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'kyc_form'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4" />
                <span>{lang === 'bn' ? '১৬. কেওয়াইসি ফর্ম' : '16. KYC Form'}</span>
              </div>
              {pendingKycs > 0 && role !== 'customer' && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white">
                  {pendingKycs}
                </span>
              )}
            </button>
          )}

          {/* 17. Adjustment Request */}
          {isVisible('adjustmentRequests') && (
            <button
              onClick={() => handleMenuClick('adjustment_requests')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeMenu === 'adjustment_requests'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{lang === 'bn' ? '১৭. এডজাস্টমেন্ট রিকোয়েস্ট' : '17. Adjustment Request'}</span>
              </div>
              {pendingAdjustments > 0 && role !== 'customer' && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-slate-950">
                  {pendingAdjustments}
                </span>
              )}
            </button>
          )}
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow">
              {currentUser.nameEn.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {lang === 'bn' ? currentUser.nameBn : currentUser.nameEn}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {currentUser.membershipId}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
