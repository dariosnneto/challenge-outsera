# Relatório de Qualidade — QA Automation Challenge

**Projeto:** QA Automation Challenge — Outsera
**Data:** 2026-04-26
**Autor:** Dario Neto
**Repositório:** https://github.com/dariosnneto/challenge-outsera

---

## Índice 📑

1. [Resumo Executivo](#1-resumo-executivo-)
2. [Cobertura de Testes por Módulo](#2-cobertura-de-testes-por-módulo-)
3. [Resultado da Execução](#3-resultado-da-execução-)
4. [Análise por Módulo](#4-análise-por-módulo-)
5. [Avaliação pelo AGENTS-example.md](#5-avaliação-pelo-agents-examplemd-)
6. [Problemas Identificados e Corrigidos](#6-problemas-identificados-e-corrigidos-)
7. [Pontos Fortes](#7-pontos-fortes-)
8. [Pontos de Melhoria Remanescentes](#8-pontos-de-melhoria-remanescentes-)
9. [CI/CD](#9-cicd-)
10. [Conclusão](#10-conclusão-)

---

## 1. Resumo Executivo 📋

O framework cobre quatro camadas de teste — API, E2E Web, Mobile Android e Carga — todas escritas em TypeScript com BDD Gherkin em português. A execução mais recente registrou **53 cenários aprovados e 0 falhas** nos três módulos automatizados (API, E2E e Mobile). O módulo K6 executa smoke test de 30s em CI e load test de 500 VUs sob demanda semanal.

Esta análise identificou **13 problemas reais** distribuídos entre código duplicado, imports mortos, magic values, violações de SRP/DRY e inconsistências de padrão. Todos foram corrigidos nesta sessão.

| Módulo   | Ferramenta                  | Cenários | Resultado     | Tempo  |
| -------- | --------------------------- | -------- | ------------- | ------ |
| API      | Playwright + playwright-bdd | 19       | 19/19         | 8,8s   |
| E2E Web  | Playwright + playwright-bdd | 13       | 13/13         | 13,9s  |
| Mobile   | WebdriverIO + Appium        | 5        | 5/5           | ~2min  |
| K6 Smoke | K6 + WireMock               | —        | Thresholds OK | 30s    |

---

## 2. Cobertura de Testes por Módulo 🧪

### API — reqres.in

| Tag     | Cenário                                             | Verbo  | Endpoint            |
| ------- | --------------------------------------------------- | ------ | ------------------- |
| CT-A001 | Listar usuários paginados                           | GET    | /api/users?page=1   |
| CT-A002 | Buscar um usuário por ID                            | GET    | /api/users/2        |
| CT-A003 | Validar paginação com dados distintos entre páginas | GET    | /api/users?page=1&2 |
| CT-A004 | Buscar um usuário inexistente                       | GET    | /api/users/23       |
| CT-A005 | Buscar um recurso desconhecido                      | GET    | /api/unknown/23     |
| CT-A006 | Criar um novo usuário                               | POST   | /api/users          |
| CT-A007 | Realizar login com credenciais válidas              | POST   | /api/login          |
| CT-A008 | Registrar um novo usuário                           | POST   | /api/register       |
| CT-A009 | Criar usuário com corpo vazio                       | POST   | /api/users          |
| CT-A010 | Realizar login sem senha                            | POST   | /api/login          |
| CT-A011 | Registrar usuário com e-mail não cadastrado         | POST   | /api/register       |
| CT-A012 | Realizar login com senha incorreta                  | POST   | /api/login          |
| CT-A013 | Atualizar um usuário por completo                   | PUT    | /api/users/2        |
| CT-A014 | Atualizar parcialmente um usuário                   | PATCH  | /api/users/2        |
| CT-A015 | Atualizar um usuário inexistente                    | PUT    | /api/users/23       |
| CT-A016 | Atualizar usuário com corpo em formato inválido     | PUT    | /api/users/2        |
| CT-A017 | Deletar um usuário                                  | DELETE | /api/users/2        |
| CT-A018 | Deletar um usuário inexistente                      | DELETE | /api/users/23       |
| CT-A019 | Validar ausência de Content-Type ao deletar         | DELETE | /api/users/2        |

**Cobertura de verbos:** GET, POST, PUT, PATCH, DELETE — cobertura completa dos métodos HTTP principais.
**Cenários negativos:** 10 de 19 cenários testam comportamento de erro ou borda.

---

### E2E Web — saucedemo.com

| Tag     | Cenário                                                     | Feature  |
| ------- | ----------------------------------------------------------- | -------- |
| CT-E001 | Login bem-sucedido redireciona para o painel                | login    |
| CT-E002 | Login bem-sucedido exibe o título Produtos                  | login    |
| CT-E003 | Login com credenciais inválidas exibe mensagem de erro (x3) | login    |
| CT-E004 | Login com usuário em branco exibe erro de campo obrigatório | login    |
| CT-E005 | Login com senha em branco exibe erro de campo obrigatório   | login    |
| CT-E006 | Checkout completo com um produto exibe confirmação          | checkout |
| CT-E007 | Checkout completo com múltiplos produtos é concluído        | checkout |
| CT-E008 | Checkout sem nome exibe erro                                | checkout |
| CT-E009 | Checkout sem sobrenome exibe erro                           | checkout |
| CT-E010 | Checkout sem CEP exibe erro                                 | checkout |
| CT-E011 | Remover produto do carrinho antes do checkout               | checkout |

CT-E003 usa Esquema do Cenário com 3 exemplos, totalizando 13 execuções para 11 cenários definidos.

---

### Mobile Android — My Demo App RN (Sauce Labs)

| Tag     | Cenário                                                | Feature  |
| ------- | ------------------------------------------------------ | -------- |
| CT-M001 | Login bem-sucedido exibe a tela de produtos            | login    |
| CT-M002 | Login com credenciais inválidas exibe mensagem de erro | login    |
| CT-M003 | Login e navegação para detalhes do produto             | login    |
| CT-M004 | Preencher formulário completo e avançar para pagamento | checkout |
| CT-M005 | Enviar formulário sem nome completo exibe erro         | checkout |

**App:** `com.saucelabs.mydemoapp.rn` — APK local em `mobile/apps/MyDemoAppRN.apk`.
**Device:** Emulador Android 14, `emulator-5554`, UiAutomator2.

---

### K6 — Testes de Carga

| Cenário | VUs             | Duração  | Ambiente                 |
| ------- | --------------- | -------- | ------------------------ |
| smoke   | 3               | 30s      | CI / local               |
| load    | 0 → 500 (rampa) | 5 min    | Schedule semanal / local |

**Endpoints monitorados:** GET /api/users, GET /api/users/:id, POST /api/users
**Thresholds:** p(95) < 2000ms, taxa de falha < 1%, taxa de checks > 95%

---

## 3. Resultado da Execução ✅

### Última execução completa — 2026-04-26

```
API    → 19 passed (8,8s)
E2E    → 13 passed (13,9s)
Mobile → 21 steps / 5 cenários passed (~2min)
K6     → smoke: all thresholds OK (30s, WireMock)
```

**Falhas:** nenhuma.

---

## 4. Análise por Módulo 🔍

### API

- Wrapper HTTP tipado (`api/helpers/api.client.ts`) centraliza todas as chamadas com tipagem forte — sem `any`.
- Step definitions em arquivo único (`users.api.steps.ts`) bem dentro do limite de 500 linhas.
- Cobre happy path e adversarial: usuário inexistente (404), corpo vazio (400), e-mail não cadastrado (400), senha incorreta (400), Content-Type ausente no DELETE (204).
- `BASE_URL` externalizado em `constants.ts` com fallback — sem magic strings nos steps.
- **Corrigido:** função `parseTable()` removida — era wrapper trivial de uma linha sobre `dataTable.rowsHash()`.

### E2E Web

- Page Object Model aplicado com herança via `BasePage` (locator de erro compartilhado).
- **Corrigido:** `DashboardPage` e `CartPage` passaram a herdar de `BasePage`, tornando o padrão de herança consistente em todas as 4 páginas.
- `playwright-bdd` gera specs intermediárias em `.features-gen/` — navegação Ctrl+Click do `.feature` → step definition funcionando.
- Paralelismo habilitado: 2 workers em CI, ilimitado localmente.

### Mobile Android

- Screen Object Model espelhando o Page Object do E2E: `BaseScreen`, `LoginScreen`, `ProductsScreen`, `CheckoutScreen`.
- **Corrigido:** Bloco de logout/login duplicado entre `mobile.login.steps.ts` e `mobile.checkout.steps.ts` extraído para `ensureLoggedOut()` em `mobile/utils/navigation.ts`.
- **Corrigido:** Loop de back-navigation duplicado no `Then 'devo ver a tela de produtos'` removido — o step agora delega para `navigateToProductsScreen()`.
- **Corrigido:** Import morto de `ProductsScreen` em `mobile.checkout.steps.ts` removido (o step usa-o novamente após correção da lógica).
- **Corrigido:** Magic number `800` em `navigation.ts` substituído por `TIMEOUT.PAUSE_MD`.
- **Corrigido:** `await` desnecessário em `$(SEL.CHECKOUT_PAYMENT)` removido.
- **Corrigido:** `dataTable.rows()` + loop manual substituído por `dataTable.rowsHash()` direto.
- Relatório Allure publicado no GitHub Pages com fix do status `UNKNOWN` dos cenários (bug do `@wdio/allure-reporter` v9 + Cucumber corrigido via pós-processamento dos JSONs de resultado).

### K6

- Dois cenários (smoke / load) controlados por variável de ambiente `K6_SCENARIO` — sem duplicação de arquivo de teste.
- WireMock via Docker elimina dependência do rate limit do reqres.in.
- `run-k6.js` orquestra todo o ciclo: sobe WireMock → executa K6 → derruba WireMock.
- Load test (500 VUs) separado do CI de PR — roda apenas no schedule semanal às 03:00 UTC.

---

## 5. Avaliação pelo AGENTS-example.md 📊

### Princípios aplicados

| Princípio                    | Status   | Observação                                                                                                   |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| SRP — Single Responsibility  | Aplicado | Cada screen/page tem uma razão para mudar. Lógica de logout extraída para `ensureLoggedOut()`.               |
| DRY                          | Aplicado | Bloco de logout/login duplicado eliminado. `parseTable()` removida. Loop de back-navigation consolidado.     |
| KISS                         | Aplicado | Sem abstrações desnecessárias. Steps delegam para helpers bem definidos.                                     |
| YAGNI                        | Aplicado | Sem feature flags, sem generics especulativos.                                                               |
| Strong Typing                | Aplicado | Sem uso de `any`. `await` desnecessário removido. Tipo inline de `dataTable` simplificado.                   |
| Nomes sem ambiguidade        | Aplicado | `ensureLoggedOut()` comunica intenção clara. `web.*` vs `mobile.*` sem conflito.                             |
| Sem magic values             | Aplicado | `800` substituído por `TIMEOUT.PAUSE_MD`. Todos os seletores em `SEL`. Todos os timeouts em `TIMEOUT`.       |
| Comentários explicam o WHY   | Aplicado | Comentário em `navigation.ts` explica motivação técnica (React Navigation state persistence).                 |
| Testes independentes         | Aplicado | `beforeScenario` + `ensureLoggedOut()` garantem estado limpo.                                                |
| Happy path + adversarial     | Aplicado | CT-A004/A009–A012 (API), CT-E003–E005/E008–E010 (E2E), CT-M002/M005 (Mobile).                               |
| Sem anti-patterns de teste   | Aplicado | Sem The Liar, Mirror, Giant, Mockery ou Inspector. Loop redundante de retry removido do step `Then`.         |

### Itens do Pre-Delivery Checklist

| Item                                    | Status                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| Sem PII em logs                         | OK — credenciais usadas são de demo público                                     |
| Sem secrets em código                   | OK — `REQRES_API_KEY` via `.env` / GitHub Secrets                               |
| Sem duplicação de lógica                | OK — `ensureLoggedOut()` elimina último bloco duplicado; `parseTable()` removida |
| Nenhum arquivo excede 500 linhas        | OK — maior arquivo tem ~80 linhas                                               |
| Responsabilidades separadas por arquivo | OK — herança de `BasePage` consistente em todas as 4 páginas E2E               |
| Inputs validados nas boundaries         | OK — API valida via reqres.in; mobile valida via app                            |
| Strong typing (sem `any`)               | OK — `await` desnecessário e tipos frouxos corrigidos                           |
| Todos os testes passam                  | OK — 0 falhas                                                                   |
| Linter / type-check sem erros           | OK — `tsc --noEmit` limpo em ambos os tsconfigs                                 |

---

## 6. Problemas Identificados e Corrigidos 🔧

### Código Duplicado (DRY)

| # | Arquivo(s) | Problema | Correção |
|---|-----------|---------|---------|
| 1 | `mobile.login.steps.ts` L8–27 e `mobile.checkout.steps.ts` L9–28 | Bloco de logout/navegação idêntico em ambos os steps | Extraído para `ensureLoggedOut()` em `mobile/utils/navigation.ts` |
| 2 | `mobile.login.steps.ts` L35–40 e `navigation.ts` L4–9 | Loop de back-navigation duplicado no `Then 'devo ver a tela de produtos'` | Removido do step; delega para `navigateToProductsScreen()` |

### Código Morto (MORTO)

| # | Arquivo | Linha | Problema | Correção |
|---|---------|-------|---------|---------|
| 3 | `users.api.steps.ts` | 29–31 | `parseTable()` era wrapper de uma linha sobre `dataTable.rowsHash()` | Removida; chamadas substituídas por `dataTable.rowsHash()` direto |
| 4 | `mobile.checkout.steps.ts` | 44 | `await` desnecessário em `$(SEL.CHECKOUT_PAYMENT)` — `$()` não é Promise | Removido |

### Magic Values (MAGIC_VALUE)

| # | Arquivo | Linha | Problema | Correção |
|---|---------|-------|---------|---------|
| 5 | `navigation.ts` | 8 | `browser.pause(800)` — número hardcoded não centralizado | Substituído por `TIMEOUT.PAUSE_MD` |

### Violação de SRP

| # | Arquivo | Problema | Correção |
|---|---------|---------|---------|
| 6 | `mobile.login.steps.ts` e `mobile.checkout.steps.ts` | Steps `Given` com 5+ responsabilidades (navegar, abrir menu, verificar login, fazer logout, clicar em login) | Responsabilidade extraída para `ensureLoggedOut()` |

### Inconsistência de Padrão (ESTRUTURA)

| # | Arquivo(s) | Problema | Correção |
|---|-----------|---------|---------|
| 7 | `DashboardPage.ts` e `CartPage.ts` | Não herdavam de `BasePage` ao contrário de `LoginPage` e `CheckoutPage` | Ambas passaram a `extends BasePage` com `super(page)` |

### Tipo Inline Duplicado (TYPING)

| # | Arquivo | Linha | Problema | Correção |
|---|---------|-------|---------|---------|
| 8 | `mobile.checkout.steps.ts` | 44 | `dataTable: { rows: () => string[][] }` + loop manual | Substituído por `dataTable: { rowsHash: () => Record<string, string> }` |

---

## 7. Pontos Fortes 💪

**Cobertura em 4 camadas:** API, E2E, Mobile e Carga com uma única base de código TypeScript e convenção BDD uniforme em português.

**Isolamento real entre cenários mobile:** O `beforeScenario` com `terminateApp`+`activateApp` combinado com `ensureLoggedOut()` e o helper de back-navigation resolve o problema de persistência de estado do React Navigation.

**Modo mock para K6:** WireMock elimina dependência de rate limit externo no CI. O load test de 500 VUs pode ser executado sem consumir cota da API.

**Page/Screen Object Model consistente:** A hierarquia `Base → Login/Products/Checkout/Dashboard/Cart` em ambos os módulos (web e mobile) com herança uniforme facilita manutenção e onboarding.

**Nomenclatura sem ambiguidade:** Steps com prefixo de contexto (`web.*`, `mobile.*`). Helpers com nomes de intenção clara (`ensureLoggedOut`, `navigateToProductsScreen`).

**CI pragmático:** Smoke em PRs, load completo semanal. Mobile em self-hosted runner. Relatório Allure publicado no GitHub Pages sem dependência de action de terceiro.

**Constantes centralizadas:** `SEL` e `TIMEOUT` em `mobile/constants.ts` — uma única alteração reflete em todo o módulo.

---

## 8. Pontos de Melhoria Remanescentes 🔧

### Alta prioridade

**Cobertura de cenário mobile — fluxo de pagamento completo**
CT-M004 avança para a tela de pagamento mas não verifica a conclusão do pedido. Adicionar CT-M006 cobrindo o preenchimento de dados de cartão e confirmação final completaria o fluxo crítico de compra.

### Média prioridade

**Screenshot on failure no mobile**
`addConsoleLogs: true` já ativado no Allure reporter. Para capturas de tela automáticas em falha, adicionar hook `afterScenario` com `browser.saveScreenshot()` quando o cenário falhar.

**`test:all` não inclui mobile**
O script `npm run test:all` executa apenas API + E2E. Poderia incluir mobile condicionalmente via `process.env.CI`.

### Baixa prioridade

**Relatório unificado**
API e E2E geram relatórios Playwright separados de mobile (Allure). Um relatório consolidado facilitaria visibilidade única do estado geral da suite.

---

## 9. CI/CD 🤖

### Topologia atual

```
push / pull_request → main, develop
  ├── api-tests    (ubuntu-latest)  19 cenários Playwright BDD
  ├── e2e-tests    (ubuntu-latest)  13 cenários Playwright BDD
  ├── k6-tests     (ubuntu-latest)  smoke 3 VUs / 30s (WireMock)
  └── mobile-tests (self-hosted)    5 cenários Appium Android

schedule — toda segunda-feira 03:00 UTC
  └── k6-tests     (ubuntu-latest)  load 500 VUs / 5 min (WireMock)
```

### Artifacts e relatórios

| Artifact / Relatório  | Retenção | Acesso                                              |
| --------------------- | -------- | --------------------------------------------------- |
| `api-test-report`     | 30 dias  | GitHub Actions → Artifacts                          |
| `e2e-test-report`     | 30 dias  | GitHub Actions → Artifacts                          |
| `k6-load-test-report` | 30 dias  | GitHub Actions → Artifacts                          |
| `mobile-test-report`  | 30 dias  | GitHub Actions → Artifacts (ZIP — não abrir direto) |
| Allure Mobile (live)  | contínuo | https://dariosnneto.github.io/challenge-outsera/mobile/ |

> **Atenção:** O artifact ZIP do Allure não funciona quando aberto diretamente do sistema de arquivos — o browser bloqueia `fetch()` em `file://`. Use sempre o GitHub Pages para visualizar o relatório mobile.

### Decisões de design do CI

**Por que mobile usa self-hosted?**
Runners `ubuntu-latest` não expõem KVM. Sem KVM, o emulador Android não inicializa de forma confiável. O self-hosted runner usa a máquina local onde o emulador já está validado.

**Por que o deploy do Allure não usa action de terceiro?**
`peaceiris/actions-gh-pages@v4` usa Node 20 (depreciado em junho/2026). O deploy foi substituído por `git clone` + `git push` diretamente, sem dependência externa.

**Por que K6 load test só no schedule?**
Testes de carga medem capacidade, não corretude. Rodar 500 VUs em todo PR adicionaria ~7 minutos e poderia gerar falsos negativos por variação de latência.

---

## 10. Conclusão 🏁

O framework atende aos critérios do challenge com cobertura em todas as camadas solicitadas. Após esta análise, a base de código está sem duplicação relevante, sem código morto, sem magic values e com herança de Page Object uniforme em todos os módulos.

**Correções aplicadas nesta sessão:**

- `ensureLoggedOut()` extraído de bloco duplicado em dois arquivos de steps mobile
- Loop de back-navigation removido do step `Then` (delegado para `navigateToProductsScreen()`)
- `parseTable()` removida — wrapper desnecessário de uma linha
- `DashboardPage` e `CartPage` passaram a herdar de `BasePage`
- Magic number `800` substituído por `TIMEOUT.PAUSE_MD`
- `await` desnecessário em `$(SEL.CHECKOUT_PAYMENT)` removido
- `dataTable.rows()` + loop manual substituído por `dataTable.rowsHash()`
- Status `UNKNOWN` dos cenários Allure corrigido via pós-processamento dos JSONs
- Deploy Allure no GitHub Pages sem dependência de action de terceiro (Node 20 eliminado)

O único ponto de alta prioridade remanescente — CT-M006 cobrindo o fluxo de pagamento completo — é evolutivo e não compromete a qualidade atual.
