import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentChannel } from '../types';
import { CreditCard, Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';

export const PaymentChannels: React.FC = () => {
  const { currentUser, paymentChannels, branches, addPaymentChannel, updatePaymentChannel, deletePaymentChannel, lang } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<PaymentChannel | null>(null);

  // Form State
  const [nameBn, setNameBn] = useState('বিকাশ মার্চেন্ট');
  const [nameEn, setNameEn] = useState('bKash Merchant');
  const [channelType, setChannelType] = useState<PaymentChannel['type']>('bkash');
  const [accountNo, setAccountNo] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [instructionsHtml, setInstructionsHtml] = useState('');

  if (!currentUser) return null;
  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'branch_manager';

  // Branch-specific override logic:
  // If a branch manager or customer has a branch-specific payment channel for a method (e.g., bKash),
  // hide the global payment channel for that method and display ONLY the branch-specific one!
  const safeChannels = paymentChannels || [];
  let allowedChannels = safeChannels;

  if (currentUser.role === 'customer') {
    const custBranchId = currentUser.branchId || 'br-1';
    const branchSpecificChannels = safeChannels.filter((p) => p.branchId === custBranchId);
    const overriddenTypes = new Set(branchSpecificChannels.map((p) => p.type));

    allowedChannels = safeChannels.filter((p) => {
      if (p.branchId === custBranchId) return true;
      if (p.isGlobal) {
        // If there is a branch specific channel for this method type, hide the global channel
        return !overriddenTypes.has(p.type);
      }
      return false;
    });
  } else if (currentUser.role === 'branch_manager') {
    const mgrBranchId = currentUser.branchId || 'br-1';
    const branchSpecificChannels = safeChannels.filter((p) => p.branchId === mgrBranchId);
    const overriddenTypes = new Set(branchSpecificChannels.map((p) => p.type));

    allowedChannels = safeChannels.filter((p) => {
      if (p.branchId === mgrBranchId) return true;
      if (p.isGlobal) {
        return !overriddenTypes.has(p.type);
      }
      return false;
    });
  }

  const filteredChannels = allowedChannels.filter((p) => {
    const query = (searchQuery || '').toLowerCase();
    return (
      (p.nameBn || '').toLowerCase().includes(query) ||
      (p.nameEn || '').toLowerCase().includes(query) ||
      (p.accountNo || '').includes(searchQuery)
    );
  });

  const handleOpenAdd = () => {
    setEditingChannel(null);
    setNameBn('বিকাশ মার্চেন্ট');
    setNameEn('bKash Merchant');
    setChannelType('bkash');
    setAccountNo('01700000000');
    setBranchId('');
    setInstructionsHtml('রেফারেন্সে আপনার সদস্য আইডি (Membership ID) লিখুন এবং পেমেন্ট সম্পন্ন করুন।');
    setShowModal(true);
  };

  const handleOpenEdit = (p: PaymentChannel) => {
    setEditingChannel(p);
    setNameBn(p.nameBn);
    setNameEn(p.nameEn);
    setChannelType(p.type);
    setAccountNo(p.accountNo);
    setBranchId(p.branchId || '');
    setInstructionsHtml(p.instructionsHtml);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChannel) {
      updatePaymentChannel({
        ...editingChannel,
        nameBn,
        nameEn,
        type: channelType,
        accountNo,
        branchId: branchId || undefined,
        instructionsHtml,
      });
    } else {
      addPaymentChannel({
        nameBn,
        nameEn,
        type: channelType,
        accountNo,
        accountTypeBn: 'মার্চেন্ট অ্যাকাউন্ট',
        accountTypeEn: 'Merchant Account',
        branchId: branchId || undefined,
        instructionsHtml,
        isActive: true,
        isGlobal: !branchId,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '৭. পেমেন্ট চ্যানেল ব্যবস্থাপনা' : '7. Payment Channels'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'বিকাশ, নগদ, রকেট, ব্যাংক অ্যাকাউন্ট বা চেক জমার নিয়মাবলী চ্যানেল ব্যবস্থাপনা'
              : 'Setup bKash, Nagad, Rocket & Bank accounts with detailed payment instructions'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন পেমেন্ট চ্যানেল যুক্ত করুন' : 'Add Payment Channel'}</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'পেমেন্ট মেথড বা অ্যাকাউন্ট দিয়ে খুঁজুন...' : 'Search by channel name or account no...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((chan) => {
          const branchObj = branches.find((b) => b.id === chan.branchId);
          return (
            <div
              key={chan.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {lang === 'bn' ? chan.nameBn : chan.nameEn}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono capitalize">{chan.type}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">অ্যাকাউন্ট / নম্বর:</span>
                  <p className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                    {chan.accountNo}
                  </p>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'পেমেন্টের নির্দেশনাবলী:' : 'Instructions:'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-amber-50/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700">
                    {chan.instructionsHtml}
                  </p>
                </div>

                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>
                    {chan.isGlobal || !chan.branchId
                      ? lang === 'bn'
                        ? 'সকল শাখার জন্য উন্মুক্ত'
                        : 'Applicable for All Branches'
                      : branchObj
                      ? lang === 'bn'
                        ? `শাখা: ${branchObj.nameBn}`
                        : `Branch: ${branchObj.nameEn}`
                      : 'নির্দিষ্ট শাখা'}
                  </span>
                </p>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(chan)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePaymentChannel(chan.id)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingChannel ? 'পেমেন্ট চ্যানেল সম্পাদনা' : 'নতুন পেমেন্ট চ্যানেল তৈরি'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্ট মেথডের নাম (বাংলা)' : 'Name (Bangla)'}
                </label>
                <input
                  type="text"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্ট মেথডের নাম (English)' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'টাইপ' : 'Type'}
                  </label>
                  <select
                    value={channelType}
                    onChange={(e: any) => setChannelType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="cellfin">CellFin</option>
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash / Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'অ্যাসাইন শাখা' : 'Assign Branch'}
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  >
                    <option value="">{lang === 'bn' ? 'সকল শাখা (Global)' : 'All Branches'}</option>
                    {(branches || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'bn' ? b.nameBn : b.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'অ্যাকাউন্ট / নম্বর' : 'Account / Phone No.'}
                </label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্ট নির্দেশাবলী' : 'Instructions'}
                </label>
                <textarea
                  rows={3}
                  value={instructionsHtml}
                  onChange={(e) => setInstructionsHtml(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
