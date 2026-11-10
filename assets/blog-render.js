/*!
 * Blog Vinsancor — componente único de renderização de cards de artigos.
 * Usado pela Home ("Artigos recentes") e pelo bloco "Continue lendo"
 * (artigos relacionados) de TODAS as postagens.
 *
 * Fonte de dados: assets/blog-posts.js (lista única de posts).
 * Este arquivo não contém nenhuma lista de artigos.
 */
(function (root, factory) {
  var api = factory(root.VinsancorBlog || (typeof require === "function" ? require("./blog-posts.js") : null));
  root.VinsancorBlogRender = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (data) {
  "use strict";

  var SECTION_TITLE = "Continue lendo";
  var SECTION_SUBTITLE =
    "Outros artigos do Blog Vinsancor relacionados a este tema.";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Card usado na Home (mantém o design atual da listagem). */
  function homeCardHTML(post) {
    return (
      '<article class="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg" data-post="">\n' +
      '<a class="block" href="' + esc(post.url) + '">\n' +
      '<img alt="' + esc(post.coverAlt || post.title) + '" loading="lazy" decoding="async" width="1200" height="675" src="' + esc(post.coverImage) + '" style="width:100%;aspect-ratio:16/9;object-fit:' + esc(post.coverFit || "cover") + ';background-color:' + esc(post.coverBackground || "transparent") + ';border-radius:1rem;margin-bottom:1rem;display:block"/>\n' +
      '<span class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">' + esc(post.category) + "</span>\n" +
      '<h3 class="mt-4 text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-dark">' + esc(post.title) + "</h3>\n" +
      '<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">' + esc(post.excerpt) + "</p>\n" +
      '<div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">\n' +
      '<time datetime="' + esc(post.date) + '">' + esc(post.dateLabel) + "</time>\n" +
      '<span aria-hidden="true">·</span>\n' +
      "<span>" + esc(post.readingTime) + "</span>\n" +
      "</div>\n</a>\n</article>"
    );
  }

  /** Card usado no bloco de artigos relacionados. */
  function relatedCardHTML(post) {
    return (
      '<article class="vs-rp-card">\n' +
      '<img class="vs-rp-card__media" src="' + esc(post.coverImage) + '" alt="' + esc(post.coverAlt || post.title) + '" width="1200" height="675" loading="lazy" decoding="async"/>\n' +
      '<div class="vs-rp-card__body">\n' +
      '<span class="vs-rp-card__category">' + esc(post.category) + "</span>\n" +
      '<h3 class="vs-rp-card__title"><a href="' + esc(post.url) + '">' + esc(post.title) + "</a></h3>\n" +
      '<p class="vs-rp-card__excerpt">' + esc(post.excerpt) + "</p>\n" +
      '<div class="vs-rp-card__meta">\n' +
      '<time datetime="' + esc(post.date) + '">' + esc(post.dateLabel) + "</time>\n" +
      '<span aria-hidden="true">·</span>\n' +
      "<span>" + esc(post.readingTime) + "</span>\n" +
      "</div>\n" +
      '<span class="vs-rp-card__cta">Ler artigo →</span>\n' +
      "</div>\n</article>"
    );
  }

  /** Conteúdo interno do bloco de artigos relacionados. */
  function relatedInnerHTML(currentSlug, limit) {
    var blog = data || root_blog();
    var related = blog.getRelatedPosts(currentSlug, limit || 3);
    if (!related.length) return "";
    return (
      '<h2 class="vs-related__title" id="vs-related-title">' + SECTION_TITLE + "</h2>\n" +
      '<p class="vs-related__subtitle">' + SECTION_SUBTITLE + "</p>\n" +
      '<div class="vs-related__grid">\n' +
      related.map(relatedCardHTML).join("\n") +
      "\n</div>"
    );
  }

  function root_blog() {
    var g = typeof globalThis !== "undefined" ? globalThis : {};
    return g.VinsancorBlog;
  }

  /** Hidrata a página: Home e/ou bloco de relacionados. */
  function hydrate(doc) {
    var d = doc || (typeof document !== "undefined" ? document : null);
    if (!d) return;
    var blog = data || root_blog();
    if (!blog) return;

    var grid = d.querySelector("[data-posts-grid]");
    if (grid) {
      var location = d.defaultView && d.defaultView.location;
      var params = location && typeof URLSearchParams !== "undefined"
        ? new URLSearchParams(location.search)
        : null;
      var category = params ? (params.get("categoria") || "").trim() : "";
      function normalizeCategory(value) {
        return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      }
      var posts = blog.getAllPosts();
      if (category) {
        var wantedCategory = normalizeCategory(category);
        posts = posts.filter(function (post) {
          return normalizeCategory(post.category) === wantedCategory;
        });
      }
      grid.innerHTML = posts.map(homeCardHTML).join("\n");
      var title = d.querySelector("[data-blog-title]");
      var description = d.querySelector("[data-blog-description]");
      var heading = d.getElementById("recentes");
      var reset = d.getElementById("blog-category-reset");
      var empty = d.getElementById("blog-empty");
      if (category) {
        if (title) title.textContent = "Blog Vinsancor — " + category;
        if (description) description.textContent = "Artigos da categoria " + category + " no Blog Vinsancor.";
        if (heading) heading.textContent = "Artigos de " + category;
        if (reset) reset.hidden = false;
        if (empty) {
          empty.classList.toggle("hidden", posts.length > 0);
          var message = empty.querySelector("p:last-child");
          if (message) message.textContent = posts.length ? "Tente buscar por outro termo." : "Ainda não há artigos nesta categoria.";
        }
      } else {
        if (title) title.textContent = "Blog Vinsancor";
        if (description) description.textContent = "Marketing, SEO, presença digital e estratégias para transformar buscas em clientes.";
        if (heading) heading.textContent = "Artigos recentes";
        if (reset) reset.hidden = true;
        if (empty) empty.classList.add("hidden");
      }
    }

    var blocks = d.querySelectorAll("[data-related-posts]");
    Array.prototype.forEach.call(blocks, function (block) {
      var slug = block.getAttribute("data-current-slug");
      var limit = parseInt(block.getAttribute("data-limit") || "3", 10);
      var html = relatedInnerHTML(slug, limit);
      if (html) {
        block.innerHTML = html;
        block.hidden = false;
      } else {
        block.hidden = true;
      }
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        hydrate(document);
      });
    } else {
      hydrate(document);
    }
  }

  return {
    SECTION_TITLE: SECTION_TITLE,
    SECTION_SUBTITLE: SECTION_SUBTITLE,
    homeCardHTML: homeCardHTML,
    relatedCardHTML: relatedCardHTML,
    relatedInnerHTML: relatedInnerHTML,
    hydrate: hydrate,
  };
});
