import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from 'lucide-react';
import { BlogSEOHead } from '../../components/blog/BlogSEOHead';
import { blogService } from '../../services/blogApi';

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-12 mb-5">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="list-disc pl-5 mb-4 space-y-1">${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-olive-600 hover:text-olive-700 underline">$1</a>')
    .replace(/^(?!<[hulo])((?!<).+)$/gm, '<p class="mb-4 leading-relaxed">$1</p>')
    .replace(/<p class="mb-4 leading-relaxed"><\/p>/g, '');
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getPostBySlug(slug!),
    enabled: !!slug,
  });

  const post = postData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-lg text-gray-500 mb-4">Artigo não encontrado</p>
        <Link to="/blog" className="text-olive-600 hover:text-olive-700 font-medium">
          Voltar ao Blog
        </Link>
      </div>
    );
  }

  const authorName = post.author?.caregiver?.fullName || 'OlieCare';
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <BlogSEOHead post={post} />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/blog" className="flex items-center gap-2 text-gray-600 hover:text-olive-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Blog</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-olive-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">OC</span>
              </div>
              <span className="font-bold text-olive-800 text-sm">OlieCare</span>
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4">
          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="mt-8 rounded-2xl overflow-hidden">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full max-h-[400px] object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="mt-8 mb-10">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li><Link to="/" className="hover:text-olive-600">Home</Link></li>
                <li>/</li>
                <li><Link to="/blog" className="hover:text-olive-600">Blog</Link></li>
                {post.category && (
                  <>
                    <li>/</li>
                    <li>
                      <Link to={`/blog?category=${post.category.slug}`} className="hover:text-olive-600">
                        {post.category.name}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {/* Category */}
            {post.category && (
              <Link
                to={`/blog?category=${post.category.slug}`}
                className="inline-block px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm font-medium mb-4 hover:bg-olive-200 transition-colors"
              >
                {post.category.name}
              </Link>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-5">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100">
              <span className="font-medium text-gray-700">{authorName}</span>
              {publishDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {publishDate}
                </span>
              )}
              {post.readingTimeMin && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readingTimeMin} min de leitura
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-olive-600 hover:prose-a:text-olive-700 prose-strong:text-gray-900 prose-li:text-gray-700 mb-12"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-6 border-t border-gray-100 mb-8">
              <Tag className="w-4 h-4 text-gray-400" />
              {post.tags.map(tag => (
                <Link
                  key={tag.slug}
                  to={`/blog?tag=${tag.slug}`}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-olive-100 hover:text-olive-700 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share & CTA */}
          <div className="bg-gradient-to-r from-olive-50 to-baby-50 rounded-2xl p-8 text-center mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Gostou deste artigo?
            </h3>
            <p className="text-gray-600 mb-5">
              Acompanhe o desenvolvimento do seu bebê com o OlieCare.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/register"
                className="px-6 py-3 bg-olive-600 text-white rounded-xl font-medium hover:bg-olive-700 transition-colors"
              >
                Começar Grátis
              </Link>
              <Link
                to="/blog"
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Mais Artigos
              </Link>
            </div>
          </div>
        </article>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
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

export default BlogPostPage;
