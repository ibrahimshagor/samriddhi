import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, MapPin, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react';

export const InstitutionsView: React.FC = () => {
  const { currentUser, institutions, branches, lang } = useApp();

  if (!currentUser) return null;

  // Find institutions relevant to this user
  const safeInstitutions = institutions || [];
  const safeBranches = branches || [];
  const userInstId = currentUser.institutionId;
  const userInsts = userInstId
    ? safeInstitutions.filter((i) => i.id === userInstId)
    : safeInstitutions;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-600" />
          <span>{lang === 'bn' ? '৩. সম্পর্কিত প্রতিষ্ঠানসমূহ' : '3. Associated Institutions'}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'bn'
            ? 'আপনি যেই প্রতিষ্ঠানের অধীনে সদস্য বা কর্মী হিসেবে যুক্ত আছেন তার বিস্তারিত বিবরণ'
            : 'Details of the cooperative society/micro-banking institution you belong to'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userInsts.map((inst) => {
          const instBranches = safeBranches.filter((b) => b.institutionId === inst.id);
          return (
            <div
              key={inst.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                    সম
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                      {lang === 'bn' ? inst.nameBn : inst.nameEn}
                    </h3>
                    <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {inst.registrationNo}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === 'bn' ? inst.centralAddressBn : inst.centralAddressEn}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{inst.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{inst.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'bn' ? 'প্রতিষ্ঠার তারিখ:' : 'Est. Date:'} {inst.establishedDate}
                  </span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {lang === 'bn' ? 'এই প্রতিষ্ঠানের সচল শাখাসমূহ:' : 'Active Branches:'}
                </p>
                <div className="space-y-1">
                  {instBranches.map((br) => (
                    <div
                      key={br.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {lang === 'bn' ? br.nameBn : br.nameEn}
                        </p>
                        <p className="text-[10px] text-slate-500">{lang === 'bn' ? br.addressBn : br.addressEn}</p>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-extrabold">
                        {br.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
