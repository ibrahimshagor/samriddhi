import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../utils/formatters';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Layers,
  Calendar,
  UserCheck,
  Search,
  User as UserIcon,
  Building2,
  Filter,
} from 'lucide-react';

export const AdjustmentRequests: React.FC = () => {
  const {
    currentUser,
    customers,
    adjustmentRequests,
    schemePackages,
    paymentChannels,
    submitAdjustmentRequest,
    reviewAdjustmentRequest,
    lang,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [targetCustomerId, setTargetCustomerId] = useState(currentUser?.id || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [packageId, setPackageId] = useState((schemePackages || [])[0]?.id || 'general');
  const [paymentChannelId, setPaymentChannelId] = useState((paymentChannels || [])[0]?.id || 'cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountNoUsed, setAccountNoUsed] = useState(currentUser?.mobile || '');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('1000');
  const [type, setType] = useState<'add' | 'deduct'>('add');
  const [reason, setReason] = useState('');

  if (!currentUser) return null;
  const isStaffOrAdmin =
    currentUser.role === 'super_admin' || currentUser.role === 'branch_manager' || currentUser.role === 'branch_staff';

  const selectedPkg = (schemePackages || []).find((p) => p.id === packageId);
  const selectedChannel = (paymentChannels || []).find((c) => c.id === paymentChannelId);

  // Filtered customer list for search inside modal
  const filteredCustomers = (customers || []).filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      (c.nameBn || '').toLowerCase().includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q) ||
      (c.accountNo || '').toLowerCase().includes(q) ||
      (c.mobile || '').toLowerCase().includes(q)
    );
  });

  // Selected customer object
  const selectedTargetCust = (customers || []).find((c) => c.id === targetCustomerId) || {
    id: currentUser.id,
    nameBn: currentUser.nameBn,
    nameEn: currentUser.nameEn,
    accountNo: currentUser.membershipId || 'N/A',
    mobile: currentUser.mobile,
    branchId: currentUser.branchId || 'br-1',
  };

  // Filtered adjustment requests list
  const filteredRequests = (adjustmentRequests || []).filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  const handleSelectCustomer = (cust: any) => {
    setTargetCustomerId(cust.id);
    setAccountNoUsed(cust.mobile || cust.accountNo || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (amt <= 0 || !reason) return;

    submitAdjustmentRequest({
      customerId: selectedTargetCust.id,
      customerNameBn: selectedTargetCust.nameBn,
      customerNameEn: selectedTargetCust.nameEn,
      branchId: selectedTargetCust.branchId || 'br-1',
      packageId,
      packageNameBn: selectedPkg ? selectedPkg.titleBn : 'সাধারণ সঞ্চয়',
      packageNameEn: selectedPkg ? selectedPkg.titleEn : 'General Savings',
      amount: amt,
      type,
      paymentDate,
      paymentChannelId,
      channelNameBn: selectedChannel ? selectedChannel.nameBn : 'ক্যাশ জমাদান',
      channelNameEn: selectedChannel ? selectedChannel.nameEn : 'Cash Deposit',
      accountNoUsed,
      transactionId: transactionId || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      reason,
      note: reason,
      requestedByName: lang === 'bn' ? currentUser.nameBn : currentUser.nameEn,
    });

    setShowModal(false);
    setAmount('1000');
    setReason('');
    setTransactionId('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '১৭. অ্যাকাউন্ট এডজাস্টমেন্ট রিকোয়েস্ট ও ইতিহাস' : '17. Adjustment Requests'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'কাস্টমার সিলেক্ট করে নতুন এডজাস্টমেন্ট জমা দিন এবং পেন্ডিং/পূর্বের সকল এডজাস্টমেন্ট ট্র্যাকিং করুন'
              : 'Select target customer, submit adjustment requests, and manage approval/rejection history'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন এডজাস্টমেন্ট রিকোয়েস্ট' : 'New Request'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs w-max overflow-x-auto">
        {[
          { id: 'all', label: 'সকল রেকর্ড (All History)', count: (adjustmentRequests || []).length },
          { id: 'pending', label: 'অপেক্ষমাণ (Pending)', count: (adjustmentRequests || []).filter((r) => r.status === 'pending').length },
          { id: 'approved', label: 'অনুমোদিত (Approved)', count: (adjustmentRequests || []).filter((r) => r.status === 'approved').length },
          { id: 'rejected', label: 'বাতিলকৃত (Rejected)', count: (adjustmentRequests || []).filter((r) => r.status === 'rejected').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs">
            কোনো এডজাস্টমেন্ট রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          filteredRequests.map((adj) => (
            <div
              key={adj.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                      adj.type === 'add'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {adj.type === 'add' ? '+ ADD BALANCE' : '- DEDUCT BALANCE'}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                      adj.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : adj.status === 'rejected'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {(adj.status || 'pending').toUpperCase()}
                  </span>

                  {adj.packageNameBn && (
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      📦 {adj.packageNameBn}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-0.5">
                  <p className="font-extrabold text-base text-slate-900 dark:text-white">
                    গ্রাহক: <span className="text-slate-900 dark:text-white">{adj.customerNameBn || adj.customerNameEn}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    পরিমাণ: <span className="text-emerald-600 font-mono font-black">{formatBDT(adj.amount, lang)}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <p className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>পেমেন্ট মাধ্যম: <strong>{adj.channelNameBn || 'ক্যাশ'}</strong></span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>প্রদানের তারিখ: <strong>{adj.paymentDate || adj.createdAt}</strong></span>
                  </p>
                  <p className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>প্রদানকারী অ্যাকাউন্ট: <strong className="font-mono text-emerald-600">{adj.accountNoUsed || 'N/A'}</strong></span>
                  </p>
                </div>

                {adj.transactionId && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    ট্রানজেকশন আইডি: <strong className="text-slate-800 dark:text-slate-200">{adj.transactionId}</strong>
                  </p>
                )}

                <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                  কারণ/নোট: {adj.reason || adj.note}
                </p>

                <p className="text-[10px] text-slate-400 font-mono">
                  আবেদনকারী: {adj.requestedByName || adj.customerNameBn} • সময়: {adj.createdAt}
                  {adj.reviewedBy && ` • রিভিউ করেছেন: ${adj.reviewedBy}`}
                </p>
              </div>

              {/* Actions for Admin / Staff */}
              {isStaffOrAdmin && adj.status === 'pending' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => reviewAdjustmentRequest(adj.id, 'approved')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => reviewAdjustmentRequest(adj.id, 'rejected')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold text-xs border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ক্যানসেল / বাতিল' : 'Cancel'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Adjustment Request Modal with Customer Search Bar */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'bn' ? 'ব্যালেন্স এডজাস্টমেন্ট ফর্ম' : 'Create Balance Adjustment'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Customer Search & Select Section (For Admin & Staff) */}
              {isStaffOrAdmin && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    <span>১. কাস্টমার/সদস্য নির্বাচন করুন (Search & Select Customer)</span>
                  </label>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="নাম, মোবাইল বা হিসাব নম্বর দিয়ে সার্চ করুন..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  {/* Customer Quick Search Results */}
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {filteredCustomers.slice(0, 5).map((cust) => (
                      <button
                        type="button"
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                          targetCustomerId === cust.id
                            ? 'bg-emerald-100 border-emerald-500 dark:bg-emerald-950 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-xs">{cust.nameBn}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            হিসাব: {cust.accountNo} • মো: {cust.mobile}
                          </p>
                        </div>
                        {targetCustomerId === cust.id && (
                          <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full">
                            সিলেক্টেড
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedTargetCust && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px]">নির্বাচিত কাস্টমার:</span>
                        <p className="font-black text-slate-900 dark:text-white">
                          {selectedTargetCust.nameBn} ({selectedTargetCust.accountNo})
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 font-extrabold">
                        {selectedTargetCust.mobile}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Adjustment Type & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'এডজাস্টমেন্ট ধরণ' : 'Adjustment Type'}
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                  >
                    <option value="add">যোগ করুন (+ Add Balance)</option>
                    <option value="deduct">কর্তন করুন (- Deduct Balance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্যাকেজ / স্কিম নির্বাচন করুন' : 'Package / Scheme'}
                  </label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                  >
                    <option value="general">সাধারণ সঞ্চয় হিসাব</option>
                    {(schemePackages || []).map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.titleBn} ({pkg.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পেমেন্ট মাধ্যম / চ্যানেল' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentChannelId}
                    onChange={(e) => setPaymentChannelId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                  >
                    {(paymentChannels || []).map((chan) => (
                      <option key={chan.id} value={chan.id}>
                        {chan.nameBn} ({chan.type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রদানের তারিখ' : 'Payment Date'}
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রদানকারী অ্যাকাউন্ট/মোবাইল' : 'Sender Account No.'}
                  </label>
                  <input
                    type="text"
                    value={accountNoUsed}
                    onChange={(e) => setAccountNoUsed(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ট্রানজেকশন আইডি (Trx ID)' : 'Transaction ID'}
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: BK98765432"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'টাকার পরিমাণ (BDT)' : 'Amount'}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-bold text-emerald-600 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'কারণ / বিবরণ' : 'Reason / Note'}
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="যেমন: মাসিক জমা অ্যাডজাস্টমেন্ট ও রসিদ মেলানো"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {lang === 'bn' ? 'আবেদন জমা দিন' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
