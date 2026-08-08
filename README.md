# 🪐 Kosmo Roll Site

Plataforma de e-commerce e catálogo oficial da **Kosmo Roll** desenvolvida com React, TypeScript, TailwindCSS e Vite.

---

## 🧪 Suíte de Testes Avançada (11 Camadas de Qualidade)

Este projeto possui uma infraestrutura completa de testes automatizados e integração contínua (CI/CD):

- **Guia Completo de Testes e Expansão de Features**: Veja o arquivo [TESTING_GUIDE.md](./TESTING_GUIDE.md) para entender como os testes funcionam e o que adicionar ao criar novas funcionalidades.
- **Matriz de Testes Exploratórios**: Consulte o arquivo [EXPLORATORY_TESTING.md](./EXPLORATORY_TESTING.md) para visualizar os Charters de testes manuais e simulações de Monkey/Fuzz Testing.

### Comandos de Teste

| Comando | Descrição |
| :--- | :--- |
| `npm run test` | Executa testes unitários, integração e resiliência MSW (Vitest) |
| `npm run test:coverage` | Gera relatório de cobertura de código (V8 / HTML em `./coverage`) |
| `npm run test:a11y` | Executa testes de acessibilidade automatizada WCAG 2.1 AA (`@axe-core/playwright`) |
| `npm run test:visual` | Executa testes de regressão visual comparando snapshots de tela pixel-por-pixel |
| `npm run test:perf` | Executa medição de performance LCP e estabilidade de nós no DOM |
| `npm run test:stress` | Executa testes de estresse de renderização e vazamento de memória |
| `npm run test:security` | Executa testes de segurança (XSS, SAST e sanitização) |
| `npm run test:e2e` | Executa os testes de ponta a ponta em navegadores reais com Playwright |
| `npm run test:exploratory` | Executa o teste exploratório automatizado (Fuzzing) |

---

## 🚀 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Rodar linter
npm run lint

# Compilar para produção
npm run build
```
