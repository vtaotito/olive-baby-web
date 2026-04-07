import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const registerLink = variant === 'b2b' ? '/register?profile=professional' : '/register';
  const registerCta = variant === 'b2b' ? 'Cadastrar grátis' : 'Começar grátis';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm shadow-stone-900/5 border-b border-stone-100/80'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link to={variant === 'b2b' ? '/para-profissionais' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-olive-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Heart className="w-4 h-4 text-white" />
            </div>
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

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden overflow-hidden border-t border-stone-100"
              aria-label="Menu mobile"
            >
              <div className="py-6 flex flex-col gap-4">
                <a href="#funcionalidades" onClick={() => setIsMenuOpen(false)} className="text-stone-600 hover:text-olive-600 transition-colors py-1">
                  Funcionalidades
                </a>
                <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="text-stone-600 hover:text-olive-600 transition-colors py-1">
                  Como funciona
                </a>
                <a href="#precos" onClick={() => setIsMenuOpen(false)} className="text-stone-600 hover:text-olive-600 transition-colors py-1">
                  Preços
                </a>
                <div className="h-px bg-stone-100 my-2" />
                {variant === 'b2b' ? (
                  <a href={B2C_URL} className="text-sm text-stone-400">Para famílias</a>
                ) : (
                  <a href={B2B_URL} className="text-sm text-stone-400">Para profissionais</a>
                )}
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-stone-600 font-medium">
                  Entrar
                </Link>
                <Link
                  to={registerLink}
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-olive-600 text-white px-5 py-3 rounded-xl font-semibold text-center"
                >
                  {registerCta}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
