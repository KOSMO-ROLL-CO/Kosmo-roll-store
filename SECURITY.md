# Segurança

## Reportando vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança no Kosmo Roll, evite abrir uma issue pública com detalhes exploráveis.

Prefira reportar de forma privada aos mantenedores do repositório, incluindo:

- descrição do problema;
- impacto potencial;
- passos mínimos para reprodução;
- evidências relevantes, sem incluir segredos reais.

## Controles automatizados

O projeto executa verificações automatizadas de segurança no GitHub Actions:

- `npm audit` para vulnerabilidades conhecidas em dependências de produção;
- CodeQL para análise estática de JavaScript/TypeScript;
- Dependency Review para mudanças de dependências em pull requests;
- Dependabot para atualizações periódicas de dependências.
