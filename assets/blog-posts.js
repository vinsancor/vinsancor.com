/*!
 * Blog Vinsancor — FONTE ÚNICA DE DADOS DOS ARTIGOS
 * ------------------------------------------------
 * Esta é a ÚNICA lista de posts do blog.
 * Ela alimenta: Home (artigos recentes), busca, categorias e o bloco
 * "Continue lendo" (artigos relacionados) de todas as postagens.
 *
 * PARA PUBLICAR UM NOVO ARTIGO:
 * 1. Copie um bloco abaixo e preencha os campos.
 * 2. Pronto. O artigo passa a aparecer na Home e a ser recomendado
 *    automaticamente nas postagens antigas — sem editar nenhuma delas.
 *
 * Campos: id, title, slug, url, category, excerpt, coverImage,
 *         coverAlt, date (ISO), dateLabel, readingTime, tags[]
 */
(function (root, factory) {
  var api = factory();
  root.VinsancorBlog = api;
  root.VINSANCOR_POSTS = api.posts;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var posts = [
    {
      id: "como-criar-um-cardapio-rentavel-e-atraente",
      title: "Como Criar um Cardápio Rentável e Atraente",
      slug: "como-criar-um-cardapio-rentavel-e-atraente",
      url: "como-criar-um-cardapio-rentavel-e-atraente.html",
      category: "Marketing Gastronômico",
      excerpt:
        "O cardápio não é apenas uma lista de preços com descrições de pratos e bebidas. Quando construído com técnicas de Engenharia de Cardápio, Design Estratégico e Neuromarketing, ele se transforma na principal ferramenta de vendas e lucratividade do seu estabelecimento.",
      coverImage: "cardapio-rentavel.png",
      coverAlt: "Como Criar um Cardápio Rentável e Atraente",
      date: "2026-09-28",
      dateLabel: "28 de setembro de 2026",
      readingTime: "5 min de leitura",
      tags: [
        "cardápio",
        "engenharia de cardápio",
        "restaurantes",
        "bares",
        "neuromarketing",
        "precificação",
        "gastronomia",
        "vendas",
      ],
    },
    {
      id: "como-dominar-avaliacoes-google-transformar-estrelas-em-vendas",
      title:
        "Como Dominar as Avaliações no Google e Transformar Estrelas em Vendas",
      slug: "como-dominar-avaliacoes-google-transformar-estrelas-em-vendas",
      url: "como-dominar-avaliacoes-google-transformar-estrelas-em-vendas.html",
      category: "SEO Local",
      excerpt:
        "Estratégias de SEO local, automação e gestão de reputação para conquistar mais avaliações no Google, melhorar sua nota e transformar estrelas em vendas.",
      coverImage: "avaliacoes-google-seo-local.png",
      coverAlt:
        "Como Dominar as Avaliações no Google e Transformar Estrelas em Vendas",
      date: "2026-09-28",
      dateLabel: "28 de setembro de 2026",
      readingTime: "6 min de leitura",
      tags: [
        "avaliações",
        "google",
        "seo local",
        "reputação",
        "perfil da empresa no google",
        "restaurantes",
        "bares",
        "vendas",
      ],
    },
    {
      id: "guia-completo-marketing-para-bares-e-restaurantes",
      title: "Guia Completo de Marketing para Bares e Restaurantes",
      slug: "guia-completo-marketing-para-bares-e-restaurantes",
      url: "guia-completo-marketing-para-bares-e-restaurantes.html",
      category: "Marketing Gastronômico",
      excerpt:
        "Ter uma comida excelente já não é suficiente para garantir mesas cheias. Reunimos as melhores práticas de SEO local, copywriting e estratégias de marketing para transformar o seu bar ou restaurante em um ponto de encontro de alta conversão.",
      coverImage: "marketing-bares-restaurantes-capa.jpg",
      coverAlt: "Guia Completo de Marketing para Bares e Restaurantes",
      date: "2026-09-28",
      dateLabel: "28 de setembro de 2026",
      readingTime: "8 min de leitura",
      tags: [
        "marketing",
        "bares",
        "restaurantes",
        "seo local",
        "copywriting",
        "gastronomia",
        "cardápio",
        "avaliações",
      ],
    },
  ];

  // ---------------------------------------------------------------- helpers

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  var STOPWORDS = norm(
    "a o as os de da do das dos e em no na nos nas um uma para por com que " +
      "seu sua seus suas como mais sem ao aos the of and to in"
  ).split(" ");

  function words(value) {
    return norm(value)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 3 && STOPWORDS.indexOf(w) === -1;
      });
  }

  function time(post) {
    var t = Date.parse(post.date || "");
    return isNaN(t) ? 0 : t;
  }

  /** Todos os posts, do mais recente para o mais antigo. */
  function getAllPosts() {
    return posts.slice().sort(function (a, b) {
      return time(b) - time(a);
    });
  }

  function getPostBySlug(slug) {
    var key = norm(slug).replace(/\.html$/, "");
    for (var i = 0; i < posts.length; i++) {
      if (norm(posts[i].slug) === key || norm(posts[i].id) === key) {
        return posts[i];
      }
    }
    return null;
  }

  /**
   * Relevância entre dois artigos.
   * 1) mesma categoria  2) tags em comum  3) título/resumo  4) recência
   */
  function score(current, candidate) {
    var value = 0;

    if (
      current.category &&
      norm(current.category) === norm(candidate.category)
    ) {
      value += 100;
    }

    var currentTags = (current.tags || []).map(norm);
    var candidateTags = (candidate.tags || []).map(norm);
    var shared = candidateTags.filter(function (tag) {
      return currentTags.indexOf(tag) !== -1;
    }).length;
    value += shared * 10;

    var currentWords = words(current.title + " " + current.excerpt);
    var candidateWords = words(candidate.title + " " + candidate.excerpt);
    var overlap = 0;
    candidateWords.forEach(function (w) {
      if (currentWords.indexOf(w) !== -1) overlap++;
    });
    value += Math.min(overlap, 12);

    return value;
  }

  /**
   * Artigos relacionados ao post atual.
   * Nunca inclui o próprio artigo. Se não houver relação suficiente,
   * completa com os artigos mais recentes (fallback).
   */
  function getRelatedPosts(current, limit) {
    var max = limit || 3;
    var currentPost =
      typeof current === "string" ? getPostBySlug(current) : current;

    var others = getAllPosts().filter(function (post) {
      return !currentPost || post.slug !== currentPost.slug;
    });

    if (!currentPost) return others.slice(0, max);

    return others
      .map(function (post, index) {
        return { post: post, score: score(currentPost, post), index: index };
      })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        var diff = time(b.post) - time(a.post);
        if (diff) return diff;
        return a.index - b.index;
      })
      .slice(0, max)
      .map(function (entry) {
        return entry.post;
      });
  }

  return {
    posts: posts,
    getAllPosts: getAllPosts,
    getPostBySlug: getPostBySlug,
    getRelatedPosts: getRelatedPosts,
  };
});
