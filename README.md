# QA Automation Challenge — Outsera

Framework de automação de testes cobrindo **API REST** (reqres.in) e **E2E web** (saucedemo.com) com BDD em Gherkin (Português), usando Playwright + TypeScript.

---

## Estrutura de Pastas

```text
challenge-outsera/
├── api/                                   # Projeto: api (Playwright API + BDD)
│   ├── features/
│   │   ├── users.get.feature              # CT-A001–CT-A005  (5 cenários)
│   │   ├── users.post.feature             # CT-A006–CT-A012  (7 cenários)
│   │   ├── users.put.feature              # CT-A013–CT-A016  (4 cenários)
│   │   └── users.delete.feature           # CT-A017–CT-A019  (3 cenários)
│   ├── helpers/
│   │   ├── api.client.ts                  # ApiClient — wrapper tipado: get, post, put, patch, delete
│   │   │                                  # Interface: ApiResponse<T> (status, headers, body, raw)
│   │   └── constants.ts                   # BASE_URL, REQRES_LOGIN, REQRES_REGISTER
│   └── steps/
│       └── users.api.steps.ts             # Step definitions — Given/Then por cenário CT012–CT030
│
├── e2e/                                   # Projeto: e2e (Playwright Browser + BDD)
│   ├── features/
│   │   ├── login.feature                  # CT-E001–CT-E005  (5 cenários)
│   │   └── checkout.feature               # CT-E006–CT-E011  (6 cenários)
│   ├── pages/
│   │   ├── LoginPage.ts                   # navigate(), login(), getErrorMessage()
│   │   ├── DashboardPage.ts               # getTitle(), addProductToCart(), goToCart()
│   │   ├── CartPage.ts                    # proceedToCheckout(), removeItem(), getCartItems()
│   │   └── CheckoutPage.ts                # fillForm(), continue(), finish(), getConfirmationMessage(), getErrorMessage()
│   ├── steps/
│   │   ├── login.steps.ts                 # Step definitions — CT001–CT005
│   │   └── checkout.steps.ts              # Step definitions — CT006–CT011
│   └── bdd.setup.ts                       # Global setup — executa bddgen antes dos testes
│
├── docs/                                  # Documentação técnica
├── .github/
│   └── workflows/
│       └── ci.yml                         # Pipeline: job api-tests → job e2e-tests
├── playwright.config.ts                   # 2 projetos BDD: api | e2e
├── tsconfig.json
└── package.json
```

---

## Versões

| Ferramenta          | Versão  |
| ------------------- | ------- |
| Node.js             | >= 20   |
| TypeScript          | ^5.4    |
| Playwright          | ^1.44   |
| playwright-bdd      | ^7.4    |
| @cucumber/cucumber  | ^10.8   |
| dotenv              | ^17     |

---

## Instalação

```bash
git clone <url-do-repositorio>
cd challenge-outsera
npm install
npx playwright install chromium
```

Crie o arquivo `.env` na raiz:

```env
REQRES_API_KEY=sua_chave_aqui   # obtenha em https://app.reqres.in/api-keys
```

---

## Executar Testes e Gerar Relatório

### Todos os testes

```bash
npx playwright test --workers=1
```

### Por camada

```bash
npm run test:api                        # API + BDD
npm run test:e2e                        # E2E + BDD
```

### Por tag de cenário

```bash
npx playwright test --grep "@CT013"
npx playwright test --grep "@CT001|@CT002"
```

### Abrir o relatório HTML

```bash
npm run report
```

Os relatórios ficam em `reports/html/` após cada execução. No CI (GitHub Actions), são publicados como artifacts por 30 dias na aba **Actions**.
