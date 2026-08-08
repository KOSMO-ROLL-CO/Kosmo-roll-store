# 🧪 Guia Completo de Testes e Expansão de Features - Kosmo Roll Site

Este documento descreve o funcionamento do ecossistema de testes do projeto **Kosmo Roll Site**, os comandos disponíveis, a arquitetura adotada e o **passo a passo para adicionar novos testes sempre que novas funcionalidades (features) forem desenvolvidas**.

---

## 📐 1. Arquitetura da Suíte de Testes (11 Camadas)

O projeto possui **11 camadas de testes e verificação de qualidade**:

```
                  ┌─────────────────────────────────────┐
                  │          CI/CD Pipeline             │ (GitHub Actions)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │    Testes de Mutação (Stryker)      │ (Validação de rigor dos testes)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │   Estresse & Memory Leak (Heap)     │ (Nós DOM & Estabilidade JS)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │    Performance & Web Vitals (LCP)   │ (PerformanceObserver API)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │   Acessibilidade - a11y (WCAG 2.1)   │ (Axe-core + Playwright)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │      Regressão Visual (Pixel)       │ (Playwright Snapshots)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │   Resiliência de Rede & Off-line    │ (MSW - Mock Service Worker)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │        Testes Exploratórios         │ (Charters & Fuzzing)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │        Testes E2E (Browsers)        │ (Playwright Chromium/Firefox/Mobile)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │    Testes de Segurança (SAST)       │ (XSS, SQLi & Input Masking)
                  └──────────────────┬──────────────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │  Integração & Unitários (Coverage)  │ (Vitest + RTL + Coverage v8)
                  └─────────────────────────────────────┘
```

---

## 📂 2. Onde Fica Cada Arquivo de Teste

| Tipo de Teste | Localização no Projeto | Ferramenta | Exemplo de Uso |
| :--- | :--- | :--- | :--- |
| **Setup do Ambiente** | `src/tests/setup.ts` | Vitest + RTL | Mocks de DOM (`window.matchMedia`, `scrollTo`) |
| **Unitários (Regras de Negócio)** | `src/tests/unit/*.test.ts` | Vitest | Validação de cartão, frete, cupons, vales |
| **Integração (Contextos & UI)** | `src/tests/integration/*.test.tsx` | Vitest + RTL | Adição ao carrinho, alteração de estado |
| **Resiliência de Rede & MSW** | `src/tests/mocks/` e `networkResilience.test.tsx` | MSW + Vitest | Simulação de falhas HTTP (500, timeouts, offline) |
| **Segurança & Sanitização** | `src/tests/security/*.test.ts` | Vitest | Testes de injeção XSS, SQLi, vazamento de dados |
| **Acessibilidade (a11y)** | `e2e/accessibility.spec.ts` | Axe-core + Playwright | Verificação de contraste, rótulos e WCAG 2.1 AA |
| **Regressão Visual** | `e2e/visual-regression.spec.ts` | Playwright | Comparação de snapshots de tela pixel-por-pixel |
| **Performance & Web Vitals** | `e2e/performance-web-vitals.spec.ts` | Playwright | Medição de LCP e limites de nós DOM |
| **Estresse & Memory Leak** | `e2e/stress-memory.spec.ts` | Playwright | Navegação massiva e monitoramento de memória |
| **Testes de Mutação** | `stryker.config.json` | Stryker Mutator | Injeção de mutações para checar eficácia dos testes |
| **End-to-End (E2E)** | `e2e/*.spec.ts` | Playwright | Fluxo completo de compra, catálogo, checkout |
| **Exploratórios (Monkey Testing)** | `e2e/exploratory.spec.ts` | Playwright | Cliques aleatórios verificando ausência de crash |
| **Guia Exploratório Manual** | `EXPLORATORY_TESTING.md` | Documentação | Charters de teste de usabilidade e casos de borda |
| **Pipeline CI/CD** | `.github/workflows/ci.yml` | GitHub Actions | Execução automatizada a cada push/PR |

---

## ⚡ 3. Comandos Rápidos de Execução

```bash
# Executa todos os testes unitários e de integração uma vez
npm run test

# Executa os testes no modo Watch (re-executa ao salvar arquivos)
npm run test:watch

# Gera relatório de cobertura de código (HTML em ./coverage)
npm run test:coverage

# Executa testes de acessibilidade (WCAG 2.1 AA)
npm run test:a11y

# Executa testes de regressão visual com snapshots de imagem
npm run test:visual

# Executa testes de performance e medição de Web Vitals (LCP)
npm run test:perf

# Executa testes de estresse e vazamento de memória
npm run test:stress

# Executa apenas a suíte de testes de segurança
npm run test:security

# Executa os testes End-to-End (E2E) com Playwright
npm run test:e2e

# Executa o teste exploratório automatizado (Monkey/Fuzz Testing)
npm run test:exploratory
```

---

## ➕ 4. O Que Adicionar ao Criar Novas Features?

### 🔹 Caso A: Criar uma nova função utilitária ou regra de negócio (`src/utils/`)
Crie `src/tests/unit/<nome>.test.ts` cobrindo casos normais, valores nulos e limites.

### 🔹 Caso B: Criar um novo componente ou atualizar um Contexto React
Crie `src/tests/integration/<NomeComponente>.test.tsx` envolvendo no `wrapper` com os provedores (`AuthProvider`, `OrderProvider`, `KosmoProvider`, `CartProvider`).

### 🔹 Caso C: Adicionar requisições HTTP / APIs externas
Adicione o endpoint interceptado em `src/tests/mocks/handlers.ts` utilizando o **MSW** para simular respostas bem-sucedidas e erros 500/timeouts.

### 🔹 Caso D: Criar ou alterar uma tela visualmente marcante
Atualize os snapshots do Playwright rodando `npx playwright test e2e/visual-regression.spec.ts --update-snapshots`.

### 🔹 Caso E: Adicionar um novo formulário ou entrada de usuário
Adicione validações de acessibilidade em `e2e/accessibility.spec.ts` e testes de sanitização contra XSS em `src/tests/security/security.test.ts`.

---

## 🎯 5. Regras de Ouro para Manter a Qualidade

1. **Estrutura AAA (Arrange, Act, Assert)**: Mantenha testes legíveis e estruturados.
2. **Independência de Estado**: Sempre limpe o `localStorage` no `beforeEach`.
3. **Verificação de Linter e Tipos**: Execute `npm run lint` e `npx tsc --noEmit` antes dos commits.
