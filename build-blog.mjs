/**
 * Blog Vinsancor — gerador de markup a partir da fonte única de dados.
 *
 * O que faz:
 *  - Home: reescreve a grade "Artigos recentes" com todos os posts de
 *    assets/blog-posts.js.
 *  - Postagens: reescreve o bloco "Continue lendo" (artigos relacionados)
 *    de cada arquivo .html que tenha data-related-posts.
 *
 * Os cards ficam gravados no HTML (links rastreáveis pelo Google) e o
 * mesmo componente ainda re-renderiza no navegador, então um post novo
 * adicionado em assets/blog-posts.js já aparece mesmo antes de rodar isto.
 *
 * Uso:  node build-blog.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = dirname(fileURLToPath(import.meta.url));

// Carrega a fonte única de dados + o componente de renderização.
const sandbox = { module: undefined, document: undefined, require: undefined };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const file of ["assets/blog-posts.js", "assets/blog-render.js"]) {
  vm.runInContext(readFileSync(join(ROOT, file), "utf8"), sandbox, {
    filename: file,
  });
}
const Blog = sandbox.VinsancorBlog;
const Render = sandbox.VinsancorBlogRender;

const htmlFiles = readdirSync(ROOT).filter((f) => f.endsWith(".html"));
let changed = 0;

for (const file of htmlFiles) {
  const path = join(ROOT, file);
  let html = readFileSync(path, "utf8");
  const before = html;

  // --- Home: grade de artigos recentes ---------------------------------
  html = html.replace(
    /(<div[^>]*data-posts-grid[^>]*>)([\s\S]*?)(<\/div>\s*<div class="hidden)/,
    (_m, open, _inner, tail) =>
      `${open}\n${Blog.getAllPosts().map(Render.homeCardHTML).join("\n")}\n${tail}`
  );

  // --- Postagens: bloco de artigos relacionados ------------------------
  html = html.replace(
    /<section([^>]*data-related-posts[^>]*)>[\s\S]*?<\/section>/g,
    (match, attrs) => {
      const slug = /data-current-slug="([^"]*)"/.exec(attrs)?.[1] || "";
      const limit = Number(/data-limit="(\d+)"/.exec(attrs)?.[1] || 3);
      const inner = Render.relatedInnerHTML(slug, limit);
      if (!inner) return match;
      return `<section${attrs}>\n${inner}\n</section>`;
    }
  );

  if (html !== before) {
    writeFileSync(path, html);
    changed++;
    console.log("atualizado:", file);
  }
}

console.log(`\n${changed} arquivo(s) atualizado(s) a partir de ${Blog.posts.length} post(s).`);
