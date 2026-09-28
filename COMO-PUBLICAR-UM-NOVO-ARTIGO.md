# Blog Vinsancor — artigos relacionados automáticos

## Arquivos

- `assets/blog-posts.js` — **lista única de artigos** (Home + busca + categorias + relacionados).
- `assets/blog-render.js` — componente único que monta os cards (Home e bloco "Continue lendo").
- `assets/blog-related.css` — estilo do bloco "Continue lendo".
- `build-blog.mjs` — grava os cards direto no HTML (links visíveis para o Google).
- `blog-vinsancor.html` e as 3 postagens já atualizadas.

Suba a pasta `assets/` junto com os arquivos `.html` na raiz do site.

## Publicar um novo artigo

1. Crie a página do artigo normalmente e, no final dela (antes do rodapé), deixe o bloco:

   ```html
   <!-- RelatedPosts -->
   <section class="vs-related" aria-labelledby="vs-related-title"
            data-related-posts="" data-current-slug="slug-do-artigo" data-limit="3"></section>
   ```

   E, antes de `</body>`:

   ```html
   <script src="assets/blog-posts.js" defer></script>
   <script src="assets/blog-render.js" defer></script>
   ```

   E, no `<head>`: `<link href="assets/blog-related.css" rel="stylesheet"/>`

2. Adicione o artigo em `assets/blog-posts.js` (copie um bloco existente).
3. (Opcional, recomendado para SEO) rode `node build-blog.mjs` para gravar os cards no HTML.

Pronto: o artigo entra na Home e passa a ser recomendado nas postagens antigas
sem que nenhuma delas precise ser editada.

## Como a recomendação funciona

1. mesma categoria, 2. tags em comum, 3. palavras do título/resumo, 4. mais recentes.
O artigo atual nunca aparece e só entram postagens do blog (nenhum link institucional).
