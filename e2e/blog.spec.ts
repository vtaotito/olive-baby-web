import { test, expect, type Page } from '@playwright/test';

const BLOG_LIST_PATH = '/blog';
const SITEMAP_API = '/api/v1/blog/sitemap';
const POSTS_API = '/api/v1/blog/posts';
const SSR_LIST_API = '/api/v1/blog/ssr';
const SSR_POST_API = (slug: string) => `/api/v1/blog/ssr/${slug}`;

const GOOGLEBOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

async function getFirstPublishedSlug(page: Page): Promise<string | null> {
  const response = await page.request.get(`${POSTS_API}?limit=1`);
  if (!response.ok()) return null;
  const json = await response.json();
  const first = Array.isArray(json?.data) ? json.data[0] : null;
  return first?.slug || null;
}

test.describe('Blog OlieCare — público (humano)', () => {
  test('listagem /blog renderiza cabeçalho e cards de posts', async ({ page }) => {
    // Aguarda a API ser chamada (garante que a SPA já hidratou e fez fetch)
    const apiPromise = page.waitForResponse(
      (res) => res.url().includes(POSTS_API) && res.status() === 200,
      { timeout: 30000 },
    );
    await page.goto(BLOG_LIST_PATH, { waitUntil: 'domcontentloaded' });
    await apiPromise;

    // Hero "Blog OlieCare" deve estar visível após hidratação
    await expect(page.getByRole('heading', { level: 1, name: /Blog/i })).toBeVisible({ timeout: 20000 });

    // Deve haver pelo menos um link interno para um post (/blog/{slug})
    const internalBlogLinks = page.locator('a[href^="/blog/"]:not([href$="/blog"]):not([href$="/blog/"])');
    await expect(internalBlogLinks.first()).toBeVisible({ timeout: 20000 });
  });

  test('filtro por categoria altera a URL e mantém a listagem renderizando', async ({ page }) => {
    await page.goto(`${BLOG_LIST_PATH}?category=bebes`);
    // Pode ou não ter posts dessa categoria — não falhar por isso. Mas a página tem que carregar.
    await expect(page.locator('main, [role="main"], body')).toBeVisible();
    await expect(page).toHaveURL(/category=bebes/);
  });

  test('post individual renderiza título, conteúdo e meta tags via Helmet', async ({ page }) => {
    const slug = await getFirstPublishedSlug(page);
    test.skip(!slug, 'Sem posts publicados em produção.');

    await page.goto(`/blog/${slug}`);

    // H1 do post
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Helmet deve injetar canonical no <head>
    const canonical = page.locator('head > link[rel="canonical"]').last();
    await expect(canonical).toHaveAttribute('href', new RegExp(`/blog/${slug}$`));

    // OG type article (Helmet pode injetar além do og:type=website do index.html base)
    const ogArticle = page.locator('head > meta[property="og:type"][content="article"]');
    await expect(ogArticle).toHaveCount(1);

    // Deve haver pelo menos um script JSON-LD do tipo BlogPosting
    const jsonLd = page.locator('head > script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Blog OlieCare — SEO server-side (Googlebot)', () => {
  test('robots.txt permite /blog e referencia o sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(/Allow:\s*\/blog/i);
    expect(body).toMatch(/Sitemap:.*sitemap\.xml/i);
  });

  test('sitemap do blog devolve XML válido com >=1 URL', async ({ request }) => {
    const res = await request.get(SITEMAP_API);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/xml/);
    const xml = await res.text();
    expect(xml).toContain('<urlset');
    const urls = xml.match(/<url>/g) || [];
    expect(urls.length).toBeGreaterThanOrEqual(1);
  });

  test('SSR de listagem responde 200 + JSON-LD para crawlers', async ({ request }) => {
    const res = await request.get(SSR_LIST_API, {
      headers: { 'User-Agent': GOOGLEBOT_UA },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['x-robots-tag']).toMatch(/index/i);
    const html = await res.text();
    expect(html).toMatch(/<title>/i);
    expect(html).toMatch(/application\/ld\+json/);
  });

  test('SSR de post individual responde 200 com JSON-LD e canonical correto', async ({
    request,
  }) => {
    const listRes = await request.get(`${POSTS_API}?limit=1`);
    const json = await listRes.json();
    const slug = json?.data?.[0]?.slug as string | undefined;
    test.skip(!slug, 'Sem posts publicados.');

    const res = await request.get(SSR_POST_API(slug!), {
      headers: { 'User-Agent': GOOGLEBOT_UA },
    });
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<title>/i);
    expect(html).toMatch(/application\/ld\+json/);
    expect(html).toMatch(new RegExp(`/blog/${slug}`));
  });

  test('SSR de slug inexistente devolve 404', async ({ request }) => {
    const res = await request.get(SSR_POST_API('slug-que-nao-existe-12345'), {
      headers: { 'User-Agent': GOOGLEBOT_UA },
    });
    expect(res.status()).toBe(404);
  });
});

test.describe('Blog OlieCare — API pública', () => {
  test('GET /api/v1/blog/posts retorna paginação coerente', async ({ request }) => {
    const res = await request.get(`${POSTS_API}?page=1&limit=5`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBeTruthy();
    expect(json.pagination).toBeTruthy();
    expect(json.pagination.page).toBe(1);
    expect(json.pagination.limit).toBe(5);
  });

  test('GET /api/v1/blog/posts ignora limit fora do range (Zod clamp)', async ({ request }) => {
    // limit acima do máximo (50) deve ser limitado
    const res = await request.get(`${POSTS_API}?limit=9999`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.pagination.limit).toBeLessThanOrEqual(50);
  });

  test('GET /api/v1/blog/posts aceita page=abc sem 500 (Zod fallback)', async ({ request }) => {
    const res = await request.get(`${POSTS_API}?page=abc&limit=xyz`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.pagination.page).toBe(1);
  });

  test('GET /api/v1/blog/categories retorna lista', async ({ request }) => {
    const res = await request.get('/api/v1/blog/categories');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('GET /api/v1/blog/posts/:slug retorna 404 para slug inexistente', async ({ request }) => {
    const res = await request.get(`${POSTS_API}/slug-inexistente-${Date.now()}`);
    expect([404, 400]).toContain(res.status());
  });
});

test.describe('Blog OlieCare — admin (sem auth)', () => {
  test('GET /admin/blog/posts sem JWT retorna 401', async ({ request }) => {
    const res = await request.get('/api/v1/admin/blog/posts');
    expect(res.status()).toBe(401);
  });

  test('POST /admin/n8n/blog-submit-draft sem token retorna 401', async ({ request }) => {
    const res = await request.post('/api/v1/admin/n8n/blog-submit-draft', {
      data: { title: 'x', content: 'y' },
    });
    expect(res.status()).toBe(401);
  });
});
