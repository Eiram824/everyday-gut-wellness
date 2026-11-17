import { GUT_CLARITY_PRODUCT, GUT_ROUTINE_PLANNER_PRODUCT } from '../constants';
import { CREATOR, LAST_UPDATED, ROUTES, SITE_ORIGIN, type SitePath } from '../siteConfig';
import { FAQ_ITEMS } from './editorial-content';

export const PRODUCT_SCHEMA_DETAILS = [
  { ...GUT_CLARITY_PRODUCT, image: `${SITE_ORIGIN}/assets/images/workbook-cover.svg`, description: 'Turn scattered daily observations into an organized one-page summary and useful questions for your next healthcare conversation.' },
  { ...GUT_ROUTINE_PLANNER_PRODUCT, image: `${SITE_ORIGIN}/assets/images/planner-cover.svg`, description: 'Choose a manageable routine, find a cue in your day, and make a smaller fallback for busy, travel or low-energy days.' },
] as const;

const SOCIAL_IMAGE = `${SITE_ORIGIN}/assets/images/ebook_cover_guide_1793359029909.jpg`;
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const canonicalForRoute = (path: SitePath) => `${SITE_ORIGIN}${path}`;
const author = () => ({ '@type': 'Person', name: CREATOR.name, jobTitle: CREATOR.role, url: `${SITE_ORIGIN}/#creator` });
const publisher = () => ({ '@type': 'Organization', name: 'Everyday Gut Wellness', url: `${SITE_ORIGIN}/` });

function breadcrumb(path: Exclude<SitePath, '/'>) {
  return { '@type': 'BreadcrumbList', '@id': `${canonicalForRoute(path)}#breadcrumb`, itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: ROUTES[path].label, item: canonicalForRoute(path) },
  ] };
}

export function schemaForRoute(path: SitePath) {
  const route = ROUTES[path];
  const canonical = canonicalForRoute(path);
  let graph: Record<string, unknown>[];
  if (path === '/') {
    graph = [
      { '@type': 'WebSite', '@id': WEBSITE_ID, url: canonical, name: 'Everyday Gut Wellness', publisher: { '@id': ORGANIZATION_ID }, inLanguage: 'en' },
      { ...publisher(), '@id': ORGANIZATION_ID },
      { '@type': 'MedicalWebPage', '@id': `${canonical}#webpage`, url: canonical, name: route.title, headline: route.h1, description: route.description, dateModified: LAST_UPDATED, inLanguage: 'en', image: SOCIAL_IMAGE, author: author(), publisher: { '@id': ORGANIZATION_ID }, isPartOf: { '@id': WEBSITE_ID } },
      { '@type': 'FAQPage', '@id': `${canonical}#faq`, url: `${canonical}#faq`, isPartOf: { '@id': `${canonical}#webpage` }, mainEntity: FAQ_ITEMS.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    ];
  } else if (path === '/workbooks') {
    graph = [
      ...PRODUCT_SCHEMA_DETAILS.map(product => ({ '@type': 'Product', '@id': `${canonical}#${product.id}`, name: product.title, description: product.description, image: product.image, url: product.url, sku: product.id, category: 'Printable educational PDF', brand: publisher(), offers: { '@type': 'Offer', url: product.url, priceCurrency: 'USD', price: product.priceUSD.toFixed(2) } })),
      breadcrumb(path),
    ];
  } else {
    const type = path === '/when-to-seek-care' ? 'MedicalWebPage' : 'Article';
    graph = [{ '@type': type, '@id': `${canonical}#${type === 'Article' ? 'article' : 'webpage'}`, url: canonical, mainEntityOfPage: canonical, name: route.title, headline: route.h1, description: route.description, image: SOCIAL_IMAGE, dateModified: LAST_UPDATED, author: author(), publisher: publisher(), inLanguage: 'en', ...(type === 'Article' ? { articleSection: route.label } : {}) }, breadcrumb(path)];
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeSchema(data: ReturnType<typeof schemaForRoute>) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ogTypeForRoute = (path: SitePath) => ['/fiber-guide', '/routine-reset', '/myths-vs-facts'].includes(path) ? 'article' : 'website';

export function headForRoute(path: SitePath) {
  const { title, description } = ROUTES[path];
  const canonical = canonicalForRoute(path);
  return [
    `<title>${escapeAttribute(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}" />`,
    `<meta name="author" content="${escapeAttribute(CREATOR.name)}" />`,
    '<meta name="robots" content="index, follow" />',
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="${ogTypeForRoute(path)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    '<meta property="og:site_name" content="Everyday Gut Wellness" />',
    `<meta property="og:image" content="${SOCIAL_IMAGE}" />`,
    '<meta property="og:image:alt" content="Cover of The 7-Day Gentle Gut Reset educational guide" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:url" content="${canonical}" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    `<meta name="twitter:image" content="${SOCIAL_IMAGE}" />`,
    '<meta name="twitter:image:alt" content="Cover of The 7-Day Gentle Gut Reset educational guide" />',
    `<script id="route-schema" type="application/ld+json">${serializeSchema(schemaForRoute(path))}</script>`,
  ].join('\n    ');
}

export function applyPageMetadata(path: SitePath) {
  if (typeof document === 'undefined') return;
  const route = ROUTES[path];
  const canonical = canonicalForRoute(path);
  document.title = route.title;
  const setMeta = (key: 'name' | 'property', name: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${name}"]`);
    if (!element) { element = document.createElement('meta'); element.setAttribute(key, name); document.head.append(element); }
    element.content = content;
  };
  setMeta('name', 'description', route.description);
  setMeta('name', 'author', CREATOR.name);
  setMeta('name', 'robots', 'index, follow');
  for (const [name, value] of Object.entries({ title: route.title, description: route.description, url: canonical, image: SOCIAL_IMAGE })) {
    setMeta('property', `og:${name}`, value);
    setMeta('name', `twitter:${name}`, value);
  }
  setMeta('property', 'og:type', ogTypeForRoute(path));
  setMeta('property', 'og:site_name', 'Everyday Gut Wellness');
  setMeta('property', 'og:image:alt', 'Cover of The 7-Day Gentle Gut Reset educational guide');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:image:alt', 'Cover of The 7-Day Gentle Gut Reset educational guide');
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link); }
  link.href = canonical;
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach(script => script.remove());
  const script = document.createElement('script');
  script.id = 'route-schema'; script.type = 'application/ld+json'; script.textContent = serializeSchema(schemaForRoute(path));
  document.head.append(script);
}
