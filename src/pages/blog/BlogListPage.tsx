import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogSEOHead } from '../../components/blog/BlogSEOHead';
import { BlogCard } from '../../components/blog/BlogCard';
import { blogService } from '../../services/blogApi';
import { cn } from '../../lib/utils';

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', page, category, tag, search],
    queryFn: () => blogService.listPublishedPosts({
      page,
      limit: 12,
      category: category || undefined,
      tag: tag || undefined,
      q: search || undefined,
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogService.listCategories(),
  });

  const posts = postsData?.data || [];
  const pagination = postsData?.pagination;
  const categories = categoriesData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set('q', search);
    else params.delete('q');
    params.delete('page');
    setSearchParams(params);
  };

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    setSearchParams(params);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  return (
    <>
      <BlogSEOHead listPage />

      <div className="min-h-screen bg-sand-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OC</span>
              </div>
              <span className="font-bold text-olive-800">OlieCare</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/blog" className="font-medium text-olive-700">Blog</Link>
              <Link to="/" className="text-gray-600 hover:text-olive-600 transition-colors">Home</Link>
              <Link to="/login" className="text-gray-600 hover:text-olive-600 transition-colors">Entrar</Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-b from-olive-50 to-sand-50 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Blog OlieCare
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Artigos sobre cuidados com bebês, amamentação, sono infantil e desenvolvimento.
              Conteúdo baseado em evidências para pais e cuidadores.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar artigos..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-200 focus:border-olive-300 shadow-sm"
              />
            </form>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setCategory('')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  !category ? 'bg-olive-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(category === cat.slug ? '' : cat.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    category === cat.slug
                      ? 'bg-olive-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">Nenhum artigo encontrado.</p>
              {(search || category) && (
                <button
                  onClick={() => { setSearch(''); setCategory(''); }}
                  className="mt-3 text-olive-600 hover:text-olive-700 text-sm font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages)
                .map((p, idx, arr) => {
                  const showGap = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p}>
                      {showGap && <span className="px-1 text-gray-400">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={cn(
                          'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                          p === page
                            ? 'bg-olive-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        )}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} OlieCare. Todos os direitos reservados.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/privacidade" className="hover:text-olive-600 transition-colors">Privacidade</Link>
              <Link to="/termos" className="hover:text-olive-600 transition-colors">Termos</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default BlogListPage;
