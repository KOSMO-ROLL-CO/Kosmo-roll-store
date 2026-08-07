# Guia e Matriz de Testes Exploratórios - Kosmo Roll Site

Este documento descreve as diretrizes, estratégias e **Charters de Testes Exploratórios** para a equipe de QA e desenvolvimento da Kosmo Roll.

---

## 🎯 O que são Testes Exploratórios?
Diferente dos testes automatizados com scripts rígidos, o teste exploratório combina **aprendizado contínuo, design de teste e execução simultânea**, permitindo descobrir *bugs* de borda, problemas de UX/UI, comportamentos inesperados sob condições atípicas e inconsistências visuais.

---

## 🧭 Charters de Teste Exploratório

### Charter 1: Experiência de Compra em Redes Lentas (3G / Offline)
- **Objetivo**: Explorar o fluxo de seleção de produtos, adição ao carrinho e checkout sob simulação de rede lenta (Network Throttling no Chrome DevTools).
- **Cenários a Testar**:
  - Inserir cupom `KOSMO10` durante carregamento lento.
  - Clicar múltiplas vezes rapidamente no botão "Adicionar ao Carrinho".
  - Simular perda de conexão logo após preencher os dados do cartão de crédito.
- **Resultado Esperado**: Feedback visual claro (spinners, botões desabilitados), sem duplicação de itens no carrinho ou compras duplicadas.

### Charter 2: Validação de Formulários e Inputs Maliciosos / Inválidos
- **Objetivo**: Explorar resiliência a entradas inválidas e caracteres especiais em inputs de formulários.
- **Cenários a Testar**:
  - Inserir nomes extremamente longos (ex: 500+ caracteres) ou com emojis no campo de Titular do Cartão e Nome do Presenteado.
  - Inserir CEPs com formatação corrompida (ex: `00000-000`, `99999-999`, letras, símbolos).
  - Tentar colar payloads de script HTML/JS em observações de vale-presente e e-mails.
- **Resultado Esperado**: Validação amigável, sanitização de inputs e tratamento gracioso de erros sem crash da aplicação.

### Charter 3: Responsividade e Quebra de Layout (Cross-Device & Orientation)
- **Objetivo**: Testar comportamentos da interface em resoluções não padrão ou dobráveis.
- **Cenários a Testar**:
  - Redimensionar a janela do navegador em tempo real entre 320px e 2560px.
  - Alternar orientação portrait/landscape em dispositivos móveis.
  - Verificar se modais (como Checkout ou Menu Lateral) sofrem overflow de tela em visores curtos (ex: 480px de altura).
- **Resultado Esperado**: Layout fluido, sem scroll horizontal involuntário, modais roláveis e acessibilidade aos botões de fechar.

### Charter 4: Persistência de Estado (Local Storage & Refresh)
- **Objetivo**: Explorar resiliência do estado da sessão e do carrinho contra atualizações acidentais de página.
- **Cenários a Testar**:
  - Adicionar 3 itens ao carrinho, aplicar o cupom `COSMICO15`, calcular frete e pressionar `F5` (Refresh).
  - Limpar os dados de navegação (Local Storage) com o carrinho aberto.
  - Abrir o site em duas abas simultâneas e alterar a quantidade em uma delas.
- **Resultado Esperado**: Carrinho deve persistir corretamente ou resetar limpo sem inconsistência ou valores negativos.

---

## 🤖 Automação Exploratória (Fuzzing / Monkey Testing)
Para executar o teste exploratório automatizado via Playwright:
```bash
npm run test:exploratory
```
Ele simulará cliques e navegações aleatórias garantindo que nenhuma exceção fatal JavaScript (Unhandled TypeError) ocorra durante o uso.
