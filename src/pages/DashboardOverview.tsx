import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT, formatDate } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  Briefcase,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  FileCheck2,
  SlidersHorizontal,
  PlusCircle,
  PiggyBank,
} from 'lucide-react';

export const DashboardOverview: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate = (_page: string) => {} }) => {
  const {
    currentUser,
    lang,
    institutions,
    branches,
    customers,
    investments,
    borrowings,
    joinedPackages,
    loans,
    adjustmentRequests,
    kycRecords,
    supportTickets,
    customerMessages,
  } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Filter entities according to user scope
  const filteredCustomers =
    role === 'super_admin'
      ? customers
      : customers.filter((c) => c.branchId === currentUser.branchId);

  const filteredInvestments =
    role === 'super_admin'
      ? investments
      : investments.filter((i) => i.branchId === currentUser.branchId);

  const filteredLoans =
    role === 'super_admin'
      ? loans
      : loans.filter((l) => l.branchId === currentUser.branchId);

  // Financial Summaries
  const totalGeneralSavings = filteredCustomers.reduce((acc, c) => acc + c.generalSavingsBalance, 0);
  const totalTotalDeposits = filteredCustomers.reduce((acc, c) => acc + c.totalDeposit, 0);
  const totalInvestmentsVal = filteredInvestments.reduce((acc, i) => acc + i.principalAmount, 0);
  const totalBorrowingsVal = borrowings.reduce((acc, b) => acc + b.principalAmount, 0);
  const totalLoansDisbursed = filteredLoans.reduce((acc, l) => acc + l.requestedAmount, 0);

  // Customer-specific figures
  const myCustomerRecord = (customers || []).find((c) => c.userId === currentUser.id) || (customers || [])[0];
  const myJoinedPkgs = (joinedPackages || []).filter((jp) => jp.customerId === myCustomerRecord?.id);
  const myLoans = (loans || []).filter((l) => l.customerId === myCustomerRecord?.id);

  const pendingAdjCount = (adjustmentRequests || []).filter((a) => a.status === 'pending').length;
  const pendingKycCount = (kycRecords || []).filter((k) => k.status === 'pending').length;
  const pendingTicketsCount = (supportTickets || []).filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {role === 'super_admin'
                  ? 'সুপার এডমিন কন্ট্রোল প্যানেল'
                  : role === 'branch_manager'
                  ? 'শাখা ম্যানেজমেন্ট প্যানেল'
                  : role === 'branch_staff'
                  ? 'শাখা স্টাফ ড্যাশবোর্ড'
                  : 'গ্রাহক পোর্টাল'}
              </span>
            </div>
            <h2 className="text-2xl font-black">
              {lang === 'bn' ? `স্বাগতম, ${currentUser.nameBn}!` : `Welcome back, ${currentUser.nameEn}!`}
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-xl">
              {lang === 'bn'
                ? 'আপনার সমবায় সমিতি ও ক্ষুদ্র ব্যাংকের সঞ্চয়, বিনিয়োগ, ডিপিএস, এফডিআর ও লোন হিসাবের রিয়েল-টাইম ওভারভিউ।'
                : 'Real-time financial dashboard for cooperative society & micro-banking management.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role === 'customer' ? (
              <button
                onClick={() => onNavigate('adjustment_requests')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{lang === 'bn' ? 'টাকা জমার এন্ট্রি দিন' : 'Submit Deposit Proof'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('reports')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'আর্থিক রিপোর্ট দেখুন' : 'View Financial Reports'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {role !== 'customer' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total General Savings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'মোট সাধারণ সঞ্চয় জমা' : 'Total General Savings'}
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-3">
              {formatBDT(totalGeneralSavings, lang)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {lang === 'bn' ? `মোট গ্রাহক সংখ্যা: ${filteredCustomers.length} জন` : `Active Customers: ${filteredCustomers.length}`}
            </p>
          </div>

          {/* Card 2: Total Investments */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'মোট সম্পদ ও বিনিয়োগ' : 'Total Portfolio Investments'}
              </span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-3">
              {formatBDT(totalInvestmentsVal, lang)}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              {lang === 'bn' ? `মোট প্রকল্প: ${filteredInvestments.length} টি` : `Projects: ${filteredInvestments.length}`}
            </p>
          </div>

          {/* Card 3: Total Loans Disbursed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'গ্রাহকদের বিতৃত মোট লোন' : 'Disbursed Member Loans'}
              </span>
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-3">
              {formatBDT(totalLoansDisbursed, lang)}
            </p>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">
              {lang === 'bn' ? `মোট লোন গ্রহীতা: ${filteredLoans.length} জন` : `Active Loans: ${filteredLoans.length}`}
            </p>
          </div>

          {/* Card 4: Institutional Borrowings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'প্রতিষ্ঠানের গৃহীত ব্যাংক ঋণ' : 'Institutional Borrowings'}
              </span>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-3">
              {formatBDT(totalBorrowingsVal, lang)}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              {lang === 'bn' ? `চলতি ব্যাংক লোন: ${borrowings.length} টি` : `Active Fund Borrowings: ${borrowings.length}`}
            </p>
          </div>
        </div>
      ) : (
        /* Customer Portal Dashboard Cards */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'আপনার সাধারণ সঞ্চয় ব্যালেন্স' : 'My General Savings Balance'}
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {formatBDT(myCustomerRecord.generalSavingsBalance, lang)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' ? 'হিসাব নম্বর:' : 'Account No:'} <span className="font-mono font-bold">{myCustomerRecord.accountNo}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'যুক্ত থাকা ডিপিএস/সমবায় প্যাকেজ' : 'Active Packages & Schemes'}
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {myJoinedPkgs.length} {lang === 'bn' ? 'টি' : ''}
            </p>

            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {lang === 'bn' ? 'মোট জমাকৃত অর্থ:' : 'Total Scheme Deposits:'}{' '}
              {formatBDT(myJoinedPkgs.reduce((a, b) => a + b.totalPaid, 0), lang)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'আপনার কেওয়াইসি স্ট্যাটাস' : 'My KYC Status'}
            </span>
            <div className="mt-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                  myCustomerRecord.kycStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : myCustomerRecord.kycStatus === 'pending'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {myCustomerRecord.kycStatus === 'approved'
                  ? 'অনুমোদিত (Approved)'
                  : myCustomerRecord.kycStatus === 'pending'
                  ? 'যাচাইধীন (Pending)'
                  : 'অসম্পূর্ণ (Incomplete)'}
              </span>
            </div>
            <button
              onClick={() => onNavigate('kyc_form')}
              className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {lang === 'bn' ? 'কেওয়াইসি ফর্ম বিস্তারিত দেখুন →' : 'View KYC Form →'}
            </button>
          </div>
        </div>
      )}

      {/* Customer Inbox Messages from Admin / Branch */}
      {role === 'customer' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'এডমিন ও শাখা অফিসের অফিশিয়াল মেসেজসমূহ' : 'Official Admin Messages & Notices'}</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {((customerMessages || []).filter((m) => m.customerId === myCustomerRecord?.id) || []).length} {lang === 'bn' ? 'টি বার্তা' : 'Messages'}
            </span>
          </div>

          {((customerMessages || []).filter((m) => m.customerId === myCustomerRecord?.id) || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              {lang === 'bn' ? 'আপনার জন্য নতুন কোনো অফিশিয়াল নোটিশ বা মেসেজ নেই।' : 'No official notices or messages for you yet.'}
            </p>
          ) : (
            <div className="space-y-2.5">
              {((customerMessages || []).filter((m) => m.customerId === myCustomerRecord?.id) || []).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{msg.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {lang === 'bn' ? 'প্রেরক: এডমিন/শাখা অফিসার' : 'From: Admin/Branch Officer'} • {formatDate(msg.createdAt, lang)}
                    </p>
                  </div>
                  <span className="self-start sm:self-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
                    {lang === 'bn' ? 'অফিশিয়াল' : 'OFFICIAL'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actionable Pending Approvals Alert Bar for Staff/Managers */}
      {role !== 'customer' && (pendingAdjCount > 0 || pendingKycCount > 0 || pendingTicketsCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                {lang === 'bn' ? 'অপেক্ষমাণ অনুমোদন বিজ্ঞপ্তি' : 'Pending Approvals Alert'}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                {pendingAdjCount > 0 && `• ${pendingAdjCount} টি পেমেন্ট এডজাস্টমেন্ট `}
                {pendingKycCount > 0 && `• ${pendingKycCount} টি কেওয়াইসি আবেদন `}
                {pendingTicketsCount > 0 && `• ${pendingTicketsCount} টি সাপোর্ট টিকিট `}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingAdjCount > 0 && (
              <button
                onClick={() => onNavigate('adjustment_requests')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {lang === 'bn' ? 'পেমেন্ট রিভিউ করুন' : 'Review Payments'}
              </button>
            )}
            {pendingKycCount > 0 && (
              <button
                onClick={() => onNavigate('kyc_form')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {lang === 'bn' ? 'কেওয়াইসি দেখুন' : 'Review KYC'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Access Services Shortcuts Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'bn' ? 'দ্রুত সেবা সমুহ (Quick Services)' : 'Quick Services'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'pkg_general', titleBn: 'সাধারণ সঞ্চয়', titleEn: 'General Savings', icon: Wallet },
            { id: 'pkg_coop', titleBn: 'সমবায় প্যাকেজ', titleEn: 'Coop Package', icon: Users },
            { id: 'pkg_dps', titleBn: 'ডিপিএস স্কিম', titleEn: 'DPS Schemes', icon: PiggyBank },
            { id: 'pkg_fdr', titleBn: 'এফডিআর প্যাকেজ', titleEn: 'FDR Packages', icon: Landmark },
            { id: 'pkg_loan', titleBn: 'লোন আবেদন', titleEn: 'Loan Application', icon: CreditCard },
            { id: 'inv_fdr', titleBn: 'বিনিয়োগ পোর্টফোলিও', titleEn: 'Investments', icon: Briefcase },
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200/80 dark:border-slate-700/60 transition-all active:scale-95 text-center group cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white shadow-xs transition-colors">
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2">
                  {lang === 'bn' ? item.titleBn : item.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
