# QA Automation Challenge — Outsera

Framework de automação de testes cobrindo **API REST** (reqres.in), **E2E web** (saucedemo.com), **Mobile Android** (My Demo App RN) e **testes de carga** (K6) com BDD em Gherkin (Português), usando Playwright + WebdriverIO + TypeScript + K6.

---

## Índice 📑

1. [Stack](#stack-)
2. [Estrutura de Pastas](#estrutura-de-pastas-)
3. [Instalação](#instalação-)
4. [Variáveis de Ambiente](#variáveis-de-ambiente-)
5. [Testes de API](#testes-de-api-)
6. [Testes E2E](#testes-e2e-)
7. [Testes Mobile](#testes-mobile-)
8. [Testes de Carga K6](#testes-de-carga-k6-)
9. [Relatórios](#relatórios-)
10. [CI — GitHub Actions](#ci--github-actions-)
11. [Scripts disponíveis](#scripts-disponíveis-)

---

## Stack 🛠️

| Ferramenta                   | Versão    | Função                                |
| ---------------------------- | --------- | ------------------------------------- |
| Node.js                      | >= 24     | Runtime                               |
| TypeScript                   | ^5.4      | Tipagem estática                      |
| Playwright                   | ^1.44     | Runner de testes API e E2E            |
| playwright-bdd               | ^7.4      | Integração Gherkin + Playwright       |
| WebdriverIO                  | ^9.27     | Runner de testes Mobile (Appium)      |
| @wdio/cucumber-framework     | ^9.27     | Integração Gherkin + WebdriverIO      |
| Appium                       | ^3.3      | Automação Android                     |
| appium-uiautomator2-driver   | ^7.1      | Driver Android UiAutomator2           |
| @wdio/allure-reporter        | ^9.27     | Relatório Allure para testes mobile   |
| @cucumber/cucumber           | ^10.8     | Runner alternativo Cucumber (legado)  |
| K6                           | >= 0.50   | Testes de carga                       |
| k6-html-reporter             | ^1.0.5    | Relatório HTML do K6                  |
| WireMock                     | latest    | Mock server para K6 (via Docker)      |
| dotenv                       | ^17       | Variáveis de ambiente                 |

---

## Estrutura de Pastas 📁

```text
challenge-outsera/
├── config/
│   └── environments/
│       ├── dev.env              # Variáveis para ambiente de desenvolvimento
│       ├── staging.env          # Variáveis para ambiente de homologação
│       └── prod.env             # Variáveis para ambiente de produção
│
├── api/
│   ├── features/
│   │   ├── users.get.feature        # CT-A001–CT-A004  (4 cenários)
│   │   ├── users.post.feature       # CT-A006–CT-A012  (6 cenários)
│   │   ├── users.put.feature        # CT-A013–CT-A016  (4 cenários)
│   │   └── users.delete.feature     # CT-A017–CT-A018  (2 cenários)
│   ├── helpers/
│   │   ├── api.client.ts            # Wrapper tipado HTTP: get, post, put, putRaw, patch, delete
│   │   └── constants.ts             # BASE_URL com fallback para reqres.in
│   └── steps/
│       ├── common.steps.ts          # Then genéricos: status, headers, campos, ISO date (compartilhados)
│       ├── users.get.steps.ts       # Given/Then específicos — CT-A001–CT-A004
│       ├── users.post.steps.ts      # Given específicos — CT-A006–CT-A012
│       ├── users.put.steps.ts       # Given específicos — CT-A013–CT-A016
│       └── users.delete.steps.ts    # Given específicos — CT-A017–CT-A018
│
├── e2e/
│   ├── features/
│   │   ├── web.login.feature        # CT-E001–CT-E005  (5 cenários)
│   │   └── web.checkout.feature     # CT-E006–CT-E011  (6 cenários)
│   ├── pages/
│   │   ├── BasePage.ts              # waitForPageLoad, waitForUrl, takeScreenshot, getPageTitle (abstract)
│   │   ├── LoginPage.ts             # navigate(), login(), getErrorMessage()
│   │   ├── DashboardPage.ts         # getTitle(), addProductToCart(), goToCart()
│   │   ├── CartPage.ts              # getCartItems(), proceedToCheckout(), removeItem()
│   │   └── CheckoutPage.ts          # fillForm(), continue(), finish(), getConfirmationMessage()
│   ├── steps/
│   │   ├── common.steps.ts          # Given compartilhado: autenticação (reusável por qualquer feature)
│   │   ├── web.login.steps.ts       # Step definitions CT-E001–CT-E005
│   │   └── web.checkout.steps.ts    # Step definitions CT-E006–CT-E011
│   └── bdd.setup.ts                 # Global setup — executa bddgen antes dos testes
│
├── mobile/
│   ├── apps/
│   │   └── MyDemoAppRN.apk          # APK do app de demonstração Sauce Labs
│   ├── config/
│   │   └── wdio.conf.ts             # Configuração WebdriverIO + Appium + Cucumber
│   ├── features/
│   │   ├── mobile.login.feature     # CT-M001–CT-M003  (3 cenários)
│   │   └── mobile.checkout.feature  # CT-M004–CT-M005  (2 cenários + Contexto)
│   ├── screens/
│   │   ├── BaseScreen.ts            # waitForDisplayed(), tap(), typeText(), isDisplayed()
│   │   ├── LoginScreen.ts           # login(), getErrorMessage(), isErrorDisplayed()
│   │   ├── ProductsScreen.ts        # isLoaded(), tapFirstProduct(), tapCart()
│   │   └── CheckoutScreen.ts        # fillForm(), tapToPayment(), isErrorDisplayed()
│   ├── steps/
│   │   ├── mobile.login.steps.ts    # Step definitions CT-M001–CT-M003
│   │   └── mobile.checkout.steps.ts # Step definitions CT-M004–CT-M005
│   └── utils/
│       └── navigation.ts            # ensureLoggedOut(), navigateToProductsScreen()
│
├── k6/
│   ├── helpers/
│   │   ├── http-client.ts           # getUsers(), getUserById(), createUser()
│   │   └── checks.ts                # checkStatus(), checkResponseTime(), checkJsonBody()
│   ├── load-test.ts                 # Cenário principal — smoke ou load via K6_SCENARIO
│   ├── run-k6.js                    # Orquestrador: instala WireMock, executa K6, gera saída
│   └── generate-report.js           # Gera relatório HTML a partir do handleSummary JSON
│
├── wiremock/
│   └── mappings/
│       ├── get-users.json           # Stub GET /api/users?page=*
│       ├── get-user-by-id.json      # Stub GET /api/users/:id
│       └── create-user.json         # Stub POST /api/users
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # Pipeline: 4 jobs — api, e2e, k6 (ubuntu) + mobile (self-hosted)
├── docker-compose.yml               # Serviço WireMock na porta 8080
├── playwright.config.ts             # 2 projetos BDD: api | e2e — carrega config/environments/${ENV}.env
├── tsconfig.json
└── package.json
```

---

## Instalação ⚙️

```bash
git clone https://github.com/dariosnneto/challenge-outsera.git
cd challenge-outsera
npm install
npx playwright install chromium
```

### Pré-requisitos para Mobile

| Requisito | Versão mínima | Descrição |
| --------- | ------------- | --------- |
| Android SDK | API 14+ | `ANDROID_HOME` configurado no ambiente |
| Emulador Android | API 14 | `emulator-5554` em execução antes dos testes |
| Java JDK | 11+ | Necessário para o Appium UiAutomator2 |

O Appium e o driver UiAutomator2 são instalados como dependências do projeto (`npm install`) — não é necessária instalação global.

### Pré-requisitos para K6

| Requisito | Instalação |
| --------- | ---------- |
| **K6** (modo normal, sem mock) | [k6.io/docs/get-started/installation](https://k6.io/docs/get-started/installation/) |
| **Docker** (modo mock com WireMock) | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |

**Windows — instalar K6:**

```powershell
winget install k6 --source winget
# ou via Chocolatey
choco install k6
```

---

## Variáveis de Ambiente 🔑

O projeto suporta **múltiplos ambientes** via arquivos em `config/environments/`. O `playwright.config.ts` carrega automaticamente o arquivo correspondente à variável `ENV` (padrão: `dev`).

### Arquivos de ambiente

```text
config/environments/
├── dev.env       # Desenvolvimento local
├── staging.env   # Homologação
└── prod.env      # Produção
```

Cada arquivo segue a mesma estrutura:

```env
# URL base dos projetos
BASE_URL_E2E=https://www.saucedemo.com
BASE_URL_API=https://reqres.in

# Credenciais SauceDemo
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce

# Chave de API reqres.in — obtenha em https://app.reqres.in/api-keys
# REQRES_API_KEY=sua_chave_aqui
```

Para substituir localmente sem commitar, crie um `.env` na raiz — ele é carregado como fallback após o arquivo de ambiente:

```env
# .env — sobreposição local (não commitado)
REQRES_API_KEY=sua_chave_aqui
SAUCE_USERNAME=performance_glitch_user
```

> Os arquivos `.env` e `.env.*` estão no `.gitignore` — nunca commite credenciais reais. Os arquivos em `config/environments/` contêm apenas valores de referência (sem segredos).

---

## Testes de API 🔌

18 cenários BDD cobrindo GET, POST, PUT, PATCH e DELETE na API reqres.in.

Os steps são organizados em **um arquivo por feature** + um `common.steps.ts` com os `Then` genéricos reutilizados por todos os cenários (validação de status, headers, campos e datas ISO).

```bash
# Executar todos os testes de API
npm run test:api

# Executar um cenário específico por tag
npx playwright test --project=api --grep "@CT-A001-LISTAR-USUARIOS-PAGINADOS"

# Executar múltiplas tags
npx playwright test --project=api --grep "@CT-A006|@CT-A007"
```

---

## Testes E2E 🌐

11 cenários BDD cobrindo login e fluxo de checkout no saucedemo.com.

Os steps seguem a mesma estrutura do módulo API: **um arquivo por feature** + `common.steps.ts` com o step de autenticação compartilhado (`que estou logado como`), reutilizável por qualquer feature futura que exija usuário autenticado.

### Selecionando o ambiente

```bash
# Ambiente padrão (dev)
npm run test:e2e

# Ambiente de desenvolvimento explícito
npm run test:e2e:dev

# Homologação
npm run test:e2e:staging

# Produção
npm run test:e2e:prod

# Ou diretamente com ENV
ENV=staging npx playwright test --project=e2e
```

### Executar por tag

```bash
npx playwright test --project=e2e --grep "@CT-E006-CHECKOUT-COMPLETO-COM-UM-PRODUTO"
```

---

## Testes Mobile 📱

5 cenários BDD cobrindo login e checkout no app Android **My Demo App RN** (Sauce Labs).

**Pré-condição:** emulador `emulator-5554` com Android 14 em execução.

```bash
# Executar todos os testes mobile
npm run test:mobile

# Executar um cenário específico por tag
npx wdio run mobile/config/wdio.conf.ts --cucumberOpts.tagExpression="@CT-M001"

# Gerar e abrir relatório Allure
npm run report:mobile
```

### Cenários cobertos

| Tag | Cenário | Feature |
| --- | ------- | ------- |
| CT-M001 | Login bem-sucedido exibe a tela de produtos | login |
| CT-M002 | Login com credenciais inválidas exibe mensagem de erro | login |
| CT-M003 | Login e navegação para detalhes do produto | login |
| CT-M004 | Preencher formulário completo e avançar para pagamento | checkout |
| CT-M005 | Enviar formulário sem nome completo exibe erro | checkout |

### Configuração do emulador

O arquivo [mobile/config/wdio.conf.ts](mobile/config/wdio.conf.ts) espera:

| Capability | Valor |
| ---------- | ----- |
| `platformName` | `Android` |
| `appium:deviceName` | `emulator-5554` |
| `appium:platformVersion` | `14.0` |
| `appium:automationName` | `UiAutomator2` |
| `appium:app` | `mobile/apps/MyDemoAppRN.apk` |

Para usar um device ou versão diferente, edite `mobile/config/wdio.conf.ts`.

### Isolamento entre cenários

O hook `beforeScenario` em `wdio.conf.ts` executa `terminateApp` + `activateApp` antes de cada cenário, garantindo estado limpo. O helper [mobile/utils/navigation.ts](mobile/utils/navigation.ts) lida com o estado de navegação do React Native, fazendo back-navigation até a tela de produtos quando necessário.

---

## Testes de Carga K6 🚀

### Cenários disponíveis

| Cenário | VUs | Duração | Objetivo |
| ------- | --- | ------- | -------- |
| **smoke** | 0 → 3 → 0 | 30s | Validação rápida — sistema responde antes de qualquer carga |
| **load** | 0 → 500 → 0 | 5 min | Capacidade nominal — rampagem linear escalonada |
| **spike** | 10 → 500 → 10 | ~1m20s | Resiliência a picos abruptos de tráfego |
| **stress** | 0 → 800 → 0 | 10 min | Ponto de ruptura — escalonamento além da capacidade nominal |
| **soak** | 0 → 200 (oscilação) → 0 | ~21 min | Degradação ao longo do tempo — detecta vazamentos de memória |

O cenário é controlado pela variável de ambiente `K6_SCENARIO`:

- `K6_SCENARIO=smoke` → smoke (3 VUs, 30s)
- `K6_SCENARIO=load` → load completo (500 VUs, 5 min) — padrão quando ausente
- `K6_SCENARIO=spike` → spike (500 VUs, pico abrupto)
- `K6_SCENARIO=stress` → stress (800 VUs, escalonamento progressivo)
- `K6_SCENARIO=soak` → soak (200 VUs, oscilação por ~21 min)

### Endpoints testados

| Método | Endpoint | Threshold p(95) |
| ------ | -------- | --------------- |
| GET | `/api/users?page=1` | < 1500ms |
| GET | `/api/users/:id` | < 1500ms |
| POST | `/api/users` | < 2000ms |

**Thresholds globais:**

- `http_req_duration p(95) < 2000ms`
- `http_req_failed rate < 1%`
- `checks rate > 95%`

---

### Modo normal — reqres.in (requer REQRES_API_KEY)

```bash
# Smoke (3 VUs, 30s)
K6_SCENARIO=smoke npm run test:k6

# Load completo (500 VUs, 5 min) — consome cota da API
npm run test:k6

# Com relatório HTML
npm run test:k6:report
```

> **Atenção:** O plano free do reqres.in tem limite de **250 requisições/dia**. O load completo gera ~116k requests em 5 minutos, esgotando a cota imediatamente. Para o load completo, use o **modo mock**.

---

### Modo mock — WireMock via Docker (recomendado)

O modo mock sobe um container WireMock na porta 8080 com stubs dos 3 endpoints, executa o K6 apontando para `http://localhost:8080/api` e derruba o container ao final — sem consumir cota da API externa.

**Requisito:** Docker em execução.

```bash
# Smoke (3 VUs, 30s)
K6_SCENARIO=smoke npm run test:k6:mock

# Load completo (500 VUs, 5 min) + relatório HTML
npm run test:k6:mock:report

# Spike (pico abrupto até 500 VUs)
npm run test:k6:spike

# Stress (escalonamento até 800 VUs)
npm run test:k6:stress

# Soak (oscilação em 200 VUs por ~21 min)
npm run test:k6:soak
```

**Controle manual do WireMock:**

```bash
npm run wiremock:up
curl http://localhost:8080/__admin/health
npm run wiremock:down
```

### Troubleshooting K6

| Problema | Causa | Solução |
| -------- | ----- | ------- |
| `http_req_failed rate = 99%` | Rate limit 429 do reqres.in free tier | Usar modo mock: `npm run test:k6:mock` |
| `WireMock did not start in time` | Docker não iniciou a tempo | Verificar se Docker está rodando |
| `k6: command not found` | K6 não instalado ou fora do PATH | Instalar K6 conforme instruções acima |
| Relatório HTML vazio | `summary-handleSummary.json` não gerado | Executar o teste antes de gerar o relatório |

---

## Relatórios 📈

| Relatório | Caminho | Como gerar |
| --------- | ------- | ---------- |
| Playwright HTML | `reports/html/` | Automático após os testes |
| Playwright JSON | `reports/results.json` | Automático após os testes |
| Cucumber BDD HTML | `reports/cucumber-bdd.html` | Automático após os testes |
| K6 HTML | `reports/k6/index.html` | `npm run test:k6:mock:report` |
| K6 JSON (handleSummary) | `reports/k6/summary-handleSummary.json` | Automático pelo K6 |
| Allure Mobile (local) | `mobile/reports/allure-html/` | `npm run report:mobile` |
| Allure Mobile (CI) | GitHub Pages | Publicado automaticamente a cada push em `main` |

```bash
# Abrir relatório Playwright no browser
npm run report

# Gerar e abrir relatório Allure (mobile)
npm run report:mobile
```

### Relatório Allure Mobile no CI 🌐

O relatório Allure do módulo mobile é publicado automaticamente no **GitHub Pages** após cada execução do CI na branch `main`.

> **Por que não usar o artifact ZIP?** O Allure gera múltiplos arquivos (HTML + JS + JSON). Ao extrair o ZIP e abrir o `index.html` localmente, o browser bloqueia as requisições entre arquivos por política de segurança (`file://`), resultando em tela em branco. O GitHub Pages serve os arquivos via HTTP, resolvendo o problema.

**URL do relatório:** `https://dariosnneto.github.io/challenge-outsera/mobile/`

Acessar a raiz `https://dariosnneto.github.io/challenge-outsera/` redireciona automaticamente para o relatório mobile.

---

## CI — GitHub Actions 🤖

O pipeline executa **4 jobs** a cada push ou PR para `main` e `develop`. Os jobs de API, E2E e K6 rodam em paralelo em `ubuntu-latest`. O job Mobile requer um **self-hosted runner** com emulador Android configurado.

```text
push / pull_request
  ├── api-tests      (ubuntu-latest — Playwright API BDD, 18 cenários)
  ├── k6-tests       (ubuntu-latest — K6 smoke, 3 VUs, 30s, WireMock)
  ├── e2e-tests      (ubuntu-latest — Playwright E2E BDD, 13 cenários)
  └── mobile-tests   (self-hosted   — Appium Android BDD, 5 cenários)

schedule (toda segunda-feira às 03:00 UTC)
  ├── api-tests      (igual)
  ├── k6-tests       (load → spike → stress → soak em sequência, WireMock)
  ├── e2e-tests      (igual)
  └── mobile-tests   (igual)

workflow_dispatch (execução manual seletiva)
  └── qualquer job individualmente via input "job"
```

### Execução manual seletiva

O pipeline suporta disparo manual com seleção de job específico — útil para reexecutar apenas o job que falhou sem aguardar os demais.

**Via GitHub:** Actions → QA Automation CI → Run workflow → selecionar o job

**Via CLI:**

```bash
# Apenas testes mobile
gh workflow run ci.yml --ref main -f job=mobile

# Apenas testes de API
gh workflow run ci.yml --ref main -f job=api

# Apenas testes E2E
gh workflow run ci.yml --ref main -f job=e2e

# Apenas K6
gh workflow run ci.yml --ref main -f job=k6

# Todos os jobs (padrão)
gh workflow run ci.yml --ref main -f job=all
```

> Em push, PR e schedule **todos os jobs continuam rodando normalmente** — o `workflow_dispatch` só ativa quando disparado manualmente.

### Por que mobile usa self-hosted runner?

O GitHub Actions `ubuntu-latest` não disponibiliza KVM (virtualização de hardware) nos runners compartilhados. Sem KVM, o emulador Android roda via software (~10–30x mais lento) e frequentemente não inicializa. O self-hosted runner resolve isso usando a máquina local onde o emulador já está configurado e funcionando.

### Configurar self-hosted runner

1. No repositório GitHub: **Settings → Actions → Runners → New self-hosted runner**
2. Seguir as instruções de instalação para o seu SO
3. O runner precisa ter: Node.js 24, Android SDK, emulador configurado (`emulator-5554`)

### Secrets e variáveis necessárias no GitHub

| Nome | Tipo | Descrição |
| ---- | ---- | --------- |
| `REQRES_API_KEY` | Secret | Chave da API reqres.in |
| `BASE_URL_API` | Variable | URL base da API (opcional, padrão: `https://reqres.in`) |
| `BASE_URL_E2E` | Variable | URL base E2E (opcional, padrão: `https://www.saucedemo.com`) |
| `SAUCE_USERNAME` | Secret | Usuário SauceDemo |
| `SAUCE_PASSWORD` | Secret | Senha SauceDemo |

Artifacts ficam disponíveis por **30 dias** na aba **Actions**:

- `api-test-report`
- `k6-load-test-report`
- `e2e-test-report`
- `mobile-test-report`

---

## Scripts disponíveis 📜

```bash
npm run test:api              # Testes de API (Playwright BDD)
npm run test:e2e              # Testes E2E — ambiente dev (padrão)
npm run test:e2e:dev          # Testes E2E — ambiente dev explícito
npm run test:e2e:staging      # Testes E2E — ambiente de homologação
npm run test:e2e:prod         # Testes E2E — ambiente de produção
npm run test:all              # API + E2E em sequência
npm run test:mobile           # Testes Mobile (WebdriverIO + Appium)
npm run report                # Abre relatório Playwright no browser
npm run report:mobile         # Gera e abre relatório Allure (mobile)

npm run test:k6               # K6 load contra reqres.in (requer REQRES_API_KEY)
npm run test:k6:report        # K6 load + geração de relatório HTML
npm run test:k6:mock          # K6 load com WireMock via Docker (recomendado)
npm run test:k6:mock:report   # K6 load mock + geração de relatório HTML
npm run test:k6:spike         # K6 spike — pico abrupto até 500 VUs (mock)
npm run test:k6:stress        # K6 stress — escalonamento até 800 VUs (mock)
npm run test:k6:soak          # K6 soak — oscilação em 200 VUs por ~21 min (mock)

npm run wiremock:up           # Sobe WireMock manualmente
npm run wiremock:down         # Derruba WireMock
```
