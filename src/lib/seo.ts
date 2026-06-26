// ==========================================
// Helpers de SEO (títulos de página)
// ==========================================
// Mantém a geração de <title> consistente entre todas as páginas (CSR/Helmet)
// e o SSR-for-bots da API. Regras:
//  - Padrão de marca: "Título da Página | OlieCare".
//  - Não duplica a marca quando o título já a contém (ex.: seoTitle manual).
//  - Não anexa a marca quando o resultado ficaria longo demais para o Google
//    exibir (~600px ≈ 60 caracteres), evitando truncamento do texto útil.

export const SITE_NAME = 'OlieCare';

const BRAND_SUFFIX = ` | ${SITE_NAME}`;
// Limite prático para o <title> antes do Google truncar (~60 chars).
const MAX_TITLE_LENGTH = 60;

/** Verifica se o título já menciona a marca, para não duplicá-la. */
function containsBrand(title: string): boolean {
  return new RegExp(`(^|[^a-z])${SITE_NAME}([^a-z]|$)`, 'i').test(title);
}

/**
 * Aplica o sufixo de marca de forma segura.
 * - Se o título já contém a marca, retorna-o como está.
 * - Se anexar a marca ultrapassar o limite de exibição, retorna sem a marca.
 */
export function withBrand(rawTitle?: string | null): string {
  const title = (rawTitle || '').trim();
  if (!title) return SITE_NAME;
  if (containsBrand(title)) return title;
  if (title.length + BRAND_SUFFIX.length > MAX_TITLE_LENGTH + 5) return title;
  return `${title}${BRAND_SUFFIX}`;
}

/** Converte um slug (ex.: "sono-infantil") em rótulo legível ("Sono Infantil"). */
export function prettifySlug(slug?: string | null): string {
  return (slug || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}
