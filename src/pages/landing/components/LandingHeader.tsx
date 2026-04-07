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

export function LandingHeader({ variant }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const registerLink = variant === 'b2b' ? '/register?profile=professional' : '/register';
  const registerCta = variant === 'b2b' ? 'Cadastrar grátis' : 'Começar grátis';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || isMenuOpen
          ? 'bg-white/95 backdrop-blur-xl shadow-sm shadow-stone-900/5 border-b border-stone-100/80'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link to={variant === 'b2b' ? '/para-profissionais' : '/'} className="flex items-center gap-2.5 group">
            <LogoIcon size={36} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="font-display text-lg font-bold text-stone-800 tracking-tight-editorial">
              OlieCare
            </span>
            {variant === 'b2b' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-olive-600 bg-olive-50 px-2 py-0.5 rounded-full">
                <Stethoscope className="w-3 h-3" />
                Pro
              </span>
            )}
          </Link>

          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-8">
            {[
              { href: '#funcionalidades', label: 'Funcionalidades' },
              { href: '#como-funciona', label: 'Como funciona' },
              { href: '#precos', label: 'Preços' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-stone-500 hover:text-stone-800 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            {variant === 'b2b' ? (
              <a href={B2C_URL} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
                Para famílias
              </a>
            ) : (
              <a href={B2B_URL} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
                Para profissionais
              </a>
            )}
            <Link to="/login" className="text-sm text-stone-600 hover:text-stone-800 transition-colors font-medium">
              Entrar
            </Link>
            <Link
              to={registerLink}
              className="bg-olive-600 hover:bg-olive-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-olive-600/20"
            >
              {registerCta}
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-500 hover:text-stone-700 transition-colors"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-white" />
            <nav
              className="relative flex flex-col h-full pt-24 px-8 pb-10"
              aria-label="Menu mobile"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <a href="#funcionalidades" onClick={() => setIsMenuOpen(false)} className="text-xl text-stone-700 hover:text-olive-600 transition-colors font-medium">
                  Funcionalidades
                </a>
                <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="text-xl text-stone-700 hover:text-olive-600 transition-colors font-medium">
                  Como funciona
                </a>
                <a href="#precos" onClick={() => setIsMenuOpen(false)} className="text-xl text-stone-700 hover:text-olive-600 transition-colors font-medium">
                  Preços
                </a>
                <div className="h-px bg-stone-200 my-2" />
                {variant === 'b2b' ? (
                  <a href={B2C_URL} className="text-stone-400 hover:text-stone-600 transition-colors">Para famílias</a>
                ) : (
                  <a href={B2B_URL} className="text-stone-400 hover:text-stone-600 transition-colors">Para profissionais</a>
                )}
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-stone-700 font-medium text-lg">
                  Entrar
                </Link>
              </motion.div>

              <div className="mt-auto">
                <Link
                  to={registerLink}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full bg-olive-600 hover:bg-olive-700 text-white px-6 py-4 rounded-2xl font-semibold text-center text-lg transition-colors"
                >
                  {registerCta}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
