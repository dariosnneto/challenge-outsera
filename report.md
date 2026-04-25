# Relatório de Qualidade — QA Automation Challenge

**Projeto:** QA Automation Challenge — Outsera
**Data:** 2026-04-25
**Autor:** Dario Neto
**Repositório:** https://github.com/dariosnneto/challenge-outsera

---

## Índice 📑

1. [Resumo Executivo](#1-resumo-executivo-)
2. [Cobertura de Testes por Módulo](#2-cobertura-de-testes-por-módulo-)
3. [Resultado da Execução](#3-resultado-da-execução-)
4. [Análise por Módulo](#4-análise-por-módulo-)
5. [Avaliação pelo AGENTS-example.md](#5-avaliação-pelo-agents-examplemd-)
6. [Pontos Fortes](#6-pontos-fortes-)
7. [Pontos de Melhoria](#7-pontos-de-melhoria-)
8. [CI/CD](#8-cicd-)
9. [Conclusão](#9-conclusão-)

---

## 1. Resumo Executivo 📋

O framework cobre quatro camadas de teste — API, E2E Web, Mobile Android e Carga — todas escritas em TypeScript com BDD Gherkin em português. A execução mais recente registrou **53 cenários aprovados e 0 falhas** nos três módulos automatizados (API, E2E e Mobile). O módulo K6 executa smoke test de 30s em CI e load test de 500 VUs sob demanda semanal.

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
**Cenários negativos:** CT-A004, CT-A005, CT-A009–A012, CT-A015, CT-A016, CT-A018, CT-A019 — 10 de 19 cenários testam comportamento de erro ou borda.

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

CT-E003 usa Esquema do Cenário com 3 exemplos (credenciais inválidas distintas), totalizando 13 execuções para 11 cenários definidos.

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

### Última execução completa — 2026-04-25

```
API    → 19 passed (8,8s)
E2E    → 13 passed (13,9s)
Mobile → 21 steps / 5 cenários passed (1m 53s)
K6     → smoke: all thresholds OK (30s, WireMock)
```

**Falhas:** nenhuma.

---

## 4. Análise por Módulo 🔍

### API

- Wrapper HTTP tipado (`api/helpers/api.client.ts`) centraliza todas as chamadas com tipagem forte — sem `any`.
- Step definitions em arquivo único (`users.api.steps.ts`) bem dentro do limite de 500 linhas do AGENTS-example.md.
- Cobre happy path e adversarial: usuário inexistente (404), corpo vazio (400), e-mail não cadastrado (400), senha incorreta (400), Content-Type ausente no DELETE (204).
- `BASE_URL` externalizado em `constants.ts` com fallback — sem magic strings nos steps.

### E2E Web

- Page Object Model aplicado com herança via `BasePage` (locator de erro compartilhado).
- Cada página tem responsabilidade única: `LoginPage`, `DashboardPage`, `CartPage`, `CheckoutPage`.
- `playwright-bdd` gera specs intermediárias em `.features-gen/` — navegação Ctrl+Click do `.feature` → step definition funcionando via extensão `cucumber.cucumber-official`.
- Paralelismo habilitado: 2 workers em CI, ilimitado localmente.
- Steps renomeados para `web.login.steps.ts` e `web.checkout.steps.ts` — sem ambiguidade com os steps mobile.

### Mobile Android

- Screen Object Model espelhando o Page Object do E2E: `BaseScreen`, `LoginScreen`, `ProductsScreen`, `CheckoutScreen`.
- Locators via Accessibility ID (`~content-desc`) descobertos por inspeção real via `adb uiautomator dump` — sem placeholders ou locators frágeis.
- Isolamento entre cenários via `beforeScenario` com `terminateApp` + `activateApp`.
- Helper `navigation.ts` encapsula a lógica de back-navigation necessária para lidar com o estado persistido pelo React Navigation — decisão justificada pela limitação do app (AsyncStorage não é limpo entre cenários).
- Specs agrupadas em array aninhado `[[login.feature, checkout.feature]]` para forçar sessão Appium única e evitar conflito de dois workers no mesmo emulador.
- Steps renomeados para `mobile.login.steps.ts` e `mobile.checkout.steps.ts` — consistente com a convenção do projeto.
- `.vscode/settings.json` atualizado com `cucumber.features` e `cucumber.glue` do mobile — navegação do `.feature` → step definition funciona no VS Code.

### K6

- Dois cenários (smoke / load) controlados por variável de ambiente `K6_SCENARIO` — sem duplicação de arquivo de teste.
- WireMock via Docker elimina dependência do rate limit do reqres.in (250 req/dia no plano free).
- `run-k6.js` orquestra todo o ciclo: sobe WireMock → executa K6 → derruba WireMock.
- Load test (500 VUs) separado do CI de PR — roda apenas no schedule semanal às 03:00 UTC (segunda-feira).

---

## 5. Avaliação pelo AGENTS-example.md 📊

### Princípios aplicados

| Princípio                 | Status        | Observação                                                                                                                 |
| ------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| SRP — Single Responsibility | Aplicado    | Cada screen/page tem uma razão para mudar. Steps separados por contexto (web vs mobile, login vs checkout).                |
| DRY                       | Aplicado      | `BaseScreen` e `BasePage` eliminam duplicação. `navigation.ts` reutilizado em dois arquivos de steps. `SEL` e `TIMEOUT` centralizados em `mobile/constants.ts`. |
| KISS                      | Aplicado      | Sem abstrações desnecessárias. `navigation.ts` tem uma função com ~20 linhas.                                              |
| YAGNI                     | Aplicado      | Sem feature flags, sem generics especulativos.                                                                             |
| Strong Typing             | Aplicado      | Sem uso de `any`. Todos os métodos públicos tipados. Interface explícita para `fillForm()` em `CheckoutScreen`.            |
| Nomes sem ambiguidade     | Aplicado      | `web.login.steps.ts` vs `mobile.login.steps.ts` — sem conflito no auto-complete do Cucumber.                              |
| Sem magic values          | Aplicado      | Todos os seletores mobile centralizados em `SEL`. Todos os timeouts em `TIMEOUT`. Sem literais inline nos steps.          |
| Comentários explicam o WHY | Aplicado     | Onde há comentário (`navigation.ts`), explica o motivo técnico (React Navigation state persistence).                      |
| Testes independentes      | Aplicado      | `beforeScenario` garante estado limpo. Steps não dependem de ordem de execução.                                           |
| Happy path + adversarial  | Aplicado      | CT-A004/A005/A009–A012/A015/A016/A018/A019 (API), CT-E003–E005/E008–E010 (E2E), CT-M002/M005 (Mobile).                   |
| Sem anti-patterns de teste | Aplicado     | Sem The Liar, Mirror, Giant, Mockery ou Inspector. Cada cenário tem uma asserção principal clara.                         |

### Itens do Pre-Delivery Checklist

| Item                                    | Status                                                         |
| --------------------------------------- | -------------------------------------------------------------- |
| Sem PII em logs                         | OK — credenciais usadas são de demo público                    |
| Sem secrets em código                   | OK — `REQRES_API_KEY` via `.env` / GitHub Secrets              |
| Sem duplicação de lógica                | OK — `getFirstProductName()` morto removido; seletores e timeouts centralizados |
| Nenhum arquivo excede 500 linhas        | OK — maior arquivo tem ~80 linhas                              |
| Responsabilidades separadas por arquivo | OK                                                             |
| Inputs validados nas boundaries         | OK — API valida via reqres.in; mobile valida via app           |
| Strong typing (sem `any`)               | OK                                                             |
| Todos os testes passam                  | OK — 0 falhas                                                  |
| Linter / type-check sem erros           | OK — `tsc --noEmit` limpo em ambos os tsconfigs                |

---

## 6. Pontos Fortes 💪

**Cobertura em 4 camadas:** API, E2E, Mobile e Carga com uma única base de código TypeScript e convenção BDD uniforme em português.

**Isolamento real entre cenários mobile:** O `beforeScenario` com `terminateApp`+`activateApp` combinado com o helper de back-navigation resolve o problema de persistência de estado do React Navigation — solução pragmática e documentada.

**Modo mock para K6:** WireMock elimina dependência de rate limit externo no CI. O load test de 500 VUs pode ser executado sem consumir cota da API.

**Page/Screen Object Model consistente:** A hierarquia `Base → Login/Products/Checkout` em ambos os módulos (web e mobile) facilita manutenção e onboarding.

**Nomenclatura sem ambiguidade:** Steps renomeados com prefixo de contexto (`web.*`, `mobile.*`) + configuração do VS Code para navegação Gherkin em todos os módulos.

**CI pragmático:** Smoke em PRs, load completo semanal. Mobile em self-hosted runner — sem comprometer o pipeline principal com dependência de emulador.

**Constantes centralizadas:** `SEL` e `TIMEOUT` em `mobile/constants.ts` eliminam magic strings e magic numbers em todo o módulo mobile. Uma única alteração de seletor ou timeout reflete em todos os arquivos.

---

## 7. Pontos de Melhoria 🔧

### Alta prioridade

**Cobertura de cenário mobile — fluxo de pagamento completo**
CT-M004 avança para a tela de pagamento mas não verifica a conclusão do pedido. Adicionar CT-M006 cobrindo o preenchimento de dados de cartão e confirmação final completaria o fluxo crítico de compra.

### Média prioridade

**Retry automático em CI mobile** *(parcialmente aplicado)*
`retries: 1` já configurado no `wdio.conf.ts` via `process.env.CI`. Considerar também `'appium:noReset': true` nos retries para não reinstalar o APK na segunda tentativa.

**Screenshot on failure no mobile** *(parcialmente aplicado)*
`addConsoleLogs: true` já ativado no Allure reporter. Para capturas de tela automáticas em falha, adicionar `screenshotPath` ao reporter ou implementar o hook `afterScenario` com `browser.saveScreenshot()` quando o cenário falhar.

### Baixa prioridade

**`test:all` não inclui mobile**
O script `npm run test:all` executa apenas API + E2E. Poderia incluir mobile condicionalmente via `process.env.CI` ou separar em `test:all:local`.

**Relatório unificado**
API e E2E geram relatórios Playwright separados de mobile (Allure). Um relatório consolidado facilitaria visibilidade única do estado geral da suite.

---

## 8. CI/CD 🤖

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

### Artifacts gerados por execução

| Artifact             | Retenção | Conteúdo                       |
| -------------------- | -------- | ------------------------------ |
| `api-test-report`    | 30 dias  | HTML + JSON Playwright         |
| `e2e-test-report`    | 30 dias  | HTML + JSON Playwright         |
| `k6-load-test-report`| 30 dias  | HTML K6 + JSON handleSummary   |
| `mobile-test-report` | 30 dias  | HTML Allure                    |

### Decisões de design do CI

**Por que mobile usa self-hosted?**
Runners `ubuntu-latest` do GitHub Actions não expõem KVM. Sem KVM, o emulador Android não inicializa de forma confiável. O self-hosted runner usa a máquina local onde o emulador já está configurado e validado.

**Por que K6 load test só no schedule?**
Testes de carga medem capacidade, não corretude. Rodar 500 VUs em todo PR adicionaria ~7 minutos de espera e poderia gerar falsos negativos por variação de latência do ambiente.

**Por que o type-check está separado por tsconfig?**
O tsconfig raiz valida API + E2E. O `mobile/tsconfig.json` valida o módulo mobile de forma independente. Ambos executam antes dos testes nos seus respectivos jobs, garantindo que nenhum erro de compilação chegue à execução.

---

## 9. Conclusão 🏁

O framework atende aos critérios do challenge com cobertura em todas as camadas solicitadas. A base de código é enxuta, tipada, sem duplicação relevante e segue as convenções do AGENTS-example.md. Os 53 cenários passam de forma estável, o CI executa automaticamente a cada push e todos os pontos de melhoria identificados no relatório anterior foram aplicados:

- Seletores e timeouts mobile centralizados em `mobile/constants.ts`
- Código morto removido (`getErrorMessage()` e `getFirstProductName()` não utilizados)
- `retries: 1` ativado em CI via `process.env.CI`
- `addConsoleLogs: true` no Allure reporter para diagnóstico remoto

O único ponto de alta prioridade restante — CT-M006 cobrindo o fluxo de pagamento completo — é evolutivo e não compromete a qualidade atual.