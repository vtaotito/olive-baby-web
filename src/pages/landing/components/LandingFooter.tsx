// Olive Baby Web - Landing Footer (B2C e B2B)
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const B2C_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/'
  : 'https://oliecare.cloud/';

const B2B_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/para-profissionais'
  : 'https://prof.oliecare.cloud/';

interface LandingFooterProps {
  variant: 'b2c' | 'b2b';
}

export function LandingFooter({ variant }: LandingFooterProps) {
  const brandDescription = variant === 'b2b'
    ? 'Portal gratuito para pediatras e especialistas. Prontuário integrado, agenda e dados de rotina dos bebês em um só lugar.'
    : 'Ajudando famílias a acompanharem a rotina dos seus bebês com mais clareza, organização e tranquilidade.';

  const tagline = variant === 'b2b' ? 'Feito com 💛 para profissionais de saúde' : 'Feito com 💛 para famílias';

  return (
    <footer className="bg-stone-900 text-stone-400 py-16" role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to={variant === 'b2b' ? '/para-profissionais' : '/'}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-olive-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">OlieCare</span>
            </Link>
            <p className="text-stone-400 max-w-sm leading-relaxed">
              {brandDescription}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><a href="mailto:contact@api.oliecare.cloud" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
            {variant === 'b2b' && (
              <div className="mt-4">
                <a href={B2C_URL} className="text-stone-400 hover:text-white transition-colors text-sm">
                  Para famílias →
                </a>
              </div>
            )}
            {variant === 'b2c' && (
              <div className="mt-4">
                <a href={B2B_URL} className="text-stone-400 hover:text-white transition-colors text-sm">
                  Para profissionais →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} OlieCare. Todos os direitos reservados.</p>
          <p className="text-sm">{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
