import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import type { BlogPostListItem } from '../../types/blog';

interface BlogCardProps {
  post: BlogPostListItem;
}

export function BlogCard({ post }: BlogCardProps) {
  const authorName = post.author?.caregiver?.fullName || 'OlieCare';
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-olive-200 transition-all duration-300"
    >
      {/* Cover Image */}
      {post.coverImageUrl ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-olive-50 to-baby-50 flex items-center justify-center">
          <span className="text-4xl">📝</span>
        </div>
      )}

      <div className="p-5">
        {/* Category */}
        {post.category && (
          <span className="inline-block px-2.5 py-1 bg-olive-100 text-olive-700 rounded-full text-xs font-medium mb-3">
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 group-hover:text-olive-700 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>{authorName}</span>
            {publishDate && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{publishDate}</span>
              </>
            )}
          </div>
          {post.readingTimeMin && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTimeMin} min</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag.slug} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
