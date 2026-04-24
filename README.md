# 🧪 QA Automation Challenge — Outsera

Framework de automação de testes cobrindo **API REST** (reqres.in), **E2E web** (saucedemo.com) e **testes de carga** (K6) com BDD em Gherkin (Português), usando Playwright + TypeScript + K6.

---

## Índice

1. 🛠️ [Stack](#stack)
2. 📁 [Estrutura de Pastas](#estrutura-de-pastas)
3. ⚙️ [Instalação](#instalação)
4. 🔑 [Variáveis de Ambiente](#variáveis-de-ambiente)
5. 🔌 [Testes de API](#testes-de-api)
6. 🌐 [Testes E2E](#testes-e2e)
7. 🚀 [Testes de Carga K6](#testes-de-carga-k6)
8. 📈 [Relatórios](#relatórios)
9. 🤖 [CI — GitHub Actions](#ci--github-actions)
10. 📜 [Scripts disponíveis](#scripts-disponíveis)

---

## Stack 🛠️

| Ferramenta         | Versão   | Função                                   |
| ------------------ | -------- | ---------------------------------------- |
| Node.js            | >= 24    | Runtime                                  |
| TypeScript         | ^5.4     | Tipagem estática                         |
| Playwright         | ^1.44    | Runner de testes API e E2E               |
| playwright-bdd     | ^7.4     | Integração Gherkin + Playwright          |
| @cucumber/cucumber | ^10.8    | Runner alternativo Cucumber (legado)     |
| K6                 | >= 0.50  | Testes de carga                          |
| k6-html-reporter   | ^1.0.5   | Relatório HTML do K6                     |
| WireMock           | latest   | Mock server para K6 (via Docker)         |
| dotenv             | ^17      | Variáveis de ambiente                    |

---

## Estrutura de Pastas 📁

```text
challenge-outsera/
├── api/
│   ├── features/
│   │   ├── users.get.feature        # CT-A001–CT-A005  (5 cenários)
│   │   ├── users.post.feature       # CT-A006–CT-A012  (7 cenários)
│   │   ├── users.put.feature        # CT-A013–CT-A016  (4 cenários)
│   │   └── users.delete.feature     # CT-A017–CT-A019  (3 cenários)
│   ├── helpers/
│   │   ├── api.client.ts            # Wrapper tipado HTTP: get, post, put, patch, delete
│   │   └── constants.ts             # BASE_URL com fallback para reqres.in
│   └── steps/
│       └── users.api.steps.ts       # Step definitions Given/Then — todos os CT-Axxx
│
├── e2e/
│   ├── features/
│   │   ├── login.feature            # CT-E001–CT-E005  (5 cenários)
│   │   └── checkout.feature         # CT-E006–CT-E011  (6 cenários)
│   ├── pages/
│   │   ├── BasePage.ts              # Locator de erro compartilhado (abstract)
│   │   ├── LoginPage.ts             # navigate(), login(), getErrorMessage()
│   │   ├── DashboardPage.ts         # getTitle(), addProductToCart(), goToCart()
│   │   ├── CartPage.ts              # getCartItems(), proceedToCheckout(), removeItem()
│   │   └── CheckoutPage.ts          # fillForm(), continue(), finish(), getConfirmationMessage()
│   ├── steps/
│   │   ├── login.steps.ts           # Step definitions CT-E001–CT-E005
│   │   └── checkout.steps.ts        # Step definitions CT-E006–CT-E011
│   └── bdd.setup.ts                 # Global setup — executa bddgen antes dos testes
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
│       └── ci.yml                   # Pipeline: 3 jobs em paralelo + schedule semanal K6
├── docker-compose.yml               # Serviço WireMock na porta 8080
├── playwright.config.ts             # 2 projetos BDD: api | e2e
├── cucumber.js                      # Config runner legado cucumber-js
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

O `run-k6.js` espera o binário em `C:\Program Files\k6\k6.exe` no Windows e `k6` no PATH no Linux/macOS.

---

## Variáveis de Ambiente 🔑

Crie o arquivo `.env` na raiz do projeto:

```env
# Chave de API do reqres.in — obtenha em https://app.reqres.in/api-keys
REQRES_API_KEY=sua_chave_aqui

# Opcional — URL base da API (padrão: https://reqres.in)
BASE_URL_API=https://reqres.in

# Opcional — URL base do E2E (padrão: https://www.saucedemo.com)
BASE_URL_E2E=https://www.saucedemo.com

# Opcional — credenciais SauceDemo (padrão: standard_user / secret_sauce)
SAUCE_USERNAME=standard_user
SAUCE_PASSWORD=secret_sauce
```

> O arquivo `.env` está no `.gitignore` — nunca commite credenciais reais.

---

## Testes de API 🔌

19 cenários BDD cobrindo GET, POST, PUT, PATCH e DELETE na API reqres.in.

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

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar um cenário específico por tag
npx playwright test --project=e2e --grep "@CT-E006-CHECKOUT-COMPLETO-COM-UM-PRODUTO"
```

---

## Testes de Carga K6 🚀

### Cenários disponíveis

| Cenário | VUs | Duração | Uso |
| ------- | --- | ------- | --- |
| **smoke** | 3 VUs | 30s | Validação rápida em CI e desenvolvimento |
| **load** | 0 → 500 VUs | 5 min (rampa) | Teste de capacidade — executar manualmente ou via schedule |

O cenário é controlado pela variável de ambiente `K6_SCENARIO`:

- `K6_SCENARIO=smoke` → smoke test (3 VUs, 30s)
- ausente → load test completo (500 VUs, 5 min)

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
# Smoke com mock (3 VUs, 30s) — ~35 segundos no total
K6_SCENARIO=smoke npm run test:k6:mock

# Load completo com mock (500 VUs, 5 min)
npm run test:k6:mock

# Load completo com mock + relatório HTML
npm run test:k6:mock:report
```

**Saída esperada (smoke):**

```text
[mock] Starting WireMock...
[mock] WireMock ready. Running K6 against http://localhost:8080/api

✓ status is 200
✓ response time < 2000ms
✓ body has 'data'
✓ status is 201
✓ body has 'id'

checks.........................: 100.00%
http_req_failed................: 0.00%
http_req_duration p(95)........: < 2000ms

[mock] Stopping WireMock...
```

**Controle manual do WireMock:**

```bash
# Subir o WireMock
npm run wiremock:up

# Verificar saúde
curl http://localhost:8080/__admin/health

# Testar stubs manualmente
curl http://localhost:8080/api/users?page=1
curl http://localhost:8080/api/users/1
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"test","job":"dev"}'

# Derrubar o WireMock
npm run wiremock:down
```

---

### Executar K6 diretamente (sem o orquestrador Node)

```bash
# Smoke contra WireMock (subir WireMock antes com npm run wiremock:up)
"C:\Program Files\k6\k6.exe" run \
  --vus 3 --duration 30s \
  --env BASE_URL=http://localhost:8080/api \
  --env K6_SCENARIO=smoke \
  k6/load-test.ts

# Smoke contra reqres.in
"C:\Program Files\k6\k6.exe" run \
  --vus 3 --duration 30s \
  --env REQRES_API_KEY=sua_chave \
  --env K6_SCENARIO=smoke \
  k6/load-test.ts
```

---

### Relatório HTML do K6 📊

O relatório é gerado a partir do JSON produzido pelo `handleSummary()` em `load-test.ts`. Ele é gravado automaticamente em `reports/k6/summary-handleSummary.json` ao final de cada execução.

```bash
# Gerar relatório HTML após uma execução
node k6/generate-report.js

# Ou usar o script combinado
npm run test:k6:mock:report
```

O relatório HTML fica em `reports/k6/index.html`.

---

### Troubleshooting K6 🔧

| Problema | Causa | Solução |
| -------- | ----- | ------- |
| `http_req_failed rate = 99%` | Rate limit 429 do reqres.in free tier | Usar modo mock: `npm run test:k6:mock` |
| `WireMock did not start in time` | Docker não iniciou a tempo | Verificar se Docker está rodando; aumentar `retries` em `run-k6.js` |
| `Cannot find module './helpers/http-client'` | K6 v1.7+ exige extensão `.ts` | Os imports já incluem `.ts` — verificar versão do K6 |
| `k6: command not found` | K6 não instalado ou fora do PATH | Instalar K6 conforme instruções acima |
| Relatório HTML vazio | `summary-handleSummary.json` não gerado | Executar o teste antes de gerar o relatório |

---

## Relatórios 📈

| Relatório | Caminho | Como gerar |
| --------- | ------- | ---------- |
| Playwright HTML | `reports/html/` | Gerado automaticamente após os testes |
| Playwright JSON | `reports/results.json` | Gerado automaticamente após os testes |
| Cucumber BDD HTML | `reports/cucumber-bdd.html` | Gerado automaticamente após os testes |
| K6 HTML | `reports/k6/index.html` | `npm run test:k6:mock:report` |
| K6 JSON (handleSummary) | `reports/k6/summary-handleSummary.json` | Gerado automaticamente pelo K6 |

```bash
# Abrir relatório Playwright no browser
npm run report
```

---

## CI — GitHub Actions 🤖

O pipeline executa **3 jobs em paralelo** a cada push ou PR para `main` e `develop`.

```text
push / pull_request
  ├── api-tests    (Playwright API BDD — 19 cenários)
  ├── k6-tests     (K6 smoke — 3 VUs, 30s, WireMock mock)
  └── e2e-tests    (Playwright E2E BDD — 11 cenários)

schedule (toda segunda-feira às 03:00 UTC)
  ├── api-tests    (igual)
  ├── k6-tests     (K6 load completo — 500 VUs, 5 min, WireMock mock)
  └── e2e-tests    (igual)
```

### Por que smoke no CI e load no schedule?

Testes de carga (500 VUs, 5 min) não pertencem ao pipeline de PR — seu objetivo é medir capacidade, não corretude. Rodá-los em todo push desperdiçaria ~7 minutos de runner e poderia causar falsos negativos por timeout. O smoke (30s) valida que os 3 endpoints respondem corretamente sem bloquear o feedback de desenvolvimento.

### Secrets e variáveis necessárias no GitHub

| Nome | Tipo | Descrição |
| ---- | ---- | --------- |
| `REQRES_API_KEY` | Secret | Chave da API reqres.in |
| `BASE_URL_API` | Variable | URL base da API (opcional, padrão: `https://reqres.in`) |
| `BASE_URL_E2E` | Variable | URL base E2E (opcional, padrão: `https://www.saucedemo.com`) |
| `SAUCE_USERNAME` | Secret | Usuário SauceDemo (opcional, padrão: `standard_user`) |
| `SAUCE_PASSWORD` | Secret | Senha SauceDemo (opcional, padrão: `secret_sauce`) |

Artifacts de cada execução ficam disponíveis por **30 dias** na aba **Actions** do repositório:

- `api-test-report`
- `k6-load-test-report`
- `e2e-test-report`

---

## Scripts disponíveis 📜

```bash
npm run test:api              # Testes de API (Playwright BDD)
npm run test:e2e              # Testes E2E (Playwright BDD)
npm run test:all              # API + E2E em sequência
npm run test:e2e:cucumber     # Testes E2E via runner Cucumber legado
npm run report                # Abre relatório Playwright no browser

npm run test:k6               # K6 contra reqres.in (requer REQRES_API_KEY)
npm run test:k6:report        # K6 + geração de relatório HTML
npm run test:k6:mock          # K6 com WireMock via Docker (recomendado)
npm run test:k6:mock:report   # K6 mock + geração de relatório HTML

npm run wiremock:up           # Sobe WireMock manualmente
npm run wiremock:down         # Derruba WireMock
```
