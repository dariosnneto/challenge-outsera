# QA Automation Challenge — Outsera

Framework de automação de testes cobrindo **API REST** (reqres.in) e **E2E web** (saucedemo.com) com BDD em Gherkin (Português), usando Playwright + TypeScript.

---

## Estrutura de Pastas

```text
challenge-outsera/
├── api/
│   ├── features/        # Cenários BDD — GET/POST/PUT/DELETE /api/users
│   ├── helpers/         # ApiClient — wrapper tipado sobre APIRequestContext
│   ├── steps/           # Step definitions de API
│   └── tests/           # Specs Playwright puras (sem BDD)
├── e2e/
│   ├── features/        # Cenários BDD — login e checkout
│   ├── pages/           # Page Object Model (Login, Dashboard, Cart, Checkout)
│   ├── steps/           # Step definitions E2E
│   └── support/         # World — contexto compartilhado entre steps
├── .github/workflows/   # Pipeline CI/CD (GitHub Actions)
├── playwright.config.ts # 3 projetos: api | api-bdd | e2e
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
npm run test:api   # specs de API (Playwright puro)
npx playwright test --project=api-bdd   # API + BDD
npm run test:e2e   # E2E + BDD
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
