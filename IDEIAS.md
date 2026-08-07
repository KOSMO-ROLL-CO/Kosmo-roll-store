# Ideias para o site Kosmo Roll

Lista de ideias (40+ para transformar o e-commerce em uma experiência completa de marca urbana, cósmica e autêntica).

> **Status:** **40 de 51 concluídas** — os itens da seção "Concluídas" já estão implementados. Abaixo, só o que **falta** fazer.

---

## O que falta (11 pendentes)

### Experiência & Design

1. **Dark Mode padrão com toggle** — manter o visual cósmico escuro e oferecer modo claro opcional.
2. **Cursor personalizado** — cursor customizado (estrela, anel planetário) que segue o mouse, com hover nos botões.
3. **Tema "Cósmico" animado** — fundo com partículas/estrelas animadas via canvas (discreto e performático).
4. **Micro-interações em hover** — animações em botões, cards e imagens usando Framer Motion (já no projeto).

### Catálogo & Produtos

13. **Filtros avançados no catálogo** — filtrar por categoria, cor, tamanho, preço e faixa de edição limitada.
18. **Notificação de "esgotando"** — toast quando restam poucas unidades de um produto visualizado.

### Conta & Comunidade

38. **Indique e ganhe** — link de indicação que dá desconto pro amigo e pro indicador.
40. **Tabela de medidas interativa** — guia de tamanhos com calculadora (altura x peso x peça).
41. **Quiz de estilo** — quiz rápido que recomenda peças conforme o perfil do usuário.

### Conteúdo & Marca

42. **Blog / "Diário de Bordo"** — artigos sobre drops, bastidores, cultura urbana e astronomia.
45. **Bastidores (Making Of)** — galeria de vídeo/foto mostrando o processo criativo das estampas.

---

## Concluídas (40)

### Experiência & Design
- 5. **Scroll reveal** ✅ — componente `Reveal` com stagger aplicado nas seções do Home.
- 6. **Transições de página** ✅ — fade/slide suave entre rotas.
- 7. **Tipografia marcante** ✅ — Space Grotesk nos títulos + Inter no corpo.
- 8. **Logo animado** ✅ — brilho pulsante + entrada animada.
- 9. **Erro 404 divertido** ✅ — página `/404` com astronauta, estrelas e planetas.
- 10. **Página de manutenção/lançamento** ✅ — página `/em-breve` com countdown + lista de pré-venda.

### Catálogo & Produtos
- 11. **Zoom de imagem no hover** ✅ — lupa magnética que segue o cursor + zoom suave.
- 12. **Galeria multi-imagem no detalhe** ✅ — carrossel com frente/costas e variação de cor no ProductDetail.
- 14. **Ordenação** ✅ — mais novos, preço, mais vendidos, quase esgotando, edições.
- 15. **Busca com autocomplete** ✅ — autocomplete no header + `?busca=` no catálogo.
- 16. **Selos visuais no card** ✅ — badges "Novo", "Edição Limitada", "Quase Esgotando".
- 17. **Barra de progresso da edição** ✅ — "67/150" com barra de estoque nos limitados.
- 19. **Página "Esgotados"** ✅ — página `/esgotados` com alerta de volta.
- 20. **Fotos em lifestyle** ✅ — galeria com a peça em uso além da foto de produto.

### Edições Limitadas & Exclusividade
- 21. **Contagem regressiva por edição** ✅.
- 22. **Certificado de autenticidade digital** ✅ — página por peça com número da edição e QR code.
- 23. **Pré-venda / Waitlist** ✅.
- 24. **Histórico de edições** ✅ — linha do tempo com edições passadas.
- 25. **Cofre de membro** ✅ — benefícios para quem tem peças numeradas.

### E-commerce & Pagamento
- 26. **Cupons de desconto** ✅ — campo de cupom no checkout + validação + página `/cupons` com regulamento; modal de cupons no checkout.
- 27. **Frete calculado no carrinho** ✅ — simulação por CEP na drawer.
- 28. **Pix com desconto** ✅ — 5% OFF ao pagar com Pix (aplicado na etapa de pagamento).
- 29. **Parcelamento em até 12x** ✅.
- 30. **Complementos (upsell)** ✅ — sugestões no resumo do pedido.
- 31. **Wishlist / Lista de desejos** ✅ — persistida no localStorage.
- 32. **Carrinho salvo** ✅ — persiste entre sessões.
- 33. **Rastreio de pedido** ✅ — código de rastreio no pedido + link dos Correios em "Minha conta".
- 34. **Compra em 1 clique** ✅.
- 35. **Vale-presente Kosmo Roll** ✅ — compra e resgate de gift cards.

### Conta & Comunidade
- 36. **Perfil com histórico completo** ✅ — pedidos, endereços, cupons e favoritos em "Minha conta".
- 37. **Programa de pontos "Kosmo Coins"** ✅ — pontos por login e avaliação de produtos **comprados**; 1 coin = R$0,001 no checkout (teto de **5%**, somado ao cupom).
- 39. **Avaliações de produtos** ✅ — reviews por texto/estrelas liberadas **somente após a compra** da peça (pagamento confirmado).

### Gestão & Admin
- 51. **Portal do dono (Admin)** ✅ — dashboard, CRUD de produtos, cronômetros, gestão de pedidos (status, rastreio, notas, pagamento), cupons, listas de espera/alertas, romaneio, CSV. (acesso com e-mail admin — `admin@kosmoroll.co`)

### Conteúdo & Marketing
- 43. **Lookbook por coleção** ✅ — galeria lookbook/lifestyle no detalhe do produto.
- 44. **Página "Sobre" expandida** ✅ — história da marca, missão, visão, propósito e linha do tempo.
- 46. **Canal de anúncios do drop** ✅ — contagem regressiva na página de edições e no produto.
- 47. **SEO otimizado** ✅ — title/description/theme-color no `index.html` (base).
- 48. **Newsletter** ✅ — seção de cupom de primeira compra na Home (KOSMO10).
- 49. **Pop-up de entrada** ✅ — coberto pelo cupom de primeira compra na Home.
- 50. **Atendimento** ✅ — página de Contato com formulário (atendimento via mensagem).

---

### Próximos passos sugeridos (fase 2)

1. Filtros avançados no catálogo (#13)
2. Notificação de "esgotando" (#18)
3. Tabela de medidas interativa (#40)
4. Dark mode (#1) + cursor personalizado (#2) + tema cósmico animado (#3) + micro-interações (#4)
5. Indique e ganhe (#38)
6. Quiz de estilo (#41)
7. Blog / "Diário de Bordo" (#42)
8. Bastidores / Making Of (#45)

---

### Ideias de nome/taglines para campanhas

- "Vista o universo."
- "Cada peça é uma estrela."
- "Fora de órbita por design."
- "Você não compra uma camiseta, você entra pra tripulação."
- "Peças numeradas, histórias infinitas."
