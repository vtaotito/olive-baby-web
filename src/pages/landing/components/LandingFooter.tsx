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

  return (
    <footer className="bg-stone-950 text-stone-500 py-20" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Link
              to={variant === 'b2b' ? '/para-profissionais' : '/'}
              className="flex items-center gap-2.5 mb-5"
            >
              <div className="w-9 h-9 rounded-xl bg-olive-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight-editorial">OlieCare</span>
            </Link>
            <p className="text-stone-500 max-w-sm leading-relaxed text-[15px]">
              {brandDescription}
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-medium text-stone-300 mb-4 text-sm uppercase tracking-wider">Produto</h4>
            <ul className="space-y-2.5">
              <li><a href="#funcionalidades" className="text-[15px] hover:text-stone-300 transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="text-[15px] hover:text-stone-300 transition-colors">Preços</a></li>
              <li><a href="#como-funciona" className="text-[15px] hover:text-stone-300 transition-colors">Como funciona</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-medium text-stone-300 mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacidade" className="text-[15px] hover:text-stone-300 transition-colors">Privacidade</Link></li>
              <li><Link to="/termos" className="text-[15px] hover:text-stone-300 transition-colors">Termos de uso</Link></li>
              <li><a href="mailto:contact@oliecare.cloud" className="text-[15px] hover:text-stone-300 transition-colors">Contato</a></li>
            </ul>
            <div className="mt-5">
              {variant === 'b2b' ? (
                <a href={B2C_URL} className="text-sm text-stone-600 hover:text-stone-400 transition-colors">
                  Para famílias →
                </a>
              ) : (
                <a href={B2B_URL} className="text-sm text-stone-600 hover:text-stone-400 transition-colors">
                  Para profissionais →
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800/60 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-600">© {new Date().getFullYear()} OlieCare. Todos os direitos reservados.</p>
          <p className="text-sm text-stone-600">
            {variant === 'b2b' ? 'Feito com cuidado para profissionais de saúde' : 'Feito com cuidado para famílias'}
          </p>
        </div>
      </div>
    </footer>
  );
}
