import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '../../types/blog';
import { SITE_NAME, withBrand } from '../../lib/seo';

interface BlogSEOHeadProps {
  post?: BlogPost;
  listPage?: boolean;
  notFound?: boolean;
  notFoundSlug?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  /** Nome legível da categoria filtrada (para compor o <title>). */
  categoryName?: string;
  /** Nome legível da tag filtrada (para compor o <title>). */
  tagName?: string;
  /** Termo de busca ativo (para compor o <title>). */
  searchQuery?: string;
  /** Página atual da listagem (>1 acrescenta sufixo). */
  page?: number;
}

const SITE_URL = 'https://oliecare.cloud';
const BLOG_BASE_TITLE = 'Blog OlieCare — Cuidados com Bebê Baseados em Evidências';

/** Compõe o título da listagem do blog (default, categoria, tag ou busca). */
function buildListTitle(opts: {
  categoryName?: string;
  tagName?: string;
  searchQuery?: string;
  page?: number;
}): string {
  let title: string;
  if (opts.categoryName) title = `${opts.categoryName} | Blog OlieCare`;
  else if (opts.tagName) title = `${opts.tagName} | Blog OlieCare`;
  else if (opts.searchQuery) title = `Busca por "${opts.searchQuery}" | Blog OlieCare`;
  else title = BLOG_BASE_TITLE;

  if (opts.page && opts.page > 1) title = `${title} — Página ${opts.page}`;
  return title;
}

export function BlogSEOHead({
  post,
  listPage,
  notFound,
  notFoundSlug,
  noIndex,
  canonicalUrl,
  categoryName,
  tagName,
  searchQuery,
  page,
}: BlogSEOHeadProps) {
  if (notFound) {
    return (
      <Helmet>
        <title>Artigo não encontrado | {SITE_NAME}</title>
        <meta
          name="description"
          content={
            notFoundSlug
              ? `Não encontramos um artigo publicado com o slug "${notFoundSlug}".`
              : 'Artigo não encontrado no blog OlieCare.'
          }
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
      </Helmet>
    );
  }

  if (listPage) {
    const robots = noIndex
      ? 'noindex, follow'
      : 'index, follow, max-snippet:-1, max-image-preview:large';
    const canonical = canonicalUrl || `${SITE_URL}/blog`;
    const listTitle = buildListTitle({ categoryName, tagName, searchQuery, page });

    return (
      <Helmet>
        <title>{listTitle}</title>
        <meta name="description" content="Artigos sobre cuidados com bebês, amamentação, sono infantil, desenvolvimento e dicas para pais. Conteúdo baseado em evidências." />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={listTitle} />
        <meta property="og:description" content="Artigos sobre cuidados com bebês, amamentação, sono infantil, desenvolvimento e dicas para pais." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={listTitle} />
        <meta name="twitter:description" content="Artigos sobre cuidados com bebês, amamentação, sono infantil, desenvolvimento e dicas para pais." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: `Blog ${SITE_NAME}`,
            description: 'Artigos sobre cuidados com bebês, amamentação, sono infantil, desenvolvimento e dicas para pais.',
            url: `${SITE_URL}/blog`,
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
            },
          })}
        </script>
      </Helmet>
    );
  }

  if (!post) return null;

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || '';
  const image = post.ogImageUrl || post.coverImageUrl || '';
  const url = `${SITE_URL}/blog/${post.slug}`;
  const authorName = post.author?.caregiver?.fullName || SITE_NAME;

  const baseSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    image: image || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    wordCount: post.content?.split(/\s+/).length || 0,
    ...(post.category && { articleSection: post.category.name }),
    ...(post.seoKeywords?.length && { keywords: post.seoKeywords.join(', ') }),
  };

  const schemas = [baseSchema];

  if (post.schemaMarkup && typeof post.schemaMarkup === 'object') {
    const markup = post.schemaMarkup as Record<string, unknown>;
    if (markup.faq && Array.isArray(markup.faq) && markup.faq.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (markup.faq as Array<{ question: string; answer: string }>).map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }
  }

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  });

  return (
    <Helmet>
      <title>{withBrand(title)}</title>
      <meta name="description" content={description} />
      {post.seoKeywords?.length > 0 && (
        <meta name="keywords" content={post.seoKeywords.join(', ')} />
      )}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      {post.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
      {post.updatedAt && <meta property="article:modified_time" content={post.updatedAt} />}
      {post.category && <meta property="article:section" content={post.category.name} />}
      {post.tags?.map(tag => (
        <meta key={tag.slug} property="article:tag" content={tag.name} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
