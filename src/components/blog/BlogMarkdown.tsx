import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface BlogMarkdownProps {
  content: string;
  className?: string;
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a || []),
      ['target'],
      ['rel'],
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ['loading'],
      ['decoding'],
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
      ['className'],
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'figure',
    'figcaption',
  ],
};

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-5 scroll-mt-24" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 scroll-mt-24" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-24" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2 scroll-mt-24" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 leading-relaxed text-gray-700" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  a: ({ children, href, ...props }) => {
    const isExternal = href ? /^https?:\/\//i.test(href) && !href.includes('oliecare.cloud') : false;
    return (
      <a
        href={href}
        className="text-olive-600 hover:text-olive-700 underline decoration-olive-300 underline-offset-2"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer nofollow' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-olive-300 bg-olive-50/40 pl-4 pr-3 py-3 my-6 rounded-r-lg italic text-gray-700"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => (
    <hr className="my-10 border-gray-200" {...props} />
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-left border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50 border-b border-gray-200" {...props}>
      {children}
    </thead>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-gray-100" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 font-semibold text-gray-900" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 text-gray-700 align-top" {...props}>
      {children}
    </td>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = (className || '').startsWith('language-');
    if (isBlock) {
      return (
        <code className={`${className} block`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-[0.9em] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto my-6 text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  img: ({ alt, src, ...props }) => (
    <img
      src={src}
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      className="my-6 rounded-xl max-w-full h-auto"
      {...props}
    />
  ),
};

function BlogMarkdownInner({ content, className }: BlogMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const BlogMarkdown = memo(BlogMarkdownInner);
