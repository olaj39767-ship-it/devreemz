import React, { useEffect, useRef, useState } from 'react';
import { StoreConfig } from '../types';
import { getCleanWhatsAppNumber } from '../utils/whatsapp';
import {
  List,
  X,
  CaretDown,
  CaretRight,
  WhatsappLogo,
  Pulse,
  Medal,
  ShieldCheck,
  FileText,
  MagnifyingGlass,
  ChatCircleText,
  Link as LinkIcon,
} from '@phosphor-icons/react';

interface HeaderProps {
  config: StoreConfig;
  inventoryCount: number;
  currentView: 'home' | 'concierge';
  onGoHome: () => void;
  onGoConcierge: () => void;
  onBrowseCatalog: () => void;
  onOpenSellTradeIn: () => void;
  onOpenDiagnostics: () => void;
  onOpenWantList: () => void;
  onOpenConditionGuide: () => void;
  onOpenWarrantyLookup: () => void;
  onOpenGuide: () => void;
  onOpenBioLinks: () => void;
  onOpenAdmin: () => void;
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E6BFF]';

interface MobileRowProps {
  icon?: React.ElementType;
  label: string;
  hint?: string;
  large?: boolean;
  onClick: () => void;
}

const MobileRow: React.FC<MobileRowProps> = ({ icon: Icon, label, hint, large, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full min-h-[48px] flex items-center justify-between gap-3 text-left active:bg-white/5 rounded-lg px-2 ${
      large ? 'py-3' : 'py-2.5'
    } ${focusRing}`}
  >
    <span className="flex items-center gap-3 min-w-0">
      {Icon && <Icon size={20} weight="regular" className="text-slate-400 shrink-0" />}
      <span className="min-w-0">
        <span className={`block truncate ${large ? 'text-xl font-semibold' : 'text-base font-medium'}`}>
          {label}
        </span>
        {hint && <span className="block text-sm text-slate-400 truncate">{hint}</span>}
      </span>
    </span>
    <CaretRight size={16} weight="regular" className="text-slate-500 shrink-0" />
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  config,
  onGoHome,
  onGoConcierge,
  onBrowseCatalog,
  onOpenSellTradeIn,
  onOpenDiagnostics,
  onOpenWantList,
  onOpenConditionGuide,
  onOpenWarrantyLookup,
  onOpenGuide,
  onOpenBioLinks,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const verifyRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  const whatsappHref = `https://wa.me/${getCleanWhatsAppNumber(config)}?text=${encodeURIComponent(
    `Hello ${config.businessName}, I have a question.`
  )}`;

  const initials = config.businessName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Hide on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const isMobile = window.innerWidth < 768;
      if (isMobile && y > 80 && y > lastY.current + 4) {
        setHidden(true);
      } else if (y < lastY.current - 4 || y <= 80) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock page scroll, close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Close the mobile menu if the screen grows to desktop width
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Desktop dropdown: close on outside click or Escape
  useEffect(() => {
    if (!verifyOpen) return;
    const onDown = (e: MouseEvent) => {
      if (verifyRef.current && !verifyRef.current.contains(e.target as Node)) {
        setVerifyOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVerifyOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [verifyOpen]);

  const run = (callback: () => void) => {
    setMenuOpen(false);
    setVerifyOpen(false);
    callback();
  };

  const verifyItems: { label: string; hint: string; icon: React.ElementType; onClick: () => void }[] = [
    { label: 'Device diagnostics', hint: 'Quick browser health check', icon: Pulse, onClick: onOpenDiagnostics },
    { label: 'Condition grading', hint: 'How we grade every phone', icon: Medal, onClick: onOpenConditionGuide },
    { label: 'Warranty lookup', hint: 'Check your cover by IMEI', icon: ShieldCheck, onClick: onOpenWarrantyLookup },
    { label: 'Battery & iCloud guide', hint: 'Check a phone yourself', icon: FileText, onClick: onOpenGuide },
  ];

  const Logo = (
    <button
      onClick={() => run(onGoHome)}
      className={`flex items-center gap-2.5 min-w-0 min-h-[44px] rounded-lg ${focusRing}`}
      aria-label={`${config.businessName} home`}
    >
      <span className="w-8 h-8 rounded-lg bg-[#1E6BFF] text-white text-sm font-bold flex items-center justify-center shrink-0">
        {initials}
      </span>
      <span className="text-base font-bold tracking-tight truncate">{config.businessName}</span>
    </button>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-[#0A1628] border-b border-white/10 text-white transition-transform duration-200 ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          {Logo}

          {/* Desktop navigation: three links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            <button
              onClick={() => run(onBrowseCatalog)}
              className={`px-3 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg ${focusRing}`}
            >
              Shop
            </button>

            <button
              onClick={() => run(onOpenSellTradeIn)}
              className={`px-3 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg ${focusRing}`}
            >
              Trade-In
            </button>

            <div className="relative" ref={verifyRef}>
              <button
                onClick={() => setVerifyOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={verifyOpen}
                className={`px-3 min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium transition-colors rounded-lg hover:text-white ${
                  verifyOpen ? 'text-white' : 'text-slate-300'
                } ${focusRing}`}
              >
                How we verify
                <CaretDown
                  size={14}
                  weight="regular"
                  className={`transition-transform duration-150 ${verifyOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {verifyOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 w-72 rounded-xl bg-[#0F1F38] border border-white/10 shadow-xl p-1.5"
                >
                  {verifyItems.map(({ label, hint, icon: Icon, onClick }) => (
                    <button
                      key={label}
                      role="menuitem"
                      onClick={() => run(onClick)}
                      className={`w-full flex items-start gap-3 p-2.5 text-left rounded-lg hover:bg-white/5 transition-colors ${focusRing}`}
                    >
                      <Icon size={20} weight="regular" className="text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        <span className="block text-sm font-medium text-white">{label}</span>
                        <span className="block text-xs text-slate-400">{hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop: one filled button */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:inline-flex min-h-[40px] items-center gap-2 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors ${focusRing}`}
            >
              <WhatsappLogo size={18} weight="fill" />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Mobile: WhatsApp icon + menu */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className={`md:hidden w-11 h-11 flex items-center justify-center text-white bg-emerald-600 active:bg-emerald-700 rounded-lg ${focusRing}`}
            >
              <WhatsappLogo size={22} weight="fill" />
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={`md:hidden w-11 h-11 flex items-center justify-center text-slate-200 border border-white/15 active:bg-white/10 rounded-lg ${focusRing}`}
            >
              <List size={22} weight="regular" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu (kept outside the header so scroll-hide never affects it) */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#0A1628] text-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            {Logo}
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className={`w-11 h-11 flex items-center justify-center text-slate-200 border border-white/15 active:bg-white/10 rounded-lg ${focusRing}`}
            >
              <X size={22} weight="regular" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
            <MobileRow large label="Shop" onClick={() => run(onBrowseCatalog)} />
            <MobileRow large label="Trade-In" onClick={() => run(onOpenSellTradeIn)} />

            <p className="px-2 pt-6 pb-1 text-sm text-slate-400">How we verify</p>
            {verifyItems.map(({ label, hint, icon, onClick }) => (
              <MobileRow key={label} icon={icon} label={label} hint={hint} onClick={() => run(onClick)} />
            ))}

            <p className="px-2 pt-6 pb-1 text-sm text-slate-400">More</p>
            <MobileRow
              icon={MagnifyingGlass}
              label="Request a phone"
              hint="Can't find it? We'll source it"
              onClick={() => run(onOpenWantList)}
            />
            <MobileRow
              icon={ChatCircleText}
              label="Chat with our assistant"
              onClick={() => run(onGoConcierge)}
            />
            <MobileRow icon={LinkIcon} label="Our links" onClick={() => run(onOpenBioLinks)} />
          </nav>

          <div
            className="px-4 pt-3 border-t border-white/10 shrink-0"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full min-h-[48px] flex items-center justify-center gap-2 text-base font-semibold text-white bg-emerald-600 active:bg-emerald-700 rounded-lg ${focusRing}`}
            >
              <WhatsappLogo size={20} weight="fill" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};