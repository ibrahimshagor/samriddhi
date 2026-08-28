import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InstitutionalBorrowing } from '../types';
import { formatBDT } from '../utils/formatters';
import {
  Landmark,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calculator,
  Calendar,
  Building,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const InstitutionalBorrowings: React.FC = () => {
  const {
    currentUser,
    borrowings,
    addBorrowing,
    updateBorrowing,
    deleteBorrowing,
    toggleBorrowingVisibility,
    lang,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBor, setEditingBor] = useState<InstitutionalBorrowing | null>(null);

  // Form State
  const [lenderNameBn, setLenderNameBn] = useState('');
  const [lenderNameEn, setLenderNameEn] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('5000000');
  const [interestRatePct, setInterestRatePct] = useState('9');
  const [annualGovVatPct, setAnnualGovVatPct] = useState('10');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [tenureMonths, setTenureMonths] = useState('24');
  const [gracePeriodMonths, setGracePeriodMonths] = useState('6');
  const [monthlyInstallment, setMonthlyInstallment] = useState('220000');
  const [visibleToSubUsers, setVisibleToSubUsers] = useState(true);

  if (!currentUser) return null;
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Visibility filtering: Super Admin sees all; Managers/Staff/Customers only see if visibleToSubUsers === true
  const safeBorrowings = borrowings || [];
  const allowedList = isSuperAdmin ? safeBorrowings : safeBorrowings.filter((b) => b.visibleToSubUsers);

  const filteredList = allowedList.filter((b) => {
    const query = (searchQuery || '').toLowerCase();
    return (
      (b.lenderNameBn || '').toLowerCase().includes(query) ||
      (b.lenderNameEn || '').toLowerCase().includes(query)
    );
  });

  const totalBorrowedSum = allowedList.reduce((sum, b) => sum + b.principalAmount, 0);
  const totalMonthlyRepaymentSum = allowedList.reduce((sum, b) => sum + b.monthlyInstallment, 0);

  const calculateAutoMaturity = (start: string, months: number) => {
    const d = new Date(start || Date.now());
    d.setMonth(d.getMonth() + (months || 24));
    return d.toISOString().split('T')[0];
  };

  const calculateNextInstallment = (start: string, graceMonths: number) => {
    const d = new Date(start || Date.now());
    // Next installment starts after grace period or 1 month
    d.setMonth(d.getMonth() + Math.max(1, graceMonths || 1));
    return d.toISOString().split('T')[0];
  };

  const handleOpenAdd = () => {
    setEditingBor(null);
    setLenderNameBn('পূবালী ব্যাংক লিমিটেড');
    setLenderNameEn('Pubali Bank Limited');
    setPrincipalAmount('5000000');
    setInterestRatePct('9');
    setAnnualGovVatPct('10');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTenureMonths('24');
    setGracePeriodMonths('6');
    setMonthlyInstallment('220000');
    setVisibleToSubUsers(true);
    setShowModal(true);
  };

  const handleOpenEdit = (b: InstitutionalBorrowing) => {
    setEditingBor(b);
    setLenderNameBn(b.lenderNameBn);
    setLenderNameEn(b.lenderNameEn);
    setPrincipalAmount(b.principalAmount.toString());
    setInterestRatePct(b.interestRatePct.toString());
    setAnnualGovVatPct((b.annualGovVatPct || 10).toString());
    setStartDate(b.startDate || new Date().toISOString().split('T')[0]);
    setTenureMonths(b.tenureMonths.toString());
    setGracePeriodMonths(b.gracePeriodMonths.toString());
    setMonthlyInstallment(b.monthlyInstallment.toString());
    setVisibleToSubUsers(b.visibleToSubUsers);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const pAmt = parseFloat(principalAmount) || 0;
    const iRate = parseFloat(interestRatePct) || 0;
    const vatRate = parseFloat(annualGovVatPct) || 10;
    const gMonths = parseInt(gracePeriodMonths) || 0;
    const tMonths = parseInt(tenureMonths) || 24;
    const mInst = parseFloat(monthlyInstallment) || 0;

    const matDate = calculateAutoMaturity(startDate, tMonths);
    const nextInstDate = calculateNextInstallment(startDate, gMonths);

    if (editingBor) {
      updateBorrowing({
        ...editingBor,
        lenderNameBn,
        lenderNameEn,
        principalAmount: pAmt,
        interestRatePct: iRate,
        annualGovVatPct: vatRate,
        startDate,
        gracePeriodMonths: gMonths,
        tenureMonths: tMonths,
        maturityDate: matDate,
        monthlyInstallment: mInst,
        nextInstallmentDate: nextInstDate,
        visibleToSubUsers,
      });
    } else {
      addBorrowing({
        lenderNameBn,
        lenderNameEn,
        principalAmount: pAmt,
        interestRatePct: iRate,
        annualGovVatPct: vatRate,
        startDate,
        tenureMonths: tMonths,
        gracePeriodMonths: gMonths,
        maturityDate: matDate,
        monthlyInstallment: mInst,
        totalRepayable: mInst * tMonths,
        nextInstallmentDate: nextInstDate,
        visibleToSubUsers,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৯. প্রতিষ্ঠানের গৃহীত ব্যাংক ঋণ (Institutional Borrowings)' : '9. Institutional Borrowings'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সুপার এডমিন অ্যাক্সেস, গ্রেস পিরিয়ড, অটো কিস্তি ক্যালকুলেটর ও সাব-ইউজার ভিজিবিলিটি কন্ট্রোল'
              : 'Full Super Admin control, grace period calculator & visibility toggles for managers, staff and customers'}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন ব্যাংক ঋণ যুক্ত করুন' : 'Add Bank Borrowing'}</span>
          </button>
        )}
      </div>

      {/* Dashboard Auto Integration Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">
            {lang === 'bn' ? 'প্রতিষ্ঠানের মোট গৃহীত ঋণ (ড্যাশবোর্ড সমন্বিত)' : 'Total Institutional Borrowing'}
          </span>
          <p className="text-2xl font-black mt-1">{formatBDT(totalBorrowedSum, lang)}</p>
          <p className="text-[11px] text-emerald-100/90 mt-1">
            মোট {allowedList.length} টি সক্রিয় প্রাতিষ্ঠানিক লোন প্রকল্প
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {lang === 'bn' ? 'মাসিক মোট পরিশোধযোগ্য কিস্তি' : 'Total Monthly Installment Repayment'}
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatBDT(totalMonthlyRepaymentSum, lang)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            সকল ব্যাংকে মাসিক স্বয়ংক্রিয় পরিপূরক কিস্তি
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'ব্যাংক বা ঋণদাতা প্রতিষ্ঠানের নাম দিয়ে খুঁজুন...' : 'Search borrowings by lender name...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Borrowings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((bor) => (
          <div
            key={bor.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ব্যাংক/সংস্থা ঋণ
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                    {lang === 'bn' ? bor.lenderNameBn : bor.lenderNameEn}
                  </h3>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => toggleBorrowingVisibility(bor.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      bor.visibleToSubUsers
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                    title={bor.visibleToSubUsers ? 'সাব-ইউজারদের কাছে দৃশ্যমান (অন)' : 'সাব-ইউজারদের কাছে অদৃশ্য (অফ)'}
                  >
                    {bor.visibleToSubUsers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{bor.visibleToSubUsers ? 'দৃশ্যমান (ON)' : 'অদৃশ্য (OFF)'}</span>
                  </button>
                )}
              </div>

              {/* Main Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">গৃহীত লোনের পরিমাণ:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatBDT(bor.principalAmount, lang)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40">
                  <span className="text-[10px] text-emerald-600 block">সুদের হার (%):</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {bor.interestRatePct}% <span className="text-[9px] font-normal text-slate-400">(ভ্যাট: {bor.annualGovVatPct || 10}%)</span>
                  </span>
                </div>
              </div>

              {/* Installment & Dates Summary */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
                <p className="flex justify-between">
                  <span className="text-slate-400">সুদ শুরু (গ্রেস পিরিয়ড):</span>
                  <span className="font-bold text-amber-600">{bor.gracePeriodMonths} মাস পর থেকে</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">মোট মেয়াদ:</span>
                  <span className="font-bold">{bor.tenureMonths} মাস</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">চালুর তারিখ:</span>
                  <span>{bor.startDate}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">লোন শেষের তারিখ:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{bor.maturityDate}</span>
                </p>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-400">পরবর্তী কিস্তির তারিখ:</span>
                    <span className="font-extrabold text-emerald-600">{bor.nextInstallmentDate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">পরবর্তী কিস্তির পরিমাণ:</span>
                    <span className="font-black text-slate-900 dark:text-white">{formatBDT(bor.monthlyInstallment, lang)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {isSuperAdmin && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(bor)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBorrowing(bor.id)}
                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Super Admin to Create or Edit Institutional Borrowing */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <span>{editingBor ? 'গৃহীত ব্যাংক ঋণ সম্পাদনা' : 'নতুন প্রাতিষ্ঠানিক ব্যাংক ঋণ যুক্ত করুন'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ব্যাংক বা ঋণদাতা সংস্থার নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={lenderNameBn}
                  onChange={(e) => setLenderNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ব্যাংক বা ঋণদাতা সংস্থার নাম (English)
                </label>
                <input
                  type="text"
                  value={lenderNameEn}
                  onChange={(e) => setLenderNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    লোনের পরিমাণ (BDT)
                  </label>
                  <input
                    type="number"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ঋণ গ্রহণের তারিখ
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সুদের হার (%)
                  </label>
                  <input
                    type="number"
                    value={interestRatePct}
                    onChange={(e) => setInterestRatePct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ভ্যাট (%)
                  </label>
                  <input
                    type="number"
                    value={annualGovVatPct}
                    onChange={(e) => setAnnualGovVatPct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মেয়াদ (মাস)
                  </label>
                  <input
                    type="number"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    গ্রেস পিরিয়ড (সুদ শুরুর সময় - মাস)
                  </label>
                  <input
                    type="number"
                    value={gracePeriodMonths}
                    onChange={(e) => setGracePeriodMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মাসিক কিস্তির পরিমাণ (BDT)
                  </label>
                  <input
                    type="number"
                    value={monthlyInstallment}
                    onChange={(e) => setMonthlyInstallment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Sub-user visibility toggle switch */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">অন্যান্য ইউজারদের ভিজিবিলিটি</p>
                  <p className="text-[10px] text-slate-500">ম্যানেজার, স্টাফ ও কাস্টমারদের কাছে এই ঋণের তথ্য প্রদর্শন করবেন?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVisibleToSubUsers(!visibleToSubUsers)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    visibleToSubUsers ? 'bg-emerald-600 text-white shadow' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {visibleToSubUsers ? 'প্রদর্শন চালু (ON)' : 'প্রদর্শন বন্ধ (OFF)'}
                </button>
              </div>

              {/* Auto summary calculation */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1 text-[11px]">
                <p className="flex justify-between font-bold">
                  <span>অটো লোন মেয়াদ উত্তীর্ণের তারিখ:</span>
                  <span className="text-emerald-700 dark:text-emerald-300">{calculateAutoMaturity(startDate, parseInt(tenureMonths) || 24)}</span>
                </p>
                <p className="flex justify-between">
                  <span>পরবর্তী অটো কিস্তির তারিখ:</span>
                  <span>{calculateNextInstallment(startDate, parseInt(gracePeriodMonths) || 0)}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
