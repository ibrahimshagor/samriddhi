import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchemePackage, PackageType, ExtraSubscriptionFee } from '../types';
import { formatBDT } from '../utils/formatters';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  PiggyBank,
  Sparkles,
  Gift,
  CreditCard,
  Landmark,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';

interface PackageSchemesProps {
  activeSubcategory?: string;
}

export const PackageSchemes: React.FC<PackageSchemesProps> = ({ activeSubcategory }) => {
  const {
    currentUser,
    packages,
    joinedPackages,
    loans,
    customers,
    addPackage,
    updatePackage,
    deletePackage,
    joinPackage,
    applyForLoan,
    reviewLoan,
    settings,
    updateSettings,
    showToast,
    lang,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    activeSubcategory || 'all'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<SchemePackage | null>(null);

  // Joining / Application Modal
  const [joinModalPkg, setJoinModalPkg] = useState<SchemePackage | null>(null);
  const [sharesCountInput, setSharesCountInput] = useState('1');
  const [loanRequestedAmount, setLoanRequestedAmount] = useState('50000');
  const [loanRequestedTenure, setLoanRequestedTenure] = useState('12');

  // General Savings Settings Modal for Super Admin
  const [showGenSavingsSettingsModal, setShowGenSavingsSettingsModal] = useState(false);
  const [genSavingsInterestRate, setGenSavingsInterestRate] = useState(settings.generalSavingsInterestPct.toString());
  const [genSavingsVatRate, setGenSavingsVatRate] = useState(settings.generalSavingsVatPct.toString());
  const [genSavingsMonth, setGenSavingsMonth] = useState(settings.generalSavingsPayoutMonth.toString());

  // Form State for Creating/Editing Package
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [pkgType, setPkgType] = useState<PackageType>('dps');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [totalShares, setTotalShares] = useState('100');
  const [pricePerShare, setPricePerShare] = useState('500');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [paymentCycle, setPaymentCycle] = useState<'weekly' | 'monthly' | 'semi_annual' | 'annual'>('monthly');
  const [profitRatePct, setProfitRatePct] = useState('12');
  const [annualGovVatPct, setAnnualGovVatPct] = useState('15');
  const [earlyWithdrawalPenaltyPct, setEarlyWithdrawalPenaltyPct] = useState('5');
  const [lateFeeAmount, setLateFeeAmount] = useState('50');
  const [paymentGraceDays, setPaymentGraceDays] = useState('5');

  // Festival / Extra fees state inside package creation
  const [extraFeesList, setExtraFeesList] = useState<
    { id: string; titleBn: string; titleEn: string; amount: string; dueDate: string }[]
  >([
    { id: 'ef-1', titleBn: 'ঈদুল ফিতর বিশেষ চাঁদা', titleEn: 'Eid-ul-Fitr Special Fee', amount: '200', dueDate: '2025-03-30' },
    { id: 'ef-2', titleBn: 'ঈদুল আযহা বিশেষ চাঁদা', titleEn: 'Eid-ul-Adha Special Fee', amount: '300', dueDate: '2025-06-06' },
    { id: 'ef-3', titleBn: 'শবে বরাত বিশেষ চাঁদা', titleEn: 'Shab-e-Barat Special Fee', amount: '150', dueDate: '2025-02-14' },
  ]);

  if (!currentUser) return null;
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canManage = isSuperAdmin || currentUser.role === 'branch_manager';

  const categoryOptions: { id: PackageType; bn: string; en: string; icon: any }[] = [
    { id: 'general_savings', bn: '১. সাধারণ সঞ্চয়', en: '1. General Savings', icon: PiggyBank },
    { id: 'cooperative_package', bn: '২. সমবায় সমিতি প্যাকেজ', en: '2. Coop Package', icon: Gift },
    { id: 'fdr', bn: '৩. এফডিআর প্যাকেজ', en: '3. FDR Package', icon: Landmark },
    { id: 'dps', bn: '৪. ডিপিএস প্যাকেজ', en: '4. DPS Package', icon: Layers },
    { id: 'investment', bn: '৫. ইনভেস্টমেন্ট প্যাকেজ', en: '5. Investment Package', icon: Sparkles },
    { id: 'loan', bn: '৬. লোন প্যাকেজ (Loan)', en: '6. Loan Package', icon: CreditCard },
  ];

  const filteredPackages = packages.filter((p) => {
    const catMatch =
      selectedCategory === 'all' ||
      p.type === selectedCategory ||
      ('pkg_' + p.type) === selectedCategory;
    const query = (searchQuery || '').toLowerCase();
    const searchMatch =
      (p.titleBn || '').toLowerCase().includes(query) ||
      (p.titleEn || '').toLowerCase().includes(query);
    return catMatch && searchMatch;
  });

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setTitleBn('নতুন ডিপিএস সঞ্চয় প্যাকেজ');
    setTitleEn('New DPS Savings Package');
    setPkgType('dps');
    setDescriptionBn('গ্রাহকদের জন্য আকর্ষণীয় ডিপিএস স্কিম। নির্দিষ্ট কিস্তি জমার মাধ্যমে লাভজনক মুনাফা পাবেন।');
    setTotalShares('100');
    setPricePerShare('1000');
    setTenureMonths('12');
    setPaymentCycle('monthly');
    setProfitRatePct('12');
    setAnnualGovVatPct('15');
    setEarlyWithdrawalPenaltyPct('5');
    setLateFeeAmount('50');
    setPaymentGraceDays('5');
    setExtraFeesList([
      { id: 'ef-1', titleBn: 'ঈদুল ফিতর বিশেষ চাঁদা', titleEn: 'Eid-ul-Fitr Special Fee', amount: '200', dueDate: '2025-03-30' },
      { id: 'ef-2', titleBn: 'ঈদুল আযহা বিশেষ চাঁদা', titleEn: 'Eid-ul-Adha Special Fee', amount: '300', dueDate: '2025-06-06' },
      { id: 'ef-3', titleBn: 'শবে বরাত বিশেষ চাঁদা', titleEn: 'Shab-e-Barat Special Fee', amount: '150', dueDate: '2025-02-14' },
    ]);
    setShowModal(true);
  };

  const handleOpenEdit = (p: SchemePackage) => {
    setEditingPkg(p);
    setTitleBn(p.titleBn);
    setTitleEn(p.titleEn);
    setPkgType(p.type);
    setDescriptionBn(p.descriptionBn);
    setTotalShares((p.totalShares || 100).toString());
    setPricePerShare((p.pricePerShare || p.minAmount || 500).toString());
    setTenureMonths((p.tenureMonths || 12).toString());
    setPaymentCycle(p.paymentCycle || 'monthly');
    setProfitRatePct((p.profitRatePct || p.interestRatePct || 12).toString());
    setAnnualGovVatPct((p.annualGovVatPct || 15).toString());
    setEarlyWithdrawalPenaltyPct((p.earlyWithdrawalPenaltyPct || 5).toString());
    setLateFeeAmount((p.lateFeeAmount || 50).toString());
    setPaymentGraceDays((p.paymentGraceDays || 5).toString());

    if (p.extraFees && p.extraFees.length > 0) {
      setExtraFeesList(
        p.extraFees.map((ef, idx) => ({
          id: ef.id || 'ef-' + idx,
          titleBn: ef.titleBn,
          titleEn: ef.titleEn || ef.titleBn,
          amount: ef.amount.toString(),
          dueDate: ef.dueDate || '2025-06-01',
        }))
      );
    } else {
      setExtraFeesList([
        { id: 'ef-1', titleBn: 'ঈদুল ফিতর বিশেষ চাঁদা', titleEn: 'Eid-ul-Fitr Special Fee', amount: '200', dueDate: '2025-03-30' },
        { id: 'ef-2', titleBn: 'ঈদুল আযহা বিশেষ চাঁদা', titleEn: 'Eid-ul-Adha Special Fee', amount: '300', dueDate: '2025-06-06' },
        { id: 'ef-3', titleBn: 'শবে বরাত বিশেষ চাঁদা', titleEn: 'Shab-e-Barat Special Fee', amount: '150', dueDate: '2025-02-14' },
      ]);
    }
    setShowModal(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const shares = parseInt(totalShares) || 100;
    const price = parseFloat(pricePerShare) || 500;
    const dur = parseInt(tenureMonths) || 12;
    const profit = parseFloat(profitRatePct) || 12;
    const vat = parseFloat(annualGovVatPct) || 15;
    const penalty = parseFloat(earlyWithdrawalPenaltyPct) || 5;
    const lateFee = parseFloat(lateFeeAmount) || 50;
    const graceDays = parseInt(paymentGraceDays) || 5;

    const extraFeesArr: ExtraSubscriptionFee[] = extraFeesList
      .filter((f) => parseFloat(f.amount) > 0 && f.titleBn.trim().length > 0)
      .map((f, idx) => ({
        id: f.id || 'fee-' + idx + '-' + Date.now(),
        titleBn: f.titleBn,
        titleEn: f.titleEn || f.titleBn,
        amount: parseFloat(f.amount) || 0,
        dueDate: f.dueDate || '2025-06-01',
      }));

    if (editingPkg) {
      updatePackage({
        ...editingPkg,
        titleBn,
        titleEn,
        type: pkgType,
        descriptionBn,
        descriptionEn: descriptionBn,
        totalShares: shares,
        pricePerShare: price,
        minAmount: price,
        tenureMonths: dur,
        paymentCycle,
        profitRatePct: profit,
        interestRatePct: profit,
        annualGovVatPct: vat,
        earlyWithdrawalPenaltyPct: penalty,
        lateFeeAmount: lateFee,
        paymentGraceDays: graceDays,
        extraFees: extraFeesArr,
      });
    } else {
      addPackage({
        titleBn,
        titleEn,
        type: pkgType,
        institutionId: currentUser.institutionId || 'inst-1',
        descriptionBn,
        descriptionEn: descriptionBn,
        totalShares: shares,
        pricePerShare: price,
        minAmount: price,
        tenureMonths: dur,
        paymentCycle,
        profitRatePct: profit,
        interestRatePct: profit,
        annualGovVatPct: vat,
        earlyWithdrawalPenaltyPct: penalty,
        lateFeeAmount: lateFee,
        paymentGraceDays: graceDays,
        extraFees: extraFeesArr,
        status: 'active',
      });
    }
    setShowModal(false);
  };

  const handleJoinOrApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalPkg) return;

    const currentCustomer = (customers || []).find((c) => c.userId === currentUser.id) || (customers || [])[0];

    if (joinModalPkg.type === 'loan') {
      const amt = parseFloat(loanRequestedAmount) || 50000;
      const tenure = parseInt(loanRequestedTenure) || 12;
      applyForLoan(currentCustomer.id, joinModalPkg.id, amt, tenure);
    } else {
      const shares = parseInt(sharesCountInput) || 1;
      joinPackage(currentCustomer.id, joinModalPkg.id, shares);
    }

    setJoinModalPkg(null);
  };

  const handleSaveGeneralSavingsSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      generalSavingsInterestPct: parseFloat(genSavingsInterestRate) || 8,
      generalSavingsVatPct: parseFloat(genSavingsVatRate) || 10,
      generalSavingsPayoutMonth: parseInt(genSavingsMonth) || 12,
    });
    setShowGenSavingsSettingsModal(false);
    showToast('সাধারণ সঞ্চয়ের অটো মুনাফা হার আপডেট করা হয়েছে', 'success');
  };

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '১০. প্যাকেজ ও স্কিমসমূহ (Package on Schemes)' : '10. Package & Schemes'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সাধারণ সঞ্চয়, সমবায় সমিতি, এফডিআর, ডিপিএস, ইনভেস্টমেন্ট ও লোন প্যাকেজ ব্যবস্থাপনা'
              : 'Super Admin package creation, customer enrollment & automated dashboard syncing'}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGenSavingsSettingsModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span>সাধারণ সঞ্চয় সেটিংস</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্যাকেজ তৈরি করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* General Savings Banner Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs mb-2">
              <PiggyBank className="w-4 h-4" />
              <span>১. সাধারণ সঞ্চয় পোর্টাল (General Savings)</span>
            </div>
            <h3 className="text-lg font-black">যেকোনো সময় টাকা জমা ও উত্তোলন সুবিধা (ব্যাংকের ন্যায়)</h3>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
              বাৎসরিক অটোমেটিক মুনাফার হার: <strong className="text-white underline">{settings.generalSavingsInterestPct}%</strong> |
              সরকারি ভ্যাট কর্তন: <strong className="text-white underline">{settings.generalSavingsVatPct}%</strong> |
              মুনাফা বন্টনের মাস: <strong className="text-amber-300 font-black">{monthNamesBn[settings.generalSavingsPayoutMonth - 1] || 'ডিসেম্বর'}</strong>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs shrink-0">
            <p className="text-emerald-100">আমার সাধারণ সঞ্চয় ব্যালেন্স:</p>
            <p className="text-xl font-black text-white mt-0.5">
              {formatBDT((customers || [])[0]?.generalSavingsBalance || 0, lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          {lang === 'bn' ? 'সকল প্যাকেজ (All)' : 'All Packages'}
        </button>

        {categoryOptions.map((c) => {
          const isSelected = selectedCategory === c.id || selectedCategory === 'pkg_' + c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {lang === 'bn' ? c.bn : c.en}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'প্যাকেজের নাম দিয়ে খুঁজুন...' : 'Search package schemes...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {categoryOptions.find((c) => c.id === pkg.type)?.bn || (pkg.type || '').replace('_', ' ')}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                    {lang === 'bn' ? pkg.titleBn : pkg.titleEn}
                  </h3>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {pkg.status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {pkg.descriptionBn}
              </p>

              {/* Package Details Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">
                    {pkg.type === 'cooperative_package' ? 'শেয়ারের দাম:' : 'সর্বনিম্ন পরিমাণ / কিস্তি:'}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatBDT(pkg.pricePerShare || pkg.minAmount || 500, lang)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40">
                  <span className="text-[10px] text-emerald-600 block">মুনাফা / সুদের হার:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {pkg.profitRatePct || pkg.interestRatePct || 12}%
                  </span>
                </div>
              </div>

              {/* Specific Package Parameters Summary */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
                <p className="flex justify-between">
                  <span className="text-slate-400">মেয়াদ:</span>
                  <span className="font-bold">{pkg.tenureMonths || 12} মাস</span>
                </p>

                {pkg.type === 'cooperative_package' && (
                  <>
                    <p className="flex justify-between">
                      <span className="text-slate-400">মোট শেয়ার সংখ্যা:</span>
                      <span className="font-bold">{pkg.totalShares || 100} টি</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">পেমেন্ট চক্র:</span>
                      <span className="font-bold text-emerald-600">
                        {pkg.paymentCycle === 'weekly' ? 'সাপ্তাহিক' : 'মাসিক'}
                      </span>
                    </p>
                  </>
                )}

                {pkg.extraFees && pkg.extraFees.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                      অতিরিক্ত উৎসব চাঁদা সমূহ ({pkg.extraFees.length} টি):
                    </span>
                    <div className="space-y-1">
                      {pkg.extraFees.map((ef) => (
                        <div
                          key={ef.id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/50 text-[11px]"
                        >
                          <span className="font-bold text-amber-900 dark:text-amber-200">{ef.titleBn}</span>
                          <div className="text-right">
                            <span className="font-black text-amber-700 dark:text-amber-300 block">৳ {ef.amount}</span>
                            <span className="text-[10px] text-slate-400">তারিখ: {ef.dueDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="flex justify-between">
                  <span className="text-slate-400">বিলম্বিত জরিমানা / ফি:</span>
                  <span className="font-semibold text-rose-500">৳ {pkg.lateFeeAmount || 50}</span>
                </p>

                <p className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">অংশগ্রহণকারী গ্রাহক:</span>
                  <span className="font-extrabold text-emerald-600">{pkg.joinedCustomerCount || 0} জন</span>
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setJoinModalPkg(pkg);
                  setSharesCountInput('1');
                  setLoanRequestedAmount('50000');
                  setLoanRequestedTenure('12');
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{pkg.type === 'loan' ? 'লোনের আবেদন করুন' : 'প্যাকেজে যুক্ত হন'}</span>
              </button>

              {isSuperAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Customer Loan Applications Table (Visible to Super Admin, Branch Managers, Staff) */}
      {canManage && loans.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>গ্রাহকদের লোনের আবেদনসমূহ (Loan Applications)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">গ্রাহক</th>
                  <th className="p-3">আবেদনকৃত পরিমাণ</th>
                  <th className="p-3">মেয়াদ</th>
                  <th className="p-3">মাসিক কিস্তি</th>
                  <th className="p-3">আবেদনের তারিখ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{l.customerNameBn}</td>
                    <td className="p-3 font-black text-emerald-600">{formatBDT(l.requestedAmount, lang)}</td>
                    <td className="p-3">{l.tenureMonths} মাস</td>
                    <td className="p-3 font-semibold">{formatBDT(l.monthlyInstallment, lang)}</td>
                    <td className="p-3 text-slate-500">{l.appliedDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          l.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : l.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {(l.status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {l.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => reviewLoan(l.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[11px] shadow hover:bg-emerald-700 cursor-pointer"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => reviewLoan(l.id, 'rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] hover:bg-rose-700 cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">সম্পন্ন</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* General Savings Settings Modal */}
      {showGenSavingsSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
              <span>সাধারণ সঞ্চয় বাৎসরিক মুনাফা সেটিংস</span>
            </h3>

            <form onSubmit={handleSaveGeneralSavingsSettings} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বাৎসরিক মুনাফার হার (%)
                </label>
                <input
                  type="number"
                  value={genSavingsInterestRate}
                  onChange={(e) => setGenSavingsInterestRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বাৎসরিক সরকারি ভ্যাট কর্তন (%)
                </label>
                <input
                  type="number"
                  value={genSavingsVatRate}
                  onChange={(e) => setGenSavingsVatRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মুনাফা যোগ হওয়ার মাস
                </label>
                <select
                  value={genSavingsMonth}
                  onChange={(e) => setGenSavingsMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  {monthNamesBn.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGenSavingsSettingsModal(false)}
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

      {/* Join Package / Apply Loan Modal */}
      {joinModalPkg && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
              {joinModalPkg.type === 'loan' ? 'লোনের আবেদনপত্র' : 'প্যাকেজে অংশগ্রহণের আবেদন'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              প্যাকেজ: <strong className="text-slate-900 dark:text-white">{joinModalPkg.titleBn}</strong>
            </p>

            <form onSubmit={handleJoinOrApply} className="space-y-3 text-xs">
              {joinModalPkg.type === 'loan' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      কত টাকা লোন চান? (BDT)
                    </label>
                    <input
                      type="number"
                      value={loanRequestedAmount}
                      onChange={(e) => setLoanRequestedAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      কত মেয়াদের লোন চান? (মাস)
                    </label>
                    <input
                      type="number"
                      value={loanRequestedTenure}
                      onChange={(e) => setLoanRequestedTenure(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    শেয়ার সংখ্যা / কপির সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={sharesCountInput}
                    onChange={(e) => setSharesCountInput(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    প্রতিটি শেয়ারের একক দাম: ৳ {joinModalPkg.pricePerShare || joinModalPkg.minAmount || 500} |
                    মোট পেমেন্ট: <strong className="text-emerald-600">৳ {(parseFloat(sharesCountInput) || 1) * (joinModalPkg.pricePerShare || joinModalPkg.minAmount || 500)}</strong>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setJoinModalPkg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  আবেদন নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Package Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingPkg ? 'প্যাকেজ সম্পাদনা' : 'নতুন স্কিম প্যাকেজ তৈরি করুন'}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্যাকেজের টাইপ নির্বাচন করুন
                </label>
                <select
                  value={pkgType}
                  onChange={(e: any) => setPkgType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === 'bn' ? c.bn : c.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্যাকেজের নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিবরণ
                </label>
                <textarea
                  value={descriptionBn}
                  onChange={(e) => setDescriptionBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-16 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মোট শেয়ার সংখ্যা / সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={totalShares}
                    onChange={(e) => setTotalShares(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    প্রতিটি শেয়ারের দাম / কিস্তি (BDT)
                  </label>
                  <input
                    type="number"
                    value={pricePerShare}
                    onChange={(e) => setPricePerShare(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
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

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মুনাফা হার (%)
                  </label>
                  <input
                    type="number"
                    value={profitRatePct}
                    onChange={(e) => setProfitRatePct(e.target.value)}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্ট চক্র
                  </label>
                  <select
                    value={paymentCycle}
                    onChange={(e: any) => setPaymentCycle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="weekly">সাপ্তাহিক</option>
                    <option value="monthly">মাসিক</option>
                    <option value="semi_annual">অর্ধবার্ষিক</option>
                    <option value="annual">বার্ষিক</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিলম্বিত জরিমানা ফি (BDT)
                  </label>
                  <input
                    type="number"
                    value={lateFeeAmount}
                    onChange={(e) => setLateFeeAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-rose-500"
                  />
                </div>
              </div>

              {/* Special Festival Donation Section */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-amber-900 dark:text-amber-300">
                      অতিরিক্ত উৎসব/ধর্মীয় চাঁদা ধার্য (যেমন: ঈদ/পূজা/শবে বরাত):
                    </p>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                      সমবায় প্যাকেজের জন্য এক বা একাধিক অতিরিক্ত বিশেষ চাঁদা ও প্রদেয় তারিখ যুক্ত করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExtraFeesList((prev) => [
                        ...prev,
                        {
                          id: 'ef-' + Date.now(),
                          titleBn: 'নতুন অতিরিক্ত চাঁদা',
                          titleEn: 'New Extra Fee',
                          amount: '200',
                          dueDate: new Date().toISOString().split('T')[0],
                        },
                      ])
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] shadow flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>চাঁদা যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {extraFeesList.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">চাঁদার বিবরণ (নাম)</label>
                        <input
                          type="text"
                          value={item.titleBn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExtraFeesList((prev) =>
                              prev.map((f, i) => (i === index ? { ...f, titleBn: val, titleEn: val } : f))
                            );
                          }}
                          placeholder="e.g. ঈদুল ফিতর বিশেষ চাঁদা"
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">পরিমাণ (BDT)</label>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExtraFeesList((prev) =>
                              prev.map((f, i) => (i === index ? { ...f, amount: val } : f))
                            );
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-amber-600 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">প্রদেয় তারিখ</label>
                        <input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExtraFeesList((prev) =>
                              prev.map((f, i) => (i === index ? { ...f, dueDate: val } : f))
                            );
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setExtraFeesList((prev) => prev.filter((_, i) => i !== index))}
                          className="p-1 rounded bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {extraFeesList.length === 0 && (
                    <p className="text-center text-slate-400 py-2 text-[11px]">
                      কোনো অতিরিক্ত উৎসব চাঁদা সেট করা হয়নি। উপরে кнопকা চেপে নতুন চাঁদা যোগ করুন।
                    </p>
                  )}
                </div>
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
