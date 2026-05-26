import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'OlieCare';
const SITE_URL = 'https://oliecare.cloud';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Página não encontrada | {SITE_NAME}</title>
        <meta name="description" content="A página que você procurou não existe ou foi movida." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={SITE_URL} />
      </Helmet>

      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          O endereço pode estar incorreto ou o conteúdo foi removido.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-olive-600 text-white rounded-xl font-medium hover:bg-olive-700 transition-colors"
          >
            Ir para Home
          </Link>
          <Link
            to="/blog"
            className="px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Ver Blog
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFoundPage;
