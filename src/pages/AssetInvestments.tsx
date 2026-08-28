import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Investment, InvestmentType } from '../types';
import { formatBDT } from '../utils/formatters';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  PlusCircle,
  Calculator,
  FileText,
  Download,
  Calendar,
  Percent,
  TrendingUp,
  Coins,
  MapPin,
  Building2,
  X,
} from 'lucide-react';

interface AssetInvestmentsProps {
  activeSubcategory?: string;
}

export const AssetInvestments: React.FC<AssetInvestmentsProps> = ({ activeSubcategory }) => {
  const {
    currentUser,
    investments,
    branches,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    adjustInvestmentProfitLoss,
    showToast,
    lang,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    activeSubcategory || 'all'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);

  // Profit/Loss Entry Modal State
  const [profitModalInv, setProfitModalInv] = useState<Investment | null>(null);
  const [grossProfit, setGrossProfit] = useState('');
  const [vatPercent, setVatPercent] = useState('15');
  const [adjustmentNote, setAdjustmentNote] = useState('নিয়মিত মুনাফা বন্টন ও সমন্বয়');

  // Report Modal State
  const [reportInv, setReportInv] = useState<Investment | null>(null);

  // Form State for Creating/Editing Investments
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [invType, setInvType] = useState<InvestmentType>('fdr');
  const [principalAmount, setPrincipalAmount] = useState('100000');
  const [interestRatePct, setInterestRatePct] = useState('12');
  const [annualGovVatPct, setAnnualGovVatPct] = useState('15');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [profitCycle, setProfitCycle] = useState<'monthly' | 'quarterly' | 'four_monthly' | 'semi_annual' | 'annual'>('monthly');
  const [partnerDetails, setPartnerDetails] = useState('');
  const [branchId, setBranchId] = useState('');

  // Specific Type Details
  const [monthlyInstallment, setMonthlyInstallment] = useState('5000'); // DPS
  const [estimatedProfit, setEstimatedProfit] = useState('15000'); // Interest-free
  const [goldKarat, setGoldKarat] = useState('22K'); // Gold
  const [goldWeight, setGoldWeight] = useState('5 ভরী (৫৮.৩২ গ্রাম)'); // Gold
  const [landArea, setLandArea] = useState('10 শতাংশ'); // Land
  const [landType, setLandType] = useState('বাণিজ্যিক জমি (পৌরসভা)'); // Land
  const [rentType, setRentType] = useState<'mortgage' | 'shop_rent' | 'other'>('shop_rent'); // Shop/Mortgage
  const [rentProfitType, setRentProfitType] = useState<'percentage' | 'fixed'>('fixed'); // Shop/Mortgage
  const [fixedProfitAmount, setFixedProfitAmount] = useState('12000'); // Shop/Mortgage

  if (!currentUser) return null;
  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'branch_manager';

  // Categories list
  const categoryOptions: { id: InvestmentType; bn: string; en: string }[] = [
    { id: 'fdr', bn: '১. এফডিআর এ বিনিয়োগ', en: '1. FDR Investment' },
    { id: 'dps', bn: '২. ডিপিএস এ বিনিয়োগ', en: '2. DPS Investment' },
    { id: 'bank_savings', bn: '৩. ব্যাংক সঞ্চয়ে বিনিয়োগ', en: '3. Bank Savings Inv.' },
    { id: 'business_fixed', bn: '৪. ব্যবসায়ে (নির্দিষ্ট সুদ)', en: '4. Business Fixed Rate' },
    { id: 'business_profit_share', bn: '৫. ব্যবসায়ে (লাভ/ক্ষতি)', en: '5. Business Profit Share' },
    { id: 'gold', bn: '৬. স্বর্ণে বিনিয়োগ', en: '6. Gold Investment' },
    { id: 'land', bn: '৭. জমিতে বিনিয়োগ', en: '7. Land Investment' },
    { id: 'mortgage_shop_rent', bn: '৮. বন্ধক/দোকান ভাড়া', en: '8. Mortgage / Shop Rent' },
  ];

  const safeInvestments = investments || [];
  const scopedList =
    currentUser.role === 'super_admin'
      ? safeInvestments
      : safeInvestments.filter((i) => i.branchId === currentUser.branchId);

  const filteredList = scopedList.filter((i) => {
    const subMatch =
      selectedCategory === 'all' ||
      i.type === selectedCategory ||
      ('inv_' + i.type) === selectedCategory;
    const query = (searchQuery || '').toLowerCase();
    const searchMatch =
      (i.titleBn || '').toLowerCase().includes(query) ||
      (i.titleEn || '').toLowerCase().includes(query);
    return subMatch && searchMatch;
  });

  const calculateAutoMaturity = (start: string, months: number) => {
    const d = new Date(start || Date.now());
    d.setMonth(d.getMonth() + (months || 12));
    return d.toISOString().split('T')[0];
  };

  const calculateNextPayoutDate = (start: string, cycle: string) => {
    const d = new Date(start || Date.now());
    let addMonths = 1;
    if (cycle === 'quarterly') addMonths = 3;
    if (cycle === 'four_monthly') addMonths = 4;
    if (cycle === 'semi_annual') addMonths = 6;
    if (cycle === 'annual') addMonths = 12;

    while (d.getTime() < Date.now()) {
      d.setMonth(d.getMonth() + addMonths);
    }
    return d.toISOString().split('T')[0];
  };

  const handleOpenAdd = () => {
    setEditingInv(null);
    setTitleBn('নতুন এফডিআর সঞ্চয় প্রকল্প');
    setTitleEn('New FDR Investment Scheme');
    setInvType('fdr');
    setPrincipalAmount('200000');
    setInterestRatePct('12');
    setAnnualGovVatPct('15');
    setTenureMonths('12');
    setStartDate(new Date().toISOString().split('T')[0]);
    setProfitCycle('monthly');
    setPartnerDetails('পূবালী ব্যাংক লিমিটেড, অ্যাকাউন্ট #৮৮৯১');
    setBranchId(currentUser.branchId || (branches || [])[0]?.id || 'br-1');

    setMonthlyInstallment('5000');
    setEstimatedProfit('15000');
    setGoldKarat('22K');
    setGoldWeight('5 ভরী (৫৮.৩২ গ্রাম)');
    setLandArea('10 শতাংশ');
    setLandType('বাণিজ্যিক স্থান');
    setRentType('shop_rent');
    setRentProfitType('fixed');
    setFixedProfitAmount('12000');

    setShowModal(true);
  };

  const handleOpenEdit = (inv: Investment) => {
    setEditingInv(inv);
    setTitleBn(inv.titleBn);
    setTitleEn(inv.titleEn);
    setInvType(inv.type);
    setPrincipalAmount(inv.principalAmount.toString());
    setInterestRatePct((inv.interestRatePct || 0).toString());
    setAnnualGovVatPct((inv.annualGovVatPct || 15).toString());
    setTenureMonths((inv.tenureMonths || 12).toString());
    setStartDate(inv.startDate || new Date().toISOString().split('T')[0]);
    setProfitCycle(inv.profitCycle || 'monthly');
    setBranchId(inv.branchId);

    const dt = inv.details || {};
    setPartnerDetails(dt.partnerDetails || '');
    setMonthlyInstallment((dt.monthlyInstallment || 5000).toString());
    setEstimatedProfit((dt.estimatedProfit || inv.estimatedProfit || 15000).toString());
    setGoldKarat(dt.goldKarat || '22K');
    setGoldWeight(dt.goldWeight || '5 ভরী');
    setLandArea(dt.landArea || '10 শতাংশ');
    setLandType(dt.landType || 'বাণিজ্যিক জমি');
    setRentType(dt.rentType || 'shop_rent');
    setRentProfitType(dt.rentProfitType || 'fixed');
    setFixedProfitAmount((dt.fixedProfitAmount || 12000).toString());

    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const pAmt = parseFloat(principalAmount) || 0;
    const rRate = parseFloat(interestRatePct) || 0;
    const vatRate = parseFloat(annualGovVatPct) || 15;
    const dur = parseInt(tenureMonths) || 12;
    const matDate = calculateAutoMaturity(startDate, dur);
    const nextPay = calculateNextPayoutDate(startDate, profitCycle);

    const estProfitCalc = invType === 'business_profit_share'
      ? parseFloat(estimatedProfit) || 0
      : (pAmt * rRate * (dur / 12)) / 100;

    const detailsObj: Record<string, any> = {
      partnerDetails,
      monthlyInstallment: parseFloat(monthlyInstallment) || 0,
      estimatedProfit: parseFloat(estimatedProfit) || 0,
      goldKarat,
      goldWeight,
      landArea,
      landType,
      rentType,
      rentProfitType,
      fixedProfitAmount: parseFloat(fixedProfitAmount) || 0,
    };

    if (editingInv) {
      updateInvestment({
        ...editingInv,
        titleBn,
        titleEn,
        type: invType,
        principalAmount: pAmt,
        interestRatePct: rRate,
        annualGovVatPct: vatRate,
        tenureMonths: dur,
        startDate,
        maturityDate: matDate,
        profitCycle,
        nextPayoutDate: nextPay,
        estimatedProfit: estProfitCalc,
        branchId,
        details: detailsObj,
      });
    } else {
      addInvestment({
        titleBn,
        titleEn,
        type: invType,
        institutionId: currentUser.institutionId || 'inst-1',
        branchId,
        principalAmount: pAmt,
        startDate,
        tenureMonths: dur,
        maturityDate: matDate,
        profitCycle,
        interestRatePct: rRate,
        annualGovVatPct: vatRate,
        estimatedProfit: estProfitCalc,
        netProfitTotal: estProfitCalc * (1 - vatRate / 100),
        nextPayoutDate: nextPay,
        details: detailsObj,
      });
    }
    setShowModal(false);
  };

  const handleApplyProfitLoss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profitModalInv || !grossProfit) return;
    const gross = parseFloat(grossProfit);
    const vat = parseFloat(vatPercent) || 0;

    if (isNaN(gross)) return;

    let net = gross;
    if (gross > 0) {
      const vatAmount = (gross * vat) / 100;
      net = gross - vatAmount;
    }

    adjustInvestmentProfitLoss(profitModalInv.id, Math.round(net), adjustmentNote || 'Profit/Loss Entry');

    setProfitModalInv(null);
    setGrossProfit('');
  };

  const handleDownloadReport = (inv: Investment) => {
    showToast(lang === 'bn' ? `${inv.titleBn} - স্টেটমেন্ট ও রিপোর্ট ডাউনলোড করা হয়েছে` : `Report Downloaded for ${inv.titleEn}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৮. সম্পদ ও বিনিয়োগ ব্যবস্থাপনা (Asset & Investment)' : '8. Asset & Investment Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'এফডিআর, ডিপিএস, ব্যাংক সঞ্চয়, স্বর্ণ, জমি ও ব্যবসায়িক বিনিয়োগ অটো ক্যালকুলেটরসহ'
              : '8 distinct investment subcategories with auto maturity, govt VAT deduction & profit/loss entries'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন বিনিয়োগ যুক্ত করুন' : 'Add New Investment'}</span>
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          {lang === 'bn' ? 'সকল বিনিয়োগ (All)' : 'All Investments'}
        </button>

        {categoryOptions.map((c) => {
          const isSelected = selectedCategory === c.id || selectedCategory === 'inv_' + c.id;
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
            placeholder={lang === 'bn' ? 'প্রকল্পের নাম দিয়ে খুঁজুন...' : 'Search investment projects...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((inv) => {
          const dt = inv.details || {};
          return (
            <div
              key={inv.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      {categoryOptions.find((c) => c.id === inv.type)?.bn || (inv.type || '').replace('_', ' ')}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                      {lang === 'bn' ? inv.titleBn : inv.titleEn}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {(inv.status || 'active').toUpperCase()}
                  </span>
                </div>

                {/* Grid metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">
                      {inv.type === 'gold' ? 'স্বর্ণের মূল্য (ক্রয়):' : inv.type === 'land' ? 'জমির মূল্য:' : 'মূল বিনিয়োগ:'}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatBDT(inv.principalAmount, lang)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40">
                    <span className="text-[10px] text-emerald-600 block">
                      {inv.type === 'business_profit_share' || inv.type === 'gold' || inv.type === 'land'
                        ? 'ভ্যাট হার (%):'
                        : 'মুনাফা হার (%):'}
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {inv.type === 'business_profit_share' || inv.type === 'gold' || inv.type === 'land'
                        ? `${inv.annualGovVatPct || 15}% ভ্যাট`
                        : `${inv.interestRatePct}%`}
                    </span>
                  </div>
                </div>

                {/* Subcategory Details */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs border border-slate-100 dark:border-slate-800">
                  {inv.type === 'gold' && (
                    <div className="space-y-1">
                      <p className="flex justify-between">
                        <span className="text-slate-400">স্বর্ণের ক্যারেট:</span>
                        <span className="font-bold text-amber-600">{dt.goldKarat || '22K'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">স্বর্ণের পরিমাণ:</span>
                        <span className="font-bold">{dt.goldWeight || '5 ভরী'}</span>
                      </p>
                    </div>
                  )}

                  {inv.type === 'land' && (
                    <div className="space-y-1">
                      <p className="flex justify-between">
                        <span className="text-slate-400">জমির পরিমাণ:</span>
                        <span className="font-bold text-emerald-600">{dt.landArea || '10 শতাংশ'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">জমির ধরন:</span>
                        <span className="font-bold">{dt.landType || 'বাণিজ্যিক জমি'}</span>
                      </p>
                    </div>
                  )}

                  {inv.type === 'mortgage_shop_rent' && (
                    <div className="space-y-1">
                      <p className="flex justify-between">
                        <span className="text-slate-400">ধরনের নাম:</span>
                        <span className="font-bold">{dt.rentType === 'mortgage' ? 'বন্ধক' : 'দোকান ভাড়া'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">মুনাফা ধরন:</span>
                        <span className="font-bold">
                          {dt.rentProfitType === 'fixed' ? `নির্দিষ্ট ৳ ${dt.fixedProfitAmount}` : `${inv.interestRatePct}%`}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Dates & Auto Next Profit Calculation */}
                  <div className="pt-1 space-y-1 text-[11px] border-t border-slate-200/60 dark:border-slate-700/60">
                    <p className="flex justify-between">
                      <span className="text-slate-400">চালুর তারিখ:</span>
                      <span className="font-medium">{inv.startDate}</span>
                    </p>

                    {inv.type !== 'business_profit_share' && inv.type !== 'gold' && inv.type !== 'land' && (
                      <>
                        <p className="flex justify-between">
                          <span className="text-slate-400">মেয়াদ উত্তীর্ণের তারিখ:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{inv.maturityDate}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">পরবর্তী মুনাফা যোগের তারিখ:</span>
                          <span className="font-extrabold text-emerald-600">{inv.nextPayoutDate}</span>
                        </p>
                      </>
                    )}

                    <p className="flex justify-between pt-1">
                      <span className="text-slate-400">অর্জিত নিট লাভ/ক্ষতি:</span>
                      <span className="font-black text-emerald-600">{formatBDT(inv.accumulatedProfit, lang)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setReportInv(inv)}
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="রিপোর্ট দেখুন"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>রিপোর্ট</span>
                  </button>

                  <button
                    onClick={() => handleDownloadReport(inv)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs cursor-pointer"
                    title="ডাউনলোড"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setProfitModalInv(inv);
                        setGrossProfit('10000');
                        setVatPercent((inv.annualGovVatPct || 15).toString());
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>লাভ/ক্ষতি যোগ/বিয়োগ</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(inv)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteInvestment(inv.id)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report View Modal */}
      {reportInv && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>বিনিয়োগ রিপোর্ট ও অডিট বিবরণী</span>
              </h3>
              <button
                onClick={() => setReportInv(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <p><strong className="text-slate-900 dark:text-white">{reportInv.titleBn}</strong> ({reportInv.titleEn})</p>
                <p className="text-slate-500">আইডি: {reportInv.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">মূলধন বিনিয়োগ:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{formatBDT(reportInv.principalAmount, lang)}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">মোট নিট অর্জিত লাভ:</span>
                  <span className="font-bold text-sm text-emerald-600">{formatBDT(reportInv.accumulatedProfit, lang)}</span>
                </div>
              </div>

              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 pt-2 border-t border-slate-100 dark:border-slate-800">
                ম্যানুয়াল লাভ/ক্ষতির হিস্ট্রি ও এডজাস্টমেন্টস:
              </h4>

              {reportInv.manualAdjustments && reportInv.manualAdjustments.length > 0 ? (
                <div className="space-y-1.5">
                  {reportInv.manualAdjustments.map((adj) => (
                    <div key={adj.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{adj.reason}</p>
                        <p className="text-[10px] text-slate-400">{adj.date} • দ্বারা: {adj.byUser}</p>
                      </div>
                      <span className={`font-black text-sm ${adj.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {adj.amount >= 0 ? '+' : ''} {formatBDT(adj.amount, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">এখনও কোনো ম্যানুয়াল এডজাস্টমেন্ট হিস্ট্রি নেই।</p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDownloadReport(reportInv)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>পিডিএফ রিপোর্ট ডাউনলোড</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profit / Loss Entry Modal */}
      {profitModalInv && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>ম্যানুয়াল লাভ/ক্ষতি যোগ ও সরকারি ভ্যাট কর্তন</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              প্রকল্প: <strong className="text-slate-900 dark:text-white">{profitModalInv.titleBn}</strong>
            </p>

            <form onSubmit={handleApplyProfitLoss} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মোট লাভ বা ক্ষতি (BDT) <span className="text-slate-400 font-normal">(ক্ষতির জন্য মাইনাস (-) লিখুন)</span>
                </label>
                <input
                  type="number"
                  value={grossProfit}
                  onChange={(e) => setGrossProfit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সরকারি ভ্যাট কর্তন (%)
                </label>
                <input
                  type="number"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  এডজাস্টমেন্টের বিবরণ / নোট
                </label>
                <input
                  type="text"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              {grossProfit && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1 text-xs border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>গ্রস পরিমাণ:</span>
                    <span className="font-bold">{formatBDT(parseFloat(grossProfit) || 0, lang)}</span>
                  </div>
                  {parseFloat(grossProfit) > 0 && (
                    <div className="flex justify-between text-rose-500 font-semibold">
                      <span>ভ্যাট কর্তন ({vatPercent}%):</span>
                      <span>- {formatBDT(((parseFloat(grossProfit) || 0) * (parseFloat(vatPercent) || 0)) / 100, lang)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-600 font-black text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>ড্যাশবোর্ডে যোগ হবে (Net):</span>
                    <span>
                      {formatBDT(
                        parseFloat(grossProfit) > 0
                          ? (parseFloat(grossProfit) || 0) - ((parseFloat(grossProfit) || 0) * (parseFloat(vatPercent) || 0)) / 100
                          : parseFloat(grossProfit) || 0,
                        lang
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setProfitModalInv(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Investment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingInv ? 'বিনিয়োগ প্রকল্প সম্পাদনা' : 'নতুন বিনিয়োগ প্রকল্প যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিনিয়োগের ক্যাটাগরি নির্বাচন করুন
                </label>
                <select
                  value={invType}
                  onChange={(e: any) => setInvType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold"
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
                  প্রকল্পের শিরোনাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {invType === 'gold' ? 'স্বর্ণের ক্রয়মূল্য (BDT)' : invType === 'land' ? 'জমির মূল্য (BDT)' : 'মূলধন পরিমাণ (BDT)'}
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
                    চালুর তারিখ
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

              {/* Dynamic Subcategory Specific Fields */}
              {invType === 'gold' && (
                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 space-y-2 border border-amber-200 dark:border-amber-800">
                  <p className="font-bold text-amber-800 dark:text-amber-300">স্বর্ণের বিস্তারিত তথ্য:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">ক্যারেট</label>
                      <select
                        value={goldKarat}
                        onChange={(e) => setGoldKarat(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="24K">24K (বিশুদ্ধ)</option>
                        <option value="22K">22K (মানসম্পন্ন)</option>
                        <option value="21K">21K</option>
                        <option value="18K">18K</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">পরিমাণ (ভরী/গ্রাম)</label>
                      <input
                        type="text"
                        value={goldWeight}
                        onChange={(e) => setGoldWeight(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {invType === 'land' && (
                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2 border border-emerald-200 dark:border-emerald-800">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">জমির বিস্তারিত তথ্য:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">জমির পরিমাণ</label>
                      <input
                        type="text"
                        value={landArea}
                        onChange={(e) => setLandArea(e.target.value)}
                        placeholder="e.g. 10 শতাংশ"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">জমির ধরন</label>
                      <input
                        type="text"
                        value={landType}
                        onChange={(e) => setLandType(e.target.value)}
                        placeholder="e.g. বাণিজ্যিক স্থান"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {invType !== 'business_profit_share' && invType !== 'gold' && invType !== 'land' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      মুনাফার হার (%)
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
                      মুনাফা চক্র
                    </label>
                    <select
                      value={profitCycle}
                      onChange={(e: any) => setProfitCycle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="monthly">মাসিক</option>
                      <option value="quarterly">ত্রয় মাসিক</option>
                      <option value="four_monthly">চার মাসিক</option>
                      <option value="semi_annual">অর্ধ বার্ষিক</option>
                      <option value="annual">বার্ষিক</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
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
                    সরকারি ভ্যাট (%)
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

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পার্টনার বা ব্যাংক বিবরণী
                </label>
                <input
                  type="text"
                  value={partnerDetails}
                  onChange={(e) => setPartnerDetails(e.target.value)}
                  placeholder="e.g. সোনালী ব্যাংক হিসাব নম্বর ৯৮৭২"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Calculated Auto Summary */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1 text-[11px]">
                <p className="flex justify-between font-bold">
                  <span>অটো মেয়াদী তারিখ (Maturity Date):</span>
                  <span className="text-emerald-700 dark:text-emerald-300">{calculateAutoMaturity(startDate, parseInt(tenureMonths) || 12)}</span>
                </p>
                <p className="flex justify-between">
                  <span>পরবর্তী অটো মুনাফা তারিখ:</span>
                  <span>{calculateNextPayoutDate(startDate, profitCycle)}</span>
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
