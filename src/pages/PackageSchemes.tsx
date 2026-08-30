import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SchemePackage, PackageType, ExtraSubscriptionFee, GeneralSavingsRequest } from '../types';
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
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Eye,
  ShieldCheck,
  Building,
  Check,
  ChevronRight,
} from 'lucide-react';

interface PackageSchemesProps {
  activeSubcategory?: string;
}

export const PackageSchemes: React.FC<PackageSchemesProps> = ({ activeSubcategory }) => {
  const {
    currentUser,
    packages,
    joinedPackages,
    savingsRequests,
    loans,
    customers,
    paymentChannels,
    addPackage,
    updatePackage,
    deletePackage,
    joinPackage,
    reviewJoinedPackage,
    applyForLoan,
    reviewLoan,
    submitSavingsDepositRequest,
    submitSavingsWithdrawalRequest,
    reviewSavingsRequest,
    submitAdjustmentRequest,
    adjustCustomerBalance,
    settings,
    updateSettings,
    showToast,
    lang,
  } = useApp();

  // Navigation tab for Customer: 'available' | 'joined' | 'general_savings'
  // Navigation tab for Admin: 'available' | 'requests' | 'general_savings'
  const [activeTab, setActiveTab] = useState<'available' | 'joined' | 'general_savings' | 'requests'>('available');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<SchemePackage | null>(null);

  // Enrolled Schemes category filter for Customer
  const [enrolledCategoryFilter, setEnrolledCategoryFilter] = useState<'all' | 'cooperative_package' | 'dps' | 'fdr' | 'investment' | 'loan'>('all');

  // Joining / Application Modal
  const [joinModalPkg, setJoinModalPkg] = useState<SchemePackage | null>(null);
  const [sharesCountInput, setSharesCountInput] = useState('1');
  const [selectedPaymentChannelId, setSelectedPaymentChannelId] = useState('');
  const [senderMobile, setSenderMobile] = useState('');
  const [joinTrxId, setJoinTrxId] = useState('');
  const [joinNotes, setJoinNotes] = useState('');

  // Loan Application Fields
  const [loanRequestedAmount, setLoanRequestedAmount] = useState('50000');
  const [loanRequestedTenure, setLoanRequestedTenure] = useState('12');

  // General Savings Deposit Modal (Customer self-request)
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositChannelId, setDepositChannelId] = useState('');
  const [depositSenderMobile, setDepositSenderMobile] = useState('');
  const [depositTrxId, setDepositTrxId] = useState('');
  const [depositNotes, setDepositNotes] = useState('');

  // General Savings Withdrawal Modal (Customer self-request)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalPayoutMethod, setWithdrawalPayoutMethod] = useState<'bKash' | 'Nagad' | 'Bank' | 'Cash'>('bKash');
  const [withdrawalPayoutAccount, setWithdrawalPayoutAccount] = useState('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');

  // Admin Direct Savings Entry Modal (Admin/Staff entry for any customer)
  const [showAdminEntryModal, setShowAdminEntryModal] = useState(false);
  const [adminEntryType, setAdminEntryType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [adminEntryCustomerId, setAdminEntryCustomerId] = useState('');
  const [adminEntryAmount, setAdminEntryAmount] = useState('');
  const [adminEntryChannelId, setAdminEntryChannelId] = useState('cash');
  const [adminEntryNotes, setAdminEntryNotes] = useState('');
  const [adminCustomerSearch, setAdminCustomerSearch] = useState('');

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
  const isCustomer = currentUser.role === 'customer';
  const canManage = isSuperAdmin || currentUser.role === 'branch_manager' || currentUser.role === 'branch_staff';

  // Get current logged-in customer profile (ONLY if customer role)
  const currentCustomer = isCustomer
    ? (customers || []).find((c) => c.userId === currentUser.id || c.id === currentUser.id || c.mobile === currentUser.mobile) || null
    : null;

  // Normalize and respond to activeSubcategory navigation from Sidebar
  useEffect(() => {
    if (!activeSubcategory) return;
    const sub = activeSubcategory.toLowerCase();

    if (sub === 'general' || sub === 'pkg_general' || sub === 'general_savings') {
      setActiveTab('general_savings');
      setSelectedCategory('general_savings');
    } else if (sub === 'joined' || sub === 'pkg_joined') {
      setActiveTab('joined');
      setSelectedCategory('all');
    } else if (sub === 'available' || sub === 'pkg_available') {
      setActiveTab('available');
      setSelectedCategory('all');
    } else if (sub === 'requests' || sub === 'pkg_requests') {
      setActiveTab('requests');
      setSelectedCategory('all');
    } else if (sub === 'coop' || sub === 'pkg_coop' || sub === 'cooperative_package') {
      setSelectedCategory('cooperative_package');
      setActiveTab('available');
    } else if (sub === 'fdr' || sub === 'pkg_fdr') {
      setSelectedCategory('fdr');
      setActiveTab('available');
    } else if (sub === 'dps' || sub === 'pkg_dps') {
      setSelectedCategory('dps');
      setActiveTab('available');
    } else if (sub === 'inv' || sub === 'pkg_inv' || sub === 'investment') {
      setSelectedCategory('investment');
      setActiveTab('available');
    } else if (sub === 'loan' || sub === 'pkg_loan') {
      setSelectedCategory('loan');
      setActiveTab('available');
    }
  }, [activeSubcategory]);

  const categoryOptions: { id: PackageType; bn: string; en: string; icon: any }[] = [
    { id: 'general_savings', bn: '১. সাধারণ সঞ্চয়', en: '1. General Savings', icon: PiggyBank },
    { id: 'cooperative_package', bn: '২. সমবায় সমিতি প্যাকেজ', en: '2. Coop Package', icon: Gift },
    { id: 'fdr', bn: '৩. এফডিআর প্যাকেজ', en: '3. FDR Package', icon: Landmark },
    { id: 'dps', bn: '৪. ডিপিএস প্যাকেজ', en: '4. DPS Package', icon: Layers },
    { id: 'investment', bn: '৫. ইনভেস্টমেন্ট প্যাকেজ', en: '5. Investment Package', icon: Sparkles },
    { id: 'loan', bn: '৬. লোন প্যাকেজ (Loan)', en: '6. Loan Package', icon: CreditCard },
  ];

  // Filtering packages
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

  // Customer Enrolled Packages & Loans
  const myJoinedPackages = (joinedPackages || []).filter((j) => {
    if (isCustomer) {
      return j.customerId === currentCustomer?.id || j.customerId === currentUser.id;
    }
    return true;
  });

  const myCustomerLoans = (loans || []).filter((l) => {
    if (isCustomer) {
      return l.customerId === currentCustomer?.id || l.customerId === currentUser.id;
    }
    return true;
  });

  // Filtered enrolled items for customer based on enrolledCategoryFilter
  const filteredMyJoinedPackages = myJoinedPackages.filter((jp) => {
    if (enrolledCategoryFilter === 'all') return true;
    const pkg = packages.find((p) => p.id === jp.packageId);
    return pkg && (pkg.type === enrolledCategoryFilter || ('pkg_' + pkg.type) === enrolledCategoryFilter);
  });

  // Institutional Savings Pool Metrics for Admin / Manager
  const totalSavingsPool = (customers || []).reduce((acc, c) => acc + (c.generalSavingsBalance || 0), 0);
  const totalSavingsDepositors = (customers || []).filter((c) => (c.generalSavingsBalance || 0) > 0).length;
  const avgSavingsBalance = totalSavingsDepositors > 0 ? Math.round(totalSavingsPool / totalSavingsDepositors) : 0;
  const totalGeneralDeposits = (customers || []).reduce((acc, c) => acc + (c.totalDeposit || 0), 0);
  const totalGeneralWithdrawals = (customers || []).reduce((acc, c) => acc + (c.totalWithdrawal || 0), 0);

  // Filtered customer list for admin savings directory
  const filteredSavingsCustomers = (customers || []).filter((c) => {
    const q = adminCustomerSearch.toLowerCase();
    return (
      (c.nameBn || '').toLowerCase().includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q) ||
      (c.accountNo || '').toLowerCase().includes(q) ||
      (c.mobile || '').toLowerCase().includes(q)
    );
  });

  // Customer General Savings Requests
  const mySavingsRequests = (savingsRequests || []).filter((r) => {
    if (isCustomer) {
      return r.customerId === currentCustomer?.id || r.customerId === currentUser.id;
    }
    return true;
  });

  // Pending items for admin/manager review
  const pendingJoinedPackages = (joinedPackages || []).filter((j) => j.status === 'pending');
  const pendingSavingsRequests = (savingsRequests || []).filter((r) => r.status === 'pending');
  const pendingLoanApplications = (loans || []).filter((l) => l.status === 'pending');
  const totalPendingReviews =
    pendingJoinedPackages.length + pendingSavingsRequests.length + pendingLoanApplications.length;

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setTitleBn('নতুন ডিপিএস সঞ্চয় প্যাকেজ');
    setTitleEn('New DPS Savings Package');
    setPkgType('dps');
    setDescriptionBn('গ্রাহকদের জন্য বিশেষ সঞ্চয় স্কিম। নির্দিষ্ট কিস্তির মাধ্যমে নিশ্চিত ও নিরাপদ মুনাফা।');
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

  const handleOpenJoinModal = (pkg: SchemePackage) => {
    setJoinModalPkg(pkg);
    setSharesCountInput('1');
    setJoinTrxId('');
    setJoinNotes('');
    setSelectedPaymentChannelId(paymentChannels[0]?.id || '');
    setSenderMobile(currentUser?.mobile || '');
    setLoanRequestedAmount('50000');
    setLoanRequestedTenure('12');
  };

  const handleConfirmJoinOrApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalPkg) return;

    const channelObj = paymentChannels.find((p) => p.id === selectedPaymentChannelId);
    const channelName = channelObj ? `${channelObj.providerNameBn} (${channelObj.accountNumber})` : 'সরাসরি জমা';

    if (joinModalPkg.type === 'loan') {
      const amt = parseFloat(loanRequestedAmount) || 50000;
      const tenure = parseInt(loanRequestedTenure) || 12;
      applyForLoan(currentCustomer?.id || currentUser.id, joinModalPkg.id, amt, tenure);
    } else {
      const shares = parseInt(sharesCountInput) || 1;
      joinPackage(currentCustomer?.id || currentUser.id, joinModalPkg.id, shares, {
        paymentMethod: channelName,
        paymentChannelId: selectedPaymentChannelId,
        trxId: joinTrxId,
        notes: joinNotes ? `${senderMobile ? `মোবাইল: ${senderMobile}, ` : ''}${joinNotes}` : senderMobile ? `প্রেরক মোবাইল: ${senderMobile}` : '',
      });
    }

    setJoinModalPkg(null);
  };

  // Submit General Savings Deposit Request
  const handleConfirmSavingsDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      showToast(lang === 'bn' ? 'সঠিক জমার পরিমাণ লিখুন' : 'Enter a valid deposit amount', 'error');
      return;
    }

    const channelObj = paymentChannels.find((p) => p.id === depositChannelId);

    submitSavingsDepositRequest({
      customerId: currentCustomer?.id || currentUser.id,
      customerNameBn: currentCustomer?.nameBn || currentUser.nameBn || 'গ্রাহক',
      customerNameEn: currentCustomer?.nameEn || currentUser.nameEn || 'Customer',
      customerMobile: currentCustomer?.mobile || currentUser.mobile || depositSenderMobile,
      branchId: currentCustomer?.branchId || currentUser.branchId || 'br-1',
      amount: amt,
      paymentChannelId: depositChannelId,
      channelNameBn: channelObj ? `${channelObj.providerNameBn} (${channelObj.accountTypeBn})` : 'অফিস ক্যাশ কাউন্টার',
      senderMobile: depositSenderMobile,
      transactionId: depositTrxId,
      notes: depositNotes,
    });

    setShowDepositModal(false);
    setDepositAmount('');
    setDepositSenderMobile('');
    setDepositTrxId('');
    setDepositNotes('');
  };

  // Submit General Savings Withdrawal Request
  const handleConfirmSavingsWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawalAmount);
    const curBal = currentCustomer?.generalSavingsBalance || 0;

    if (!amt || amt <= 0) {
      showToast(lang === 'bn' ? 'সঠিক উত্তোলনের পরিমাণ লিখুন' : 'Enter a valid withdrawal amount', 'error');
      return;
    }
    if (amt > curBal) {
      showToast(
        lang === 'bn'
          ? `আপনার ব্যালেন্স অপেক্ষা বেশি উত্তোলন করতে পারবেন না (সর্বোচ্চ: ৳ ${curBal})`
          : `Withdrawal amount cannot exceed available balance (Max: ৳ ${curBal})`,
        'error'
      );
      return;
    }

    submitSavingsWithdrawalRequest({
      customerId: currentCustomer?.id || currentUser.id,
      customerNameBn: currentCustomer?.nameBn || currentUser.nameBn || 'গ্রাহক',
      customerNameEn: currentCustomer?.nameEn || currentUser.nameEn || 'Customer',
      customerMobile: currentCustomer?.mobile || currentUser.mobile || '',
      branchId: currentCustomer?.branchId || currentUser.branchId || 'br-1',
      amount: amt,
      payoutMethod: withdrawalPayoutMethod,
      payoutAccount: withdrawalPayoutAccount,
      notes: withdrawalNotes,
    });

    setShowWithdrawalModal(false);
    setWithdrawalAmount('');
    setWithdrawalPayoutAccount('');
    setWithdrawalNotes('');
  };

  const handleSaveGeneralSavingsSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      generalSavingsInterestPct: parseFloat(genSavingsInterestRate) || 8,
      generalSavingsVatPct: parseFloat(genSavingsVatRate) || 10,
      generalSavingsPayoutMonth: parseInt(genSavingsMonth) || 12,
    });
    setShowGenSavingsSettingsModal(false);
    showToast(lang === 'bn' ? 'সাধারণ সঞ্চয়ের অটো মুনাফা হার সংরক্ষিত হয়েছে' : 'Savings settings saved', 'success');
  };

  // Direct savings deposit/withdrawal entry by Admin/Staff
  const handleAdminSavingsEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(adminEntryAmount);
    if (!amt || amt <= 0) {
      showToast(lang === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Enter a valid amount', 'error');
      return;
    }
    if (!adminEntryCustomerId) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে গ্রাহক নির্বাচন করুন' : 'Select a customer', 'error');
      return;
    }

    const targetCustomer = (customers || []).find((c) => c.id === adminEntryCustomerId);
    if (adminEntryType === 'withdrawal' && (targetCustomer?.generalSavingsBalance || 0) < amt) {
      showToast(
        lang === 'bn'
          ? `গ্রাহকের সঞ্চয় ব্যালেন্স অপেক্ষা বেশি উত্তোলন সম্ভব নয় (সর্বোচ্চ ব্যালেন্স: ৳ ${targetCustomer?.generalSavingsBalance || 0})`
          : 'Insufficient customer savings balance',
        'error'
      );
      return;
    }

    adjustCustomerBalance(
      adminEntryCustomerId,
      amt,
      adminEntryType === 'deposit' ? 'add' : 'deduct',
      adminEntryNotes || (adminEntryType === 'deposit' ? 'অফিস ক্যাশ কাউন্টারে সাধারণ সঞ্চয় জমা' : 'অফিস ক্যাশ কাউন্টার থেকে সাধারণ সঞ্চয় উত্তোলন')
    );

    setShowAdminEntryModal(false);
    setAdminEntryAmount('');
    setAdminEntryNotes('');
  };

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];

  const enrolledFilterTabs = [
    {
      id: 'all' as const,
      bn: 'সকল স্কিম ও লোন',
      en: 'All Schemes & Loans',
      count: myJoinedPackages.length + myCustomerLoans.length,
      icon: Layers,
    },
    {
      id: 'cooperative_package' as const,
      bn: 'সমবায় সমিতি',
      en: 'Cooperative',
      count: myJoinedPackages.filter((j) => packages.find((p) => p.id === j.packageId)?.type === 'cooperative_package').length,
      icon: Gift,
    },
    {
      id: 'dps' as const,
      bn: 'ডিপিএস প্যাকেজ',
      en: 'DPS Package',
      count: myJoinedPackages.filter((j) => packages.find((p) => p.id === j.packageId)?.type === 'dps').length,
      icon: Layers,
    },
    {
      id: 'fdr' as const,
      bn: 'এফডিআর প্যাকেজ',
      en: 'FDR Package',
      count: myJoinedPackages.filter((j) => packages.find((p) => p.id === j.packageId)?.type === 'fdr').length,
      icon: Landmark,
    },
    {
      id: 'investment' as const,
      bn: 'ইনভেস্টমেন্ট প্যাকেজ',
      en: 'Investment',
      count: myJoinedPackages.filter((j) => packages.find((p) => p.id === j.packageId)?.type === 'investment').length,
      icon: Sparkles,
    },
    {
      id: 'loan' as const,
      bn: 'লোন স্কিম ও আবেদন',
      en: 'Loans',
      count: myCustomerLoans.length,
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '১০. প্যাকেজ ও স্কিমসমূহ (Package & Schemes)' : '10. Package & Schemes'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'সাধারণ সঞ্চয়, সমবায় সমিতি, এফডিআর, ডিপিএস, ইনভেস্টমেন্ট ও লোন প্যাকেজ ব্যবস্থাপনা ও আবেদন পোর্টাল'
              : 'General savings, Cooperative, FDR, DPS, Investment and Loan package management'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => setShowGenSavingsSettingsModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span>সাধারণ সঞ্চয় সেটিংস</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্যাকেজ তৈরি করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: GENERAL SAVINGS DEDICATED PORTAL (Deposit & Withdrawal Requests) */}
      {activeTab === 'general_savings' && (
        <div className="space-y-6">
          {canManage ? (
            /* ADMIN / MANAGER INSTITUTIONAL SAVINGS OVERVIEW & MANAGEMENT */
            <>
              {/* General Savings Institutional Main Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs">
                      <PiggyBank className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'প্রাতিষ্ঠানিক সাধারণ সঞ্চয় ভান্ডার' : 'Institutional General Savings Pool'}</span>
                    </div>
                    <h3 className="text-xl font-black">
                      {lang === 'bn' ? 'সকল গ্রাহকের মোট সাধারণ সঞ্চয় ও লেনদেন ব্যবস্থাপনা' : 'Customer General Savings & Ledger Management'}
                    </h3>
                    <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                      বাৎসরিক অটোমেটিক মুনাফার হার: <strong className="text-white underline">{settings.generalSavingsInterestPct}%</strong> |
                      সরকারি ভ্যাট কর্তন: <strong className="text-white underline">{settings.generalSavingsVatPct}%</strong> |
                      মুনাফা বন্টনের মাস: <strong className="text-amber-300 font-black">{monthNamesBn[settings.generalSavingsPayoutMonth - 1] || 'ডিসেম্বর'}</strong>
                    </p>
                  </div>

                  {/* Institutional Total Pool Box */}
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs shrink-0 flex flex-col justify-between min-w-[260px]">
                    <div>
                      <p className="text-emerald-100 font-semibold">{lang === 'bn' ? 'সকল গ্রাহকের মোট সঞ্চয় ফান্ড:' : 'Total Savings Fund Pool:'}</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono">
                        {formatBDT(totalSavingsPool, lang)}
                      </p>
                      <p className="text-[11px] text-emerald-200 mt-0.5">
                        সঞ্চয়কারী গ্রাহক: <span className="font-bold text-white">{totalSavingsDepositors} জন</span>
                      </p>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          setAdminEntryType('deposit');
                          setAdminEntryCustomerId(customers[0]?.id || '');
                          setAdminEntryAmount('');
                          setAdminEntryNotes('');
                          setShowAdminEntryModal(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? '+ সঞ্চয় জমা' : '+ Deposit'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setAdminEntryType('withdrawal');
                          setAdminEntryCustomerId(customers[0]?.id || '');
                          setAdminEntryAmount('');
                          setAdminEntryNotes('');
                          setShowAdminEntryModal(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 text-white font-extrabold text-xs border border-emerald-400/40 shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'bn' ? '- উত্তোলন' : '- Withdraw'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics for Admin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{lang === 'bn' ? 'সক্রিয় সঞ্চয়কারী গ্রাহক' : 'Active Depositors'}</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {totalSavingsDepositors} {lang === 'bn' ? 'জন' : 'Users'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{lang === 'bn' ? 'সর্বমোট সাধারণ সঞ্চয় জমা' : 'Total Deposits Sum'}</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {formatBDT(totalGeneralDeposits, lang)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{lang === 'bn' ? 'বাৎসরিক প্রদেয় মুনাফা (অনুমান)' : 'Projected Annual Profit'}</p>
                    <p className="text-base font-black text-amber-600 dark:text-amber-400">
                      {formatBDT((totalSavingsPool * (settings.generalSavingsInterestPct || 8)) / 100, lang)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Savings Balance Directory Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-emerald-600" />
                      <span>{lang === 'bn' ? 'গ্রাহকদের সাধারণ সঞ্চয় হিসাব ও ব্যালেন্স খতিয়ান' : 'Customer General Savings Ledger'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      প্রতিটি গ্রাহকের পৃথক সঞ্চয় হিসাব ব্যালেন্স ও সরাসরি জমা/উত্তোলন এন্ট্রি
                    </p>
                  </div>

                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={adminCustomerSearch}
                      onChange={(e) => setAdminCustomerSearch(e.target.value)}
                      placeholder={lang === 'bn' ? 'গ্রাহকের নাম বা হিসাব নং...' : 'Search customer...'}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="p-3">হিসাব নং</th>
                        <th className="p-3">গ্রাহকের নাম ও মোবাইল</th>
                        <th className="p-3">ব্রাঞ্চ</th>
                        <th className="p-3 text-right">সাধারণ সঞ্চয় ব্যালেন্স</th>
                        <th className="p-3 text-right">মোট জমা</th>
                        <th className="p-3 text-right">মোট উত্তোলন</th>
                        <th className="p-3 text-right">দ্রুত এন্ট্রি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredSavingsCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                            কোনো গ্রাহকের তথ্য পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        filteredSavingsCustomers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {cust.accountNo || cust.id}
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900 dark:text-white">{cust.nameBn || cust.nameEn}</p>
                              <p className="text-[10px] text-slate-400">{cust.mobile}</p>
                            </td>
                            <td className="p-3 text-slate-500">{cust.branchId || 'প্রধান শাখা'}</td>
                            <td className="p-3 text-right font-black text-sm text-emerald-600">
                              {formatBDT(cust.generalSavingsBalance || 0, lang)}
                            </td>
                            <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                              {formatBDT(cust.totalDeposit || 0, lang)}
                            </td>
                            <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                              {formatBDT(cust.totalWithdrawal || 0, lang)}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setAdminEntryType('deposit');
                                    setAdminEntryCustomerId(cust.id);
                                    setAdminEntryAmount('');
                                    setAdminEntryNotes('');
                                    setShowAdminEntryModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  title="সরাসরি সঞ্চয় জমা"
                                >
                                  + জমা
                                </button>
                                <button
                                  onClick={() => {
                                    setAdminEntryType('withdrawal');
                                    setAdminEntryCustomerId(cust.id);
                                    setAdminEntryAmount('');
                                    setAdminEntryNotes('');
                                    setShowAdminEntryModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                  title="সরাসরি সঞ্চয় উত্তোলন"
                                >
                                  - উত্তোলন
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* CUSTOMER INDIVIDUAL SAVINGS VIEW */
            <>
              {/* General Savings Main Banner for Customer */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-extrabold text-xs">
                      <PiggyBank className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'আমার সাধারণ সঞ্চয় হিসাব' : 'My General Savings Account'}</span>
                    </div>
                    <h3 className="text-xl font-black">
                      {lang === 'bn' ? 'যেকোনো সময় সহজ জমা ও উত্তোলন সুবিধা (ব্যাংকের ন্যায়)' : 'Instant Savings Deposit & Withdrawal System'}
                    </h3>
                    <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                      বাৎসরিক অটোমেটিক মুনাফার হার: <strong className="text-white underline">{settings.generalSavingsInterestPct}%</strong> |
                      সরকারি ভ্যাট কর্তন: <strong className="text-white underline">{settings.generalSavingsVatPct}%</strong> |
                      মুনাফা বন্টনের মাস: <strong className="text-amber-300 font-black">{monthNamesBn[settings.generalSavingsPayoutMonth - 1] || 'ডিসেম্বর'}</strong>
                    </p>
                  </div>

                  {/* Customer Balance Box */}
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs shrink-0 flex flex-col justify-between min-w-[240px]">
                    <div>
                      <p className="text-emerald-100 font-semibold">{lang === 'bn' ? 'আপনার সাধারণ সঞ্চয় ব্যালেন্স:' : 'Your Savings Balance:'}</p>
                      <p className="text-2xl font-black text-white mt-1 font-mono">
                        {formatBDT(currentCustomer?.generalSavingsBalance || 0, lang)}
                      </p>
                    </div>

                    {/* Deposit & Withdraw Action Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          setShowDepositModal(true);
                          setDepositChannelId(paymentChannels[0]?.id || '');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'টাকা জমা দিন' : 'Deposit'}</span>
                      </button>

                      <button
                        onClick={() => setShowWithdrawalModal(true)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 text-white font-extrabold text-xs border border-emerald-400/40 shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'bn' ? 'উত্তোলন করুন' : 'Withdraw'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics for Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{lang === 'bn' ? 'মোট ডিপোজিট রিকোয়েস্ট' : 'Total Deposit Requests'}</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {mySavingsRequests.filter((r) => r.type === 'deposit').length} {lang === 'bn' ? 'টি' : ''}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{lang === 'bn' ? 'মোট উত্তোলন রিকোয়েস্ট' : 'Total Withdrawal Requests'}</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {mySavingsRequests.filter((r) => r.type === 'withdrawal').length} {lang === 'bn' ? 'টি' : ''}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{lang === 'bn' ? 'প্রত্যাশিত বার্ষিক মুনাফা' : 'Projected Annual Profit'}</p>
                    <p className="text-base font-black text-blue-600 dark:text-blue-400">
                      {formatBDT(((currentCustomer?.generalSavingsBalance || 0) * (settings.generalSavingsInterestPct || 8)) / 100, lang)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Savings Request Ledger History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>
                  {canManage
                    ? lang === 'bn' ? 'সাধারণ সঞ্চয় জমা ও উত্তোলনের রিকোয়েস্ট তালিকা' : 'Savings Requests Queue & Ledger'
                    : lang === 'bn' ? 'আমার সঞ্চয় জমা ও উত্তোলন রিকোয়েস্ট ইতিহাস' : 'My Savings Request History'}
                </span>
              </h3>
              <span className="text-xs text-slate-400">মোট {mySavingsRequests.length} টি রিকোয়েস্ট</span>
            </div>

            {mySavingsRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'bn' ? 'এখনও কোনো ডিপোজিট বা উইথড্র রিকোয়েস্ট জমা দেওয়া হয়নি।' : 'No savings requests submitted yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="p-3">তারিখ ও সময়</th>
                      {canManage && <th className="p-3">গ্রাহক</th>}
                      <th className="p-3">রিকোয়েস্ট টাইপ</th>
                      <th className="p-3">পরিমাণ</th>
                      <th className="p-3">পদ্ধতি ও চ্যানেল</th>
                      <th className="p-3">ট্রানজেকশন / অ্যাকাউন্ট</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      {canManage && <th className="p-3 text-right">অ্যাকশন</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mySavingsRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{req.createdAt}</td>
                        {canManage && (
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white">{req.customerNameBn || 'গ্রাহক'}</p>
                            <p className="text-[10px] text-slate-400">{req.customerMobile}</p>
                          </td>
                        )}
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold ${
                              req.type === 'deposit'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {req.type === 'deposit' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {req.type === 'deposit' ? (lang === 'bn' ? 'জমা (Deposit)' : 'Deposit') : (lang === 'bn' ? 'উত্তোলন (Withdraw)' : 'Withdraw')}
                          </span>
                        </td>
                        <td className="p-3 font-black text-slate-900 dark:text-white">
                          {formatBDT(req.amount, lang)}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {req.type === 'deposit' ? req.channelNameBn || 'অফিস ক্যাশ' : req.payoutMethod || 'ক্যাশ'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {req.type === 'deposit' ? req.transactionId || 'সরাসরি' : req.payoutAccount || 'সরাসরি'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            }`}
                          >
                            {req.status === 'approved'
                              ? lang === 'bn' ? 'অনুমোদিত' : 'Approved'
                              : req.status === 'rejected'
                              ? lang === 'bn' ? 'বাতিল' : 'Rejected'
                              : lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
                          </span>
                        </td>
                        {canManage && (
                          <td className="p-3 text-right">
                            {req.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => reviewSavingsRequest(req.id, 'approved')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                                >
                                  অনুমোদন
                                </button>
                                <button
                                  onClick={() => reviewSavingsRequest(req.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  বাতিল
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">সম্পন্ন</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CUSTOMER JOINED SCHEMES (My Enrolled Packages) */}
      {activeTab === 'joined' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{lang === 'bn' ? 'আমার সক্রিয় ও আবেদনকৃত প্যাকেজসমূহ' : 'My Enrolled & Applied Packages'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' ? 'আলাদা আলাদা ক্যাটাগরি ফিল্টার করে আপনার স্কিম ও লোন দেখুন' : 'Filter by category to view your enrolled schemes and loans'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              মোট {myJoinedPackages.length + myCustomerLoans.length} টি স্কিম ও লোন
            </span>
          </div>

          {/* Horizontal Category Filtering Tabs for My Enrolled Schemes */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {enrolledFilterTabs.map((tab) => {
              const isActive = enrolledCategoryFilter === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEnrolledCategoryFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? tab.bn : tab.en}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* If No enrolled packages in this filter */}
          {filteredMyJoinedPackages.length === 0 && (enrolledCategoryFilter !== 'loan' && enrolledCategoryFilter !== 'all') ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                এই ক্যাটাগরিতে আপনার কোনো সক্রিয় স্কিম নেই
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                উপলব্ধ স্কিমসমূহ ব্রাউজ করে আপনি সহজে যেকোনো নতুন স্কিমে যুক্ত হতে পারেন।
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(enrolledCategoryFilter);
                  setActiveTab('available');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>নতুন স্কিমে যুক্ত হন</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Joined Packages Cards */}
              {filteredMyJoinedPackages.map((jp) => {
                const pkg = packages.find((p) => p.id === jp.packageId);
                return (
                  <div
                    key={jp.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            {pkg ? categoryOptions.find((c) => c.id === pkg.type)?.bn || pkg.type : 'প্যাকেজ'}
                          </span>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                            {pkg ? (lang === 'bn' ? pkg.titleBn : pkg.titleEn) : 'স্কিম প্যাকেজ'}
                          </h3>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            jp.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : jp.status === 'matured'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : jp.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          }`}
                        >
                          {jp.status === 'active'
                            ? lang === 'bn' ? 'সক্রিয়' : 'Active'
                            : jp.status === 'pending'
                            ? lang === 'bn' ? 'অনুমোদন অপেক্ষমাণ' : 'Pending'
                            : jp.status === 'matured'
                            ? lang === 'bn' ? 'মেয়াদ উত্তীর্ণ' : 'Matured'
                            : lang === 'bn' ? 'বাতিল' : 'Cancelled'}
                        </span>
                      </div>

                      {/* Enrolled Details */}
                      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">শেয়ার / কপির সংখ্যা:</span>
                          <span className="font-black text-slate-900 dark:text-white">{jp.sharesCount} টি</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">মোট প্যাকেজ মূল্য:</span>
                          <span className="font-black text-emerald-600">{formatBDT(jp.totalAmount, lang)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">পরিশোধিত অর্থ:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{formatBDT(jp.totalPaid || 0, lang)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">শুরুর তারিখ:</span>
                          <span className="font-mono text-[11px]">{jp.startDate || jp.appliedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">মেয়াদপূর্তির তারিখ:</span>
                          <span className="font-mono text-[11px] text-emerald-600 font-bold">{jp.maturityDate}</span>
                        </div>
                        {jp.paymentMethod && (
                          <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-slate-400">পেমেন্ট মেথড:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{jp.paymentMethod}</span>
                          </div>
                        )}
                        {jp.trxId && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Trx ID:</span>
                            <span className="font-mono text-[11px] font-bold text-emerald-600">{jp.trxId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {jp.status === 'pending'
                          ? '⏳ অ্যাডমিন পর্যালোচনায় রয়েছে'
                          : `পরবর্তী কিস্তি: ${jp.nextDueDate || 'চলমান'}`}
                      </span>

                      {jp.status === 'active' && (
                        <button
                          onClick={() => {
                            showToast('কিস্তি পরিশোধের জন্য পেমেন্ট চ্যানেল সিলেক্ট করুন', 'info');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          কিস্তি পরিশোধ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Display Loan Cards if 'all' or 'loan' filter selected */}
              {(enrolledCategoryFilter === 'all' || enrolledCategoryFilter === 'loan') &&
                myCustomerLoans.map((l) => (
                  <div
                    key={l.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                            লোন আবেদন ও স্কিম
                          </span>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                            {l.loanType || 'ব্যক্তিগত / ব্যবসা লোন'}
                          </h3>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            l.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : l.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          }`}
                        >
                          {l.status === 'approved'
                            ? lang === 'bn' ? 'অনুমোদিত' : 'Approved'
                            : l.status === 'rejected'
                            ? lang === 'bn' ? 'বাতিল' : 'Rejected'
                            : lang === 'bn' ? 'পর্যালোচনাধীন' : 'Pending'}
                        </span>
                      </div>

                      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">লোন পরিমাণ:</span>
                          <span className="font-black text-purple-600">{formatBDT(l.requestedAmount, lang)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">মেয়াদ:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{l.tenureMonths} মাস</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">মাসিক কিস্তি:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{formatBDT(l.monthlyInstallment, lang)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">আবেদনের তারিখ:</span>
                          <span className="font-mono text-[11px]">{l.appliedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{l.status === 'approved' ? 'নিয়মিত কিস্তি পরিশোধ করুন' : 'অফিস যাচাইকরণ প্রক্রিয়াধীন'}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: AVAILABLE PACKAGES DIRECTORY */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Header & Search Bar for Available Schemes */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">বর্তমান ক্যাটাগরি:</span>
              <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {selectedCategory === 'all'
                  ? 'সকল প্যাকেজ ও স্কিম'
                  : categoryOptions.find((c) => c.id === selectedCategory || ('pkg_' + c.id) === selectedCategory)?.bn || selectedCategory}
              </span>
              <span className="text-xs text-slate-400">({filteredPackages.length} টি স্কিম)</span>
            </div>

            <div className="relative min-w-[280px]">
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
            {filteredPackages.map((pkg) => {
              const alreadyJoined = joinedPackages.find(
                (j) => j.packageId === pkg.id && (j.customerId === currentCustomer?.id || j.customerId === currentUser.id)
              );

              return (
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
                    {alreadyJoined ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                        <Check className="w-4 h-4" />
                        <span>
                          {alreadyJoined.status === 'pending'
                            ? lang === 'bn' ? 'আবেদন অপেক্ষমাণ' : 'Pending Review'
                            : lang === 'bn' ? 'ইতোমধ্যে যুক্ত আছেন' : 'Enrolled'}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenJoinModal(pkg)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{pkg.type === 'loan' ? 'লোনের আবেদন করুন' : 'প্যাকেজে যুক্ত হন'}</span>
                      </button>
                    )}

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => deletePackage(pkg.id)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: ADMIN / MANAGER PENDING REQUESTS REVIEW TAB */}
      {activeTab === 'requests' && canManage && (
        <div className="space-y-6">
          {/* 1. Pending Package Join Requests Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>১. গ্রাহকদের প্যাকেজে যুক্ত হওয়ার আবেদনসমূহ (Join Requests)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {pendingJoinedPackages.length} টি অপেক্ষমাণ
              </span>
            </div>

            {pendingJoinedPackages.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-xs">
                কোনো নতুন প্যাকেজ যুক্ত হওয়ার আবেদন অপেক্ষমাণ নেই।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">গ্রাহক</th>
                      <th className="p-3">প্যাকেজের নাম</th>
                      <th className="p-3">শেয়ার / কপি</th>
                      <th className="p-3">মোট পরিমাণ</th>
                      <th className="p-3">পেমেন্ট মেথড ও TrxID</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingJoinedPackages.map((req) => {
                      const pkg = packages.find((p) => p.id === req.packageId);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{req.appliedDate || req.startDate}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white">{req.customerNameBn || 'গ্রাহক'}</p>
                            <p className="text-[10px] text-slate-400">{req.customerMobile}</p>
                          </td>
                          <td className="p-3 font-semibold text-emerald-600">
                            {pkg?.titleBn || req.packageId}
                          </td>
                          <td className="p-3 font-bold">{req.sharesCount} টি</td>
                          <td className="p-3 font-black text-slate-900 dark:text-white">
                            {formatBDT(req.totalAmount, lang)}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{req.paymentMethod || 'অফিস ক্যাশ'}</p>
                            {req.trxId && <p className="font-mono text-[10px] text-emerald-600">Trx: {req.trxId}</p>}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              PENDING
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => reviewJoinedPackage(req.id, 'active')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                              >
                                অনুমোদন ও সক্রিয়
                              </button>
                              <button
                                onClick={() => reviewJoinedPackage(req.id, 'cancelled')}
                                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. Pending General Savings Requests Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <span>২. সাধারণ সঞ্চয় জমা ও উত্তোলনের আবেদনসমূহ (Savings Requests)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {pendingSavingsRequests.length} টি অপেক্ষমাণ
              </span>
            </div>

            {pendingSavingsRequests.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-xs">
                কোনো সাধারণ সঞ্চয় জমা বা উত্তোলন আবেদন অপেক্ষমাণ নেই।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3">গ্রাহক</th>
                      <th className="p-3">টাইপ</th>
                      <th className="p-3">পরিমাণ</th>
                      <th className="p-3">চ্যানেল / মেথড</th>
                      <th className="p-3">TrxID / অ্যাকাউন্ট</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingSavingsRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{req.createdAt}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{req.customerNameBn}</p>
                          <p className="text-[10px] text-slate-400">{req.customerMobile}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold ${
                              req.type === 'deposit'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {req.type === 'deposit' ? 'জমা' : 'উত্তোলন'}
                          </span>
                        </td>
                        <td className="p-3 font-black text-slate-900 dark:text-white">
                          {formatBDT(req.amount, lang)}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {req.type === 'deposit' ? req.channelNameBn || 'অফিস ক্যাশ' : req.payoutMethod || 'ক্যাশ'}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {req.type === 'deposit' ? req.transactionId || 'N/A' : req.payoutAccount || 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => reviewSavingsRequest(req.id, 'approved')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => reviewSavingsRequest(req.id, 'rejected')}
                              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Loan Applications Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>৩. গ্রাহকদের লোনের আবেদনসমূহ (Loan Applications)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {pendingLoanApplications.length} টি অপেক্ষমাণ
              </span>
            </div>

            {loans.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-xs">কোনো লোনের আবেদন জমা নেই।</p>
            ) : (
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
                        <td className="p-3 text-slate-500 font-mono">{l.appliedDate}</td>
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
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: GENERAL SAVINGS DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <span>সাধারণ সঞ্চয়ে টাকা জমা (ডিপোজিট)</span>
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSavingsDeposit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  জমার পরিমাণ (BDT) *
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="যেমন: ৫০০০"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-sm text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পেমেন্ট চ্যানেল / একাউন্ট নির্বাচন করুন *
                </label>
                <select
                  value={depositChannelId}
                  onChange={(e) => setDepositChannelId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="">সরাসরি ক্যাশ কাউন্টার / অফিস</option>
                  {paymentChannels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.providerNameBn} - {ch.accountNumber} ({ch.accountTypeBn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    প্রেরক মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={depositSenderMobile}
                    onChange={(e) => setDepositSenderMobile(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ট্রানজেকশন আইডি (Trx ID)
                  </label>
                  <input
                    type="text"
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value)}
                    placeholder="যেমন: 9J38S..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  অতিরিক্ত নোট বা তথ্য (ঐচ্ছিক)
                </label>
                <textarea
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  placeholder="যেমন: সঞ্চয় জমার মানি রিসিপ্ট নম্বর ইত্যাদি"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-16 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>জমা রিকোয়েস্ট নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERAL SAVINGS WITHDRAWAL MODAL */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
                <span>সাধারণ সঞ্চয় থেকে টাকা উত্তোলন (উইথড্র)</span>
              </h3>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 mb-4 text-xs">
              <p className="text-amber-900 dark:text-amber-200">
                আপনার বর্তমান উপলব্ধ সাধারণ সঞ্চয় ব্যালেন্স: <strong className="text-emerald-700 dark:text-emerald-300 font-black text-sm">{formatBDT(currentCustomer?.generalSavingsBalance || 0, lang)}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmSavingsWithdrawal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  উত্তোলনের পরিমাণ (BDT) *
                </label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="যেমন: ৩০০০"
                  max={currentCustomer?.generalSavingsBalance || 0}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-sm text-amber-600 outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  টাকা গ্রহণের মাধ্যম (Payout Method) *
                </label>
                <select
                  value={withdrawalPayoutMethod}
                  onChange={(e: any) => setWithdrawalPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="bKash">বিকাশ (bKash Personal)</option>
                  <option value="Nagad">নগদ (Nagad Personal)</option>
                  <option value="Bank">ব্যাংক একাউন্ট (Bank Transfer)</option>
                  <option value="Cash">অফিস ক্যাশ কাউন্টার থেকে সরাসরি গ্রহণ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  টাকা গ্রহণের একাউন্ট / মোবাইল নম্বর / ব্যাংক বিবরণী *
                </label>
                <input
                  type="text"
                  value={withdrawalPayoutAccount}
                  onChange={(e) => setWithdrawalPayoutAccount(e.target.value)}
                  placeholder="যেমন: বিকাশ নম্বর / ডাচ বাংলা ব্যাংক একাউন্ট নম্বর"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  উত্তোলনের কারণ বা নোট (ঐচ্ছিক)
                </label>
                <textarea
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                  placeholder="যেমন: জরুরি চিকিৎসার প্রয়োজনে বা ব্যক্তিগত খরচ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-16 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>উত্তোলন রিকোয়েস্ট জমা দিন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: JOIN PACKAGE / APPLY LOAN ENROLLMENT MODAL */}
      {joinModalPkg && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {joinModalPkg.type === 'loan' ? 'লোনের আবেদনপত্র' : 'প্যাকেজে অংশগ্রহণের আবেদন'}
              </h3>
              <button
                onClick={() => setJoinModalPkg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              প্যাকেজ: <strong className="text-slate-900 dark:text-white">{joinModalPkg.titleBn}</strong>
            </p>

            <form onSubmit={handleConfirmJoinOrApply} className="space-y-3.5 text-xs">
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
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      শেয়ার সংখ্যা / কপির সংখ্যা *
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
                      মোট পেমেন্ট: <strong className="text-emerald-600 font-black">৳ {(parseFloat(sharesCountInput) || 1) * (joinModalPkg.pricePerShare || joinModalPkg.minAmount || 500)}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      পেমেন্ট চ্যানেল / মেথড
                    </label>
                    <select
                      value={selectedPaymentChannelId}
                      onChange={(e) => setSelectedPaymentChannelId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="">সরাসরি অফিস ক্যাশ কাউন্টার</option>
                      {paymentChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.providerNameBn} ({ch.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        প্রেরক মোবাইল
                      </label>
                      <input
                        type="text"
                        value={senderMobile}
                        onChange={(e) => setSenderMobile(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ট্রানজেকশন ID (TrxID)
                      </label>
                      <input
                        type="text"
                        value={joinTrxId}
                        onChange={(e) => setJoinTrxId(e.target.value)}
                        placeholder="TRX..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setJoinModalPkg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>আবেদন জমা দিন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / EDIT PACKAGE MODAL */}
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
                    শেয়ার সংখ্যা / মোট স্লট
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
                    শেয়ার প্রতি মূল্য / সর্বনিম্ন কিস্তি (BDT)
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মেয়াদ (মাস)
                  </label>
                  <input
                    type="number"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মুনাফা / সুদের হার (%)
                  </label>
                  <input
                    type="number"
                    value={profitRatePct}
                    onChange={(e) => setProfitRatePct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: GENERAL SAVINGS SETTINGS MODAL */}
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
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ADMIN DIRECT SAVINGS DEPOSIT / WITHDRAWAL ENTRY MODAL */}
      {showAdminEntryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {adminEntryType === 'deposit' ? (
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-amber-500" />
                )}
                <span>
                  {adminEntryType === 'deposit'
                    ? 'গ্রাহকের সাধারণ সঞ্চয় সরাসরি জমা এন্ট্রি'
                    : 'গ্রাহকের সাধারণ সঞ্চয় সরাসরি উত্তোলন এন্ট্রি'}
                </span>
              </h3>
              <button
                onClick={() => setShowAdminEntryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSavingsEntry} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  গ্রাহক নির্বাচন করুন *
                </label>
                <select
                  value={adminEntryCustomerId}
                  onChange={(e) => setAdminEntryCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn || c.nameEn} ({c.accountNo || c.id}) - বর্তমান ব্যালেন্স: ৳{c.generalSavingsBalance || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {adminEntryType === 'deposit' ? 'জমার পরিমাণ (BDT) *' : 'উত্তোলনের পরিমাণ (BDT) *'}
                </label>
                <input
                  type="number"
                  value={adminEntryAmount}
                  onChange={(e) => setAdminEntryAmount(e.target.value)}
                  placeholder="যেমন: ৫০০০"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-sm text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  লেনদেনের মাধ্যম / চ্যানেল
                </label>
                <select
                  value={adminEntryChannelId}
                  onChange={(e) => setAdminEntryChannelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="cash">অফিস ক্যাশ কাউন্টার (সরাসরি গ্রহণ/প্রদান)</option>
                  <option value="bkash">বিকাশ পেমেন্ট</option>
                  <option value="nagad">নগদ পেমেন্ট</option>
                  <option value="bank">ব্যাংক একাউন্ট ট্রান্সফার</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  নোট বা বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  value={adminEntryNotes}
                  onChange={(e) => setAdminEntryNotes(e.target.value)}
                  placeholder="অফিস এন্ট্রি বিবরণ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-16 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminEntryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-extrabold text-white shadow-md cursor-pointer flex items-center gap-1.5 ${
                    adminEntryType === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {adminEntryType === 'deposit' ? (
                    <>
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>জমা নিশ্চিত করুন</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>উত্তোলন নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
