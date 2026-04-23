import { Helmet } from 'react-helmet-async';
import type { BlogPost } from '../../types/blog';

interface BlogSEOHeadProps {
  post?: BlogPost;
  listPage?: boolean;
}

const SITE_NAME = 'OlieCare';
const SITE_URL = 'https://oliecare.cloud';

export function BlogSEOHead({ post, listPage }: BlogSEOHeadProps) {
  if (listPage) {
    return (
      <Helmet>
        <title>Blog | {SITE_NAME} - Cuidados com Bebê</title>
        <meta name="description" content="Artigos sobre cuidados com bebês, amamentação, sono infantil, desenvolvimento e dicas para pais. Conteúdo baseado em evidências." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content={`Blog | ${SITE_NAME}`} />
        <meta property="og:description" content="Artigos sobre cuidados com bebês, amamentação, sono infantil, desenvolvimento e dicas para pais." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Blog | ${SITE_NAME}`} />
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
      <title>{title} | {SITE_NAME}</title>
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
