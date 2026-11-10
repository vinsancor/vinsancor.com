/**
 * Gera os cards estáticos do Blog Vinsancor e os blocos de artigos relacionados
 * a partir da fonte única assets/blog-posts.js. Também mantém o ItemList do blog
 * e o sitemap sincronizados.
 */
import { createRequire } from 'node:module';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));
const blog = require('./assets/blog-posts.js');
const posts = blog.getAllPosts();
const POSTS_VERSION = '20261110-8';
const RENDER_VERSION = '20261110-8';
const esc = (v = '') => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function homeCard(post) {
  return `<article class="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg" data-post="">
<a class="block" href="${esc(post.url)}">
<img alt="${esc(post.coverAlt || post.title)}" loading="lazy" decoding="async" width="1200" height="675" src="${esc(post.coverImage)}" style="width:100%;aspect-ratio:16/9;object-fit:${esc(post.coverFit || 'cover')};background-color:${esc(post.coverBackground || 'transparent')};border-radius:1rem;margin-bottom:1rem;display:block"/>
<span class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">${esc(post.category)}</span>
<h3 class="mt-4 text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-dark">${esc(post.title)}</h3>
<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">${esc(post.excerpt)}</p>
<div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><time datetime="${esc(post.date)}">${esc(post.dateLabel)}</time><span aria-hidden="true">·</span><span>${esc(post.readingTime)}</span></div>
</a>
</article>`;
}

function relatedCard(post) {
  return `<article class="vs-rp-card">
<img class="vs-rp-card__media" src="${esc(post.coverImage)}" alt="${esc(post.coverAlt || post.title)}" width="1200" height="675" loading="lazy" decoding="async"/>
<div class="vs-rp-card__body"><span class="vs-rp-card__category">${esc(post.category)}</span>
<h3 class="vs-rp-card__title"><a href="${esc(post.url)}">${esc(post.title)}</a></h3>
<p class="vs-rp-card__excerpt">${esc(post.excerpt)}</p>
<div class="vs-rp-card__meta"><time datetime="${esc(post.date)}">${esc(post.dateLabel)}</time><span aria-hidden="true">·</span><span>${esc(post.readingTime)}</span></div>
<span class="vs-rp-card__cta">Ler artigo →</span></div></article>`;
}

const blogFile = path.join(root, 'blog-vinsancor.html');
let home = await readFile(blogFile, 'utf8');
home = home.replace(/assets\/blog-posts\.js(?:\?[^\"]*)?/g, `assets/blog-posts.js?v=${POSTS_VERSION}`);
home = home.replace(/assets\/blog-render\.js(?:\?[^\"]*)?/g, `assets/blog-render.js?v=${RENDER_VERSION}`);
home = home.replace(/(<div class="grid gap-6 md:grid-cols-2" data-posts-grid="">)[\s\S]*?(<\/div>\n<div class="hidden[^>]*id="blog-empty">)/, (_, start, end) => `${start}\n${posts.map(homeCard).join('\n')}\n${end}`);
// Refresh the structured article list in the existing JSON-LD script.
home = home.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (whole, json) => {
  try {
    const graph = JSON.parse(json);
    for (const item of graph['@graph'] || []) {
      if (item['@type'] === 'ItemList') {
        item.numberOfItems = posts.length;
        item.itemListElement = posts.map((post, i) => ({
          '@type': 'ListItem', position: i + 1,
          url: `https://vinsancor.com/${post.url}`,
          name: `${post.title} | Blog Vinsancor`,
        }));
      }
    }
    return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
  } catch { return whole; }
});
// Keep the category totals in sync with the same post list as the cards.
const categoryStart = home.indexOf('<h2 class="text-lg font-extrabold text-foreground" id="cat-title">');
const categoryListStart = home.indexOf('<ul class="mt-3 space-y-2 text-sm">', categoryStart);
const categoryListClose = categoryListStart >= 0 ? home.indexOf('</ul>', categoryListStart) + '</ul>'.length : -1;
if (categoryStart >= 0 && categoryListStart >= 0 && categoryListClose >= categoryListStart) {
  const categories = new Map();
  posts.forEach((post) => {
    categories.set(post.category, (categories.get(post.category) || 0) + 1);
  });
  const categoryHTML = `<ul class="mt-3 space-y-2 text-sm">${Array.from(categories.entries()).map(([name, count]) =>
    `<li><a class="text-muted-foreground transition-colors hover:text-foreground" href="blog-vinsancor.html?categoria=${encodeURIComponent(name)}">${esc(name)} <span class="text-xs">(${count})</span></a></li>`
  ).join('')}</ul>`;
  home = home.slice(0, categoryListStart) + categoryHTML + home.slice(categoryListClose);
}
await writeFile(blogFile, home);

// Bake related cards into every article that uses the documented placeholder.
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html') || entry.name === 'blog-vinsancor.html') continue;
  const file = path.join(root, entry.name);
  let html = await readFile(file, 'utf8');
  if (!html.includes('data-related-posts=')) continue;
  html = html.replace(/assets\/blog-posts\.js(?:\?[^\"]*)?/g, `assets/blog-posts.js?v=${POSTS_VERSION}`);
  html = html.replace(/(<section class="vs-related"[^>]*>)[\s\S]*?(<\/section>)/, (whole, open, close) => {
    const slug = whole.match(/data-current-slug="([^"]+)"/)?.[1] || entry.name.replace(/\.html$/, '');
    const related = blog.getRelatedPosts(slug, 3);
    if (!related.length) return `${open}${close}`;
    return `${open}\n<h2 class="vs-related__title" id="vs-related-title">Continue lendo</h2>\n<p class="vs-related__subtitle">Outros artigos do Blog Vinsancor relacionados a este tema.</p>\n<div class="vs-related__grid">\n${related.map(relatedCard).join('\n')}\n</div>\n${close}`;
  });
  await writeFile(file, html);
}

// Add the article URL to the static sitemap if it is not already listed.
const sitemapFile = path.join(root, 'sitemap.xml');
let sitemap = await readFile(sitemapFile, 'utf8');
for (const post of posts) {
  const loc = `https://vinsancor.com/${post.url}`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    sitemap = sitemap.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`);
  }
}
await writeFile(sitemapFile, sitemap);
console.log(`Blog atualizado: ${posts.length} artigos, cards estáticos, relacionados e sitemap.`);
