import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/components/brand/OlieCareLogo';

const B2C_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/'
  : 'https://oliecare.cloud/';

const B2B_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/para-profissionais'
  : 'https://prof.oliecare.cloud/';

interface LandingHeaderProps {
  variant: 'b2c' | 'b2b';
}

const NAV_LINKS = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#precos', label: 'Preços' },
];

export function LandingHeader({ variant }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const registerLink = variant === 'b2b' ? '/register?profile=professional' : '/register';
  const registerCta = variant === 'b2b' ? 'Cadastrar grátis' : 'Começar grátis';
  const switchUrl = variant === 'b2b' ? B2C_URL : B2B_URL;
  const switchLabel = variant === 'b2b' ? 'Para famílias' : 'Para profissionais';

  return (
    <>
      {/* ── Desktop & Mobile header bar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-2xl shadow-sm shadow-stone-900/5 border-b border-stone-100'
            : 'bg-black/50 backdrop-blur-xl border-b border-white/10'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={variant === 'b2b' ? '/para-profissionais' : '/'} className="flex items-center gap-2.5 group">
              <LogoIcon size={36} className="transition-transform duration-300 group-hover:scale-105" />
              <span className={`font-display text-lg font-bold tracking-tight-editorial transition-colors ${
                scrolled ? 'text-stone-900' : 'text-white'
              }`}>
                OlieCare
              </span>
              {variant === 'b2b' && (
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  scrolled 
                    ? 'text-olive-600 bg-olive-50' 
                    : 'text-white bg-white/20 border border-white/30'
                }`}>
                  <Stethoscope className="w-3 h-3" />
                  Pro
                </span>
              )}
            </Link>

            <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors duration-200 ${
                    scrolled 
                      ? 'text-stone-500 hover:text-stone-900' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-5">
              <a 
                href={switchUrl} 
                className={`text-sm transition-colors ${
                  scrolled 
                    ? 'text-stone-500 hover:text-stone-700' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {switchLabel}
              </a>
              <Link 
                to="/login" 
                className={`text-sm font-medium transition-colors ${
                  scrolled 
                    ? 'text-stone-600 hover:text-stone-900' 
                    : 'text-white hover:text-white'
                }`}
              >
                Entrar
              </Link>
              <Link
                to={registerLink}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg ${
                  scrolled 
                    ? 'bg-olive-600 hover:bg-olive-700 text-white hover:shadow-olive-600/20' 
                    : 'bg-white text-olive-700 hover:bg-olive-50 hover:text-olive-800 shadow-xl shadow-black/20'
                }`}
              >
                {registerCta}
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className={`md:hidden p-2 -mr-2 transition-colors ${
                scrolled 
                  ? 'text-stone-600 hover:text-stone-900' 
                  : 'text-white hover:text-white'
              }`}
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile fullscreen overlay (sibling, NOT child of header) ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-white md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            {/* Overlay header bar */}
            <div className="flex items-center justify-between h-16 px-6 flex-shrink-0">
              <Link to={variant === 'b2b' ? '/para-profissionais' : '/'} onClick={closeMenu} className="flex items-center gap-2.5">
                <LogoIcon size={36} />
                <span className="font-display text-lg font-bold text-stone-800 tracking-tight-editorial">
                  OlieCare
                </span>
              </Link>
              <button
                onClick={closeMenu}
                className="p-2 -mr-2 text-stone-600 hover:text-stone-800 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 flex flex-col px-6 pt-6 pb-8 overflow-y-auto" aria-label="Menu mobile">
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="flex flex-col gap-1"
              >
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="text-[22px] font-medium text-stone-800 hover:text-olive-600 transition-colors py-3 border-b border-stone-100"
                  >
                    {link.label}
                  </a>
                ))}
              </motion.div>

              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.25 }}
                className="flex flex-col gap-3 mt-6"
              >
                <a href={switchUrl} className="text-base text-stone-400 hover:text-stone-600 transition-colors py-2">
                  {switchLabel}
                </a>
                <Link to="/login" onClick={closeMenu} className="text-base text-stone-700 font-medium py-2">
                  Entrar
                </Link>
              </motion.div>

              {/* CTA at bottom */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.25 }}
                className="mt-auto pt-8"
              >
                <Link
                  to={registerLink}
                  onClick={closeMenu}
                  className="block w-full bg-olive-600 hover:bg-olive-700 text-white px-6 py-4 rounded-2xl font-semibold text-center text-lg transition-colors shadow-lg shadow-olive-600/20"
                >
                  {registerCta}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
