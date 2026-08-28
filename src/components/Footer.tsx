import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Globe, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, settings } = useApp();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? settings.siteNameBn : settings.siteNameEn}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            {lang === 'bn' ? settings.footerTextBn : settings.footerTextEn}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px]">
          <div className="flex items-center gap-1">
            <span>{lang === 'bn' ? 'ডেভেলপার:' : 'Developer:'}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {settings.developerName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>{lang === 'bn' ? 'পাওয়ার্ড বাই:' : 'Powered by:'}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {settings.developerPoweredBy}
            </span>
          </div>

          <a
            href={`https://${settings.developerWebsite}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{settings.developerWebsite}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
