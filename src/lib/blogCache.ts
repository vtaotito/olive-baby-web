import type { QueryClient } from '@tanstack/react-query';

const PUBLIC_QUERY_PREFIXES = [
  ['blog-posts'],
  ['blog-post'],
  ['blog-categories'],
  ['blog-tags'],
] as const;

const ADMIN_QUERY_PREFIXES = [
  ['admin-blog'],
  ['admin-blog-posts'],
  ['admin-blog-post'],
  ['admin-blog-stats'],
  ['admin-blog-categories'],
  ['admin-blog-tags'],
] as const;

const SW_CACHE_NAME = 'blog-api-cache';

async function clearServiceWorkerBlogCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.includes(SW_CACHE_NAME))
        .map((name) => caches.delete(name)),
    );
  } catch {
    // Cache API indisponível ou bloqueada — ignorar silenciosamente.
  }
}

export async function invalidateBlogCaches(
  queryClient: QueryClient,
  options: { admin?: boolean; clearSW?: boolean } = {},
): Promise<void> {
  const { admin = true, clearSW = true } = options;

  const prefixes = admin
    ? [...PUBLIC_QUERY_PREFIXES, ...ADMIN_QUERY_PREFIXES]
    : [...PUBLIC_QUERY_PREFIXES];

  await Promise.all(
    prefixes.map((key) =>
      queryClient.invalidateQueries({ queryKey: [...key] as unknown[] }),
    ),
  );

  if (clearSW) {
    await clearServiceWorkerBlogCache();
  }
}
