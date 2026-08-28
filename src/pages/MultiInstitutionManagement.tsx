import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Institution } from '../types';
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, Calendar, MapPin } from 'lucide-react';

export const MultiInstitutionManagement: React.FC = () => {
  const { institutions, addInstitution, updateInstitution, deleteInstitution, lang } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);

  // Form State
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [regNo, setRegNo] = useState('');
  const [estDate, setEstDate] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filteredList = institutions.filter((i) => {
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (i.nameBn || '').toLowerCase().includes(query) ||
      (i.nameEn || '').toLowerCase().includes(query) ||
      (i.registrationNo || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingInst(null);
    setNameBn('');
    setNameEn('');
    setRegNo('');
    setEstDate(new Date().toISOString().split('T')[0]);
    setAddressBn('');
    setAddressEn('');
    setPhone('');
    setEmail('');
    setShowModal(true);
  };

  const handleOpenEdit = (i: Institution) => {
    setEditingInst(i);
    setNameBn(i.nameBn);
    setNameEn(i.nameEn);
    setRegNo(i.registrationNo);
    setEstDate(i.establishedDate);
    setAddressBn(i.centralAddressBn);
    setAddressEn(i.centralAddressEn);
    setPhone(i.phone);
    setEmail(i.email);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInst) {
      updateInstitution({
        ...editingInst,
        nameBn,
        nameEn,
        registrationNo: regNo,
        establishedDate: estDate,
        centralAddressBn: addressBn,
        centralAddressEn: addressEn,
        phone,
        email,
      });
    } else {
      addInstitution({
        nameBn,
        nameEn,
        registrationNo: regNo,
        establishedDate: estDate,
        centralAddressBn: addressBn,
        centralAddressEn: addressEn,
        phone,
        email,
        status: 'active',
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
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>{lang === 'bn' ? '২. মাল্টি ইনস্টিটিউশন ম্যানেজমেন্ট' : '2. Multi Institution Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'bn'
              ? 'একাধিক সমবায় সমিতি ও ক্ষুদ্র ব্যাংক প্রতিষ্ঠান তৈরি ও তথ্য পরিচালনা করুন'
              : 'Create & manage multiple cooperative society & micro-banking organizations'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন প্রতিষ্ঠান যুক্ত করুন' : 'Add New Institution'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'প্রতিষ্ঠানের নাম বা রেজি নং দিয়ে খুঁজুন...' : 'Search by name or reg no...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
        >
          <option value="all">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
          <option value="active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
          <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
        </select>
      </div>

      {/* Institution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((inst) => (
          <div
            key={inst.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 font-bold flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {lang === 'bn' ? inst.nameBn : inst.nameEn}
                    </h3>
                    <p className="text-[11px] font-mono text-emerald-600 font-bold">{inst.registrationNo}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    inst.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {inst.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{lang === 'bn' ? inst.centralAddressBn : inst.centralAddressEn}</span>
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {inst.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {inst.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600">
                {lang === 'bn' ? `শাখা সংখ্যা: ${inst.totalBranches || 0} টি` : `Total Branches: ${inst.totalBranches || 0}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(inst)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteInstitution(inst.id)}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {editingInst
                ? lang === 'bn'
                  ? 'প্রতিষ্ঠান তথ্য সম্পাদনা'
                  : 'Edit Institution'
                : lang === 'bn'
                ? 'নতুন প্রতিষ্ঠান নিবন্ধিত করুন'
                : 'Register New Institution'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'প্রতিষ্ঠানের নাম (বাংলায়)' : 'Institution Name (Bangla)'}
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
                  {lang === 'bn' ? 'প্রতিষ্ঠানের নাম (English)' : 'Institution Name (English)'}
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
                    {lang === 'bn' ? 'রেজিস্ট্রেশন নম্বর' : 'Registration No.'}
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রতিষ্ঠার তারিখ' : 'Est. Date'}
                  </label>
                  <input
                    type="date"
                    value={estDate}
                    onChange={(e) => setEstDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'কেন্দ্রীয় ঠিকানা (বাংলায়)' : 'Central Address (Bangla)'}
                </label>
                <input
                  type="text"
                  value={addressBn}
                  onChange={(e) => setAddressBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'কেন্দ্রীয় ঠিকানা (English)' : 'Central Address (English)'}
                </label>
                <input
                  type="text"
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
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
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
