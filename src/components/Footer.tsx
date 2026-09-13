import React from 'react';
import {
  ShieldCheck,
  Globe,
  Radio,
  Tv,
  FileText,
  Mail,
  Scale,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { TranslationDictionary, LANGUAGES } from '../i18n';
import { SupportedLanguage } from '../types';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  currentLanguage,
  onLanguageChange,
  t,
}) => {
  return (
    <footer id="newsroom-footer" className="bg-neutral-950 text-neutral-300 border-t-4 border-red-800 pt-12 pb-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 1. TOP MASTHEAD & MISSION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-800 pb-8 mb-8 gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-black uppercase text-white tracking-tight">
              {t.brandName}
            </h2>
            <p className="text-neutral-400 font-serif-editorial italic mt-1 max-w-xl text-sm">
              {t.tagline}
            </p>
          </div>

          {/* Verification Badge */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white uppercase text-[11px] font-mono-code">
                Zero-Hallucination Wire Standard
              </div>
              <div className="text-neutral-400 text-[11px]">
                Cross-corroborated against Reuters, AP, Bloomberg, AFP, and sovereign registry filings.
              </div>
            </div>
          </div>
        </div>

        {/* 2. SECTIONS DIRECTORY & LINKS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 border-b border-neutral-800 pb-8 mb-8">
          {/* News Desks */}
          <div>
            <h3 className="font-mono-code font-bold uppercase text-white text-xs tracking-wider mb-3">
              News Desks
            </h3>
            <ul className="space-y-2 font-sans-editorial text-neutral-400">
              <li>
                <button onClick={() => onSelectTab('world')} className="hover:text-white transition-colors">
                  {t.navWorld}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('americas')} className="hover:text-white transition-colors">
                  {t.navAmericas}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('europe')} className="hover:text-white transition-colors">
                  {t.navEurope}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('africa')} className="hover:text-white transition-colors">
                  {t.navAfrica}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('asia')} className="hover:text-white transition-colors">
                  {t.navAsia}
                </button>
              </li>
            </ul>
          </div>

          {/* Sections */}
          <div>
            <h3 className="font-mono-code font-bold uppercase text-white text-xs tracking-wider mb-3">
              Topics & Beats
            </h3>
            <ul className="space-y-2 font-sans-editorial text-neutral-400">
              <li>
                <button onClick={() => onSelectTab('politics')} className="hover:text-white transition-colors">
                  {t.navPolitics}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('business')} className="hover:text-white transition-colors">
                  {t.navBusiness}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('technology')} className="hover:text-white transition-colors">
                  {t.navTechnology}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('science')} className="hover:text-white transition-colors">
                  {t.navScience}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('health')} className="hover:text-white transition-colors">
                  {t.navHealth}
                </button>
              </li>
            </ul>
          </div>

          {/* Multimedia & Live */}
          <div>
            <h3 className="font-mono-code font-bold uppercase text-white text-xs tracking-wider mb-3">
              Broadcast & Live
            </h3>
            <ul className="space-y-2 font-sans-editorial text-neutral-400">
              <li>
                <button onClick={() => onSelectTab('video')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-red-500" />
                  <span>{t.navVideo}</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('live')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span>{t.navLive}</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('archive')} className="hover:text-white transition-colors">
                  {t.navArchive}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('admin')} className="hover:text-white transition-colors">
                  {t.navAdmin}
                </button>
              </li>
            </ul>
          </div>

          {/* AI Journalists */}
          <div>
            <h3 className="font-mono-code font-bold uppercase text-white text-xs tracking-wider mb-3">
              Field Correspondents
            </h3>
            <ul className="space-y-2 font-sans-editorial text-neutral-400">
              <li>Michael Carter (Americas Desk)</li>
              <li>Daniel Wilson (Europe Desk)</li>
              <li>David Okoro (Africa Desk)</li>
              <li>Kenji Nakamura (Asia-Pacific Desk)</li>
            </ul>
          </div>

          {/* Editorial & Standards */}
          <div>
            <h3 className="font-mono-code font-bold uppercase text-white text-xs tracking-wider mb-3">
              Standards & Legal
            </h3>
            <ul className="space-y-2 font-sans-editorial text-neutral-400">
              <li>{t.editorialPolicy}</li>
              <li>{t.aiDisclosure}</li>
              <li>{t.corrections}</li>
              <li>{t.privacy}</li>
              <li>{t.terms}</li>
            </ul>
          </div>
        </div>

        {/* 3. MULTI-LANGUAGE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-6">
          <div className="flex items-center gap-2 font-mono-code text-[11px] text-neutral-400">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>GLOBAL EDITIONS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  currentLanguage === l.code
                    ? 'bg-red-700 text-white font-bold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* 4. COPYRIGHT & ETHICAL CHARTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 font-mono-code text-[11px]">
          <div>{t.allRightsReserved}</div>
          <div className="text-center sm:text-right">{t.ethicalStandard}</div>
        </div>
      </div>
    </footer>
  );
};
