// Olive Baby Web - Landing Header (B2C e B2B)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X, Stethoscope } from 'lucide-react';

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

  const registerLink = variant === 'b2b' ? '/register?profile=professional' : '/register';
  const registerCta = variant === 'b2b' ? 'Cadastrar grátis' : 'Começar grátis';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={variant === 'b2b' ? '/para-profissionais' : '/'} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-olive-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-stone-800">OlieCare</span>
            {variant === 'b2b' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-olive-600 bg-olive-50 px-2.5 py-1 rounded-full">
                <Stethoscope className="w-3.5 h-3.5" />
                Para Profissionais
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-stone-600 hover:text-olive-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-stone-600 hover:text-olive-600 transition-colors">
              Como funciona
            </a>
            <a href="#precos" className="text-stone-600 hover:text-olive-600 transition-colors">
              Preços
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {variant === 'b2b' && (
              <a
                href={B2C_URL}
                className="text-stone-600 hover:text-olive-600 transition-colors font-medium text-sm"
              >
                Sou pai/mãe
              </a>
            )}
            {variant === 'b2c' && (
              <a
                href={B2B_URL}
                className="text-stone-600 hover:text-olive-600 transition-colors font-medium text-sm"
              >
                Sou profissional
              </a>
            )}
            <Link to="/login" className="text-stone-600 hover:text-olive-600 transition-colors font-medium">
              Entrar
            </Link>
            <Link
              to={registerLink}
              className="bg-olive-600 hover:bg-olive-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
            >
              {registerCta}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-600"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-100">
            <nav aria-label="Menu mobile" className="flex flex-col gap-4">
              <a href="#funcionalidades" className="text-stone-600 hover:text-olive-600 transition-colors py-2">
                Funcionalidades
              </a>
              <a href="#como-funciona" className="text-stone-600 hover:text-olive-600 transition-colors py-2">
                Como funciona
              </a>
              <a href="#precos" className="text-stone-600 hover:text-olive-600 transition-colors py-2">
                Preços
              </a>
              {variant === 'b2b' && (
                <a href={B2C_URL} className="text-stone-600 hover:text-olive-600 transition-colors py-2 text-sm">
                  Sou pai/mãe
                </a>
              )}
              {variant === 'b2c' && (
                <a href={B2B_URL} className="text-stone-600 hover:text-olive-600 transition-colors py-2 text-sm">
                  Sou profissional
                </a>
              )}
              <Link to="/login" className="text-stone-600 hover:text-olive-600 transition-colors py-2 font-medium">
                Entrar
              </Link>
              <Link
                to={registerLink}
                className="bg-olive-600 hover:bg-olive-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors text-center"
              >
                {registerCta}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
