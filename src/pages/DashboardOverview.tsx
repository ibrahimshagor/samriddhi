import React, { useState } from 'react';
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
  Inbox,
  MessageSquare,
  Reply,
  Send,
  Megaphone,
  FileText,
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
    notices,
    getAccessibleNotices,
    replyToCustomerMessage,
    activeBranchId,
    setActiveBranchId,
    activeInstitutionId,
    setActiveInstitutionId,
    getUserAccessibleBranches,
  } = useApp();

  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  if (!currentUser) return null;

  const role = currentUser.role;
  const isSuperAdmin = role === 'super_admin';
  const isBranchManager = role === 'branch_manager';
  const accessibleBranches = getUserAccessibleBranches();

  // Filter branches based on selected institution for Super Admin
  const availableBranchesForSelector = isSuperAdmin
    ? activeInstitutionId === 'all'
      ? branches
      : branches.filter((b) => b.institutionId === activeInstitutionId)
    : accessibleBranches;

  // Filter entities according to activeInstitutionId and activeBranchId
  const accessibleBranchIds = accessibleBranches.map((b) => b.id);

  const filteredCustomers = (customers || []).filter((c) => {
    if (isSuperAdmin) {
      const matchInst = activeInstitutionId === 'all' ? true : c.institutionId === activeInstitutionId;
      const matchBranch = activeBranchId === 'all' ? true : c.branchId === activeBranchId;
      return matchInst && matchBranch;
    }
    if (activeBranchId === 'all') {
      return accessibleBranchIds.includes(c.branchId);
    }
    return c.branchId === activeBranchId;
  });

  const filteredInvestments = (investments || []).filter((i) => {
    if (isSuperAdmin) {
      const matchInst = activeInstitutionId === 'all' ? true : i.institutionId === activeInstitutionId;
      const matchBranch = activeBranchId === 'all' ? true : i.branchId === activeBranchId;
      return matchInst && matchBranch;
    }
    if (activeBranchId === 'all') {
      return accessibleBranchIds.includes(i.branchId);
    }
    return i.branchId === activeBranchId;
  });

  const filteredLoans = (loans || []).filter((l) => {
    if (isSuperAdmin) {
      const matchInst = activeInstitutionId === 'all' ? true : l.institutionId === activeInstitutionId;
      const matchBranch = activeBranchId === 'all' ? true : l.branchId === activeBranchId;
      return matchInst && matchBranch;
    }
    if (activeBranchId === 'all') {
      return accessibleBranchIds.includes(l.branchId);
    }
    return l.branchId === activeBranchId;
  });

  // Financial Summaries
  const totalGeneralSavings = filteredCustomers.reduce((acc, c) => acc + c.generalSavingsBalance, 0);
  const totalTotalDeposits = filteredCustomers.reduce((acc, c) => acc + c.totalDeposit, 0);
  const totalInvestmentsVal = filteredInvestments.reduce((acc, i) => acc + i.principalAmount, 0);
  const totalBorrowingsVal = borrowings.reduce((acc, b) => acc + b.principalAmount, 0);
  const totalLoansDisbursed = filteredLoans.reduce((acc, l) => acc + l.requestedAmount, 0);

  // Customer-specific figures
  const myCustomerRecord =
    role === 'customer'
      ? (customers || []).find((c) => c.userId === currentUser.id || c.id === currentUser.id || c.mobile === currentUser.mobile) || null
      : null;
  const myJoinedPkgs = myCustomerRecord
    ? (joinedPackages || []).filter((jp) => jp.customerId === myCustomerRecord.id)
    : [];
  const myLoans = myCustomerRecord
    ? (loans || []).filter((l) => l.customerId === myCustomerRecord.id)
    : [];

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

      {/* Dashboard Institution & Branch Scope Filter Toolbar */}
      {role !== 'customer' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ডাটা ফিল্টারিং ও শাখা পর্যবেক্ষণ' : 'Scope & Branch Dashboard Filter'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSuperAdmin
                  ? lang === 'bn'
                    ? 'প্রতিষ্ঠান ও শাখা ভিত্তিক পরিসংখ্যান দেখতে নির্বাচন করুন'
                    : 'Select institution and branch to filter real-time metrics'
                  : lang === 'bn'
                  ? 'আপনার দায়িত্বপ্রাপ্ত শাখার ডাটা নির্বাচন করুন'
                  : 'Filter metrics for your assigned branches'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Super Admin: Institution Selector */}
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'প্রতিষ্ঠান:' : 'Inst:'}
                </span>
                <select
                  value={activeInstitutionId}
                  onChange={(e) => setActiveInstitutionId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900">
                    {lang === 'bn' ? '🌐 সকল প্রতিষ্ঠান (All Institutions)' : '🌐 All Institutions'}
                  </option>
                  {(institutions || []).map((inst) => (
                    <option key={inst.id} value={inst.id} className="dark:bg-slate-900">
                      🏢 {lang === 'bn' ? inst.nameBn : inst.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Branch Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'শাখা:' : 'Branch:'}
              </span>
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-900">
                  {isSuperAdmin
                    ? activeInstitutionId === 'all'
                      ? lang === 'bn'
                        ? '🏛️ সকল শাখা (All Branches)'
                        : '🏛️ All Branches'
                      : lang === 'bn'
                      ? '🏛️ প্রতিষ্ঠানের সকল শাখা (All Branches in Inst)'
                      : '🏛️ All Branches in Inst'
                    : lang === 'bn'
                    ? '🏛️ সকল দায়িত্বপ্রাপ্ত শাখা (All Assigned Branches)'
                    : '🏛️ All Assigned Branches'}
                </option>
                {availableBranchesForSelector.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-slate-900">
                    📍 {lang === 'bn' ? b.nameBn : b.nameEn} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

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
              {formatBDT(myCustomerRecord?.generalSavingsBalance || 0, lang)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' ? 'হিসাব নম্বর:' : 'Account No:'} <span className="font-mono font-bold">{myCustomerRecord?.accountNo || 'N/A'}</span>
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
                  myCustomerRecord?.kycStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : myCustomerRecord?.kycStatus === 'pending'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {myCustomerRecord?.kycStatus === 'approved'
                  ? 'অনুমোদিত (Approved)'
                  : myCustomerRecord?.kycStatus === 'pending'
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'অফিশিয়াল ইনবক্স ও বার্তা' : 'Official Inbox & Messages'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'এডমিন বা শাখা থেকে প্রেরিত বার্তা দেখুন ও সরাসরি উত্তর দিন' : 'Read official notices and reply directly'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('inbox')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'bn' ? 'সব বার্তা দেখুন' : 'Full Inbox'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {((customerMessages || []).filter((m) => m.customerId === myCustomerRecord?.id) || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              {lang === 'bn' ? 'আপনার জন্য নতুন কোনো অফিশিয়াল নোটিশ বা বার্তা নেই।' : 'No official notices or messages for you yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {((customerMessages || []).filter((m) => m.customerId === myCustomerRecord?.id) || []).slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      {msg.subject && (
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                          📌 {msg.subject}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {msg.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {lang === 'bn' ? 'প্রেরক:' : 'From:'} {msg.senderName || (lang === 'bn' ? 'এডমিন/শাখা অফিসার' : 'Admin/Branch Officer')} • {formatDate(msg.createdAt, lang)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-start">
                      {!msg.isRead && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-black animate-pulse">
                          {lang === 'bn' ? 'নতুন' : 'NEW'}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (activeReplyId === msg.id) {
                            setActiveReplyId(null);
                          } else {
                            setActiveReplyId(msg.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Reply className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'উত্তর দিন' : 'Reply'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Fast Reply Box */}
                  {activeReplyId === msg.id && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyInputMap[msg.id] || ''}
                        onChange={(e) => setReplyInputMap({ ...replyInputMap, [msg.id]: e.target.value })}
                        placeholder={lang === 'bn' ? 'আপনার উত্তর লিখুন...' : 'Type your quick reply...'}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (replyInputMap[msg.id] || '').trim()) {
                            replyToCustomerMessage(msg.id, replyInputMap[msg.id]);
                            setReplyInputMap({ ...replyInputMap, [msg.id]: '' });
                            setActiveReplyId(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if ((replyInputMap[msg.id] || '').trim()) {
                            replyToCustomerMessage(msg.id, replyInputMap[msg.id]);
                            setReplyInputMap({ ...replyInputMap, [msg.id]: '' });
                            setActiveReplyId(null);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
                      </button>
                    </div>
                  )}
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

      {/* Latest Official Notices & Circulars Highlight Widget */}
      {(() => {
        const userNotices = getAccessibleNotices ? getAccessibleNotices(currentUser) : notices || [];
        const topNotices = userNotices.slice(0, 2);

        return (
          <div className="bg-linear-to-r from-amber-500/10 via-orange-500/5 to-transparent bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-900/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'অফিশিয়াল সার্কুলার ও নোটিশ বোর্ড' : 'Official Circulars & Notice Board'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'প্রধান কার্যালয় ও শাখার সর্বশেষ আদেশ ও পরিপত্রসমূহ' : 'Latest institutional directives and memos'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('notices')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>{lang === 'bn' ? 'সকল নোটিশ ও A4 প্রিন্ট' : 'View All & Print'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topNotices.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                {lang === 'bn' ? 'বর্তমানে কোনো সক্রিয় নোটিশ নেই।' : 'No active notices at this time.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topNotices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onNavigate('notices')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {n.scope === 'global' ? '👑 গ্লোবাল' : n.scope === 'institution' ? '🏛️ প্রতিষ্ঠান' : '🏢 শাখা'} • {n.memoNo}
                        </span>
                        <span>{n.publishDate}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-1">
                        {lang === 'bn' ? n.titleBn : n.titleEn || n.titleBn}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {lang === 'bn' ? n.contentBn : n.contentEn || n.contentBn}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                      <span>✍️ {n.signatoryName || n.publishedBy}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                        {lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Read Notice'} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

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
