# Code Review Report — QA Automation Challenge

**Data:** 2026-04-24
**Branch:** k6
**Critério:** AGENTS-example.md
**Escopo:** `api/`, `e2e/`, `k6/`, arquivos de configuração raiz

---

## Resultado

| Categoria | Status |
| --- | --- |
| `npx tsc --noEmit` | ✅ 0 erros |
| Dead code eliminado | ✅ |
| Variável morta eliminada (`outputFile`) | ✅ |
| Comentários WHAT removidos | ✅ |
| DRY — `ApiClient` instanciado N vezes | ✅ |
| Path morto em `cucumber.js` | ✅ |
| Comentários organizacionais sem WHY | ✅ |

---

## §3 — Qualidade de Código

### 3a — Comentários WHAT removidos

**Regra violada:** *"Comments explain WHY, never WHAT."*

#### `api/helpers/api.client.ts`

Bloco JSDoc multi-linha descrevendo o que a classe faz — autoevidente pelo nome, assinaturas e tipos de retorno.

```diff
- /**
-  * Thin wrapper around Playwright's APIRequestContext.
-  * Each method returns a typed ApiResponse so tests can assert on status,
-  * headers, and body without repeating the same json() / status() calls.
-  */
  export class ApiClient {
```

#### `e2e/pages/DashboardPage.ts`

Comentário inline repetindo o que a linha abaixo faz.

```diff
  async addProductToCart(productName: string): Promise<void> {
-   // Locate the inventory item that contains the product name, then click its Add to Cart button
    const item = this.productList.filter({ hasText: productName });
```

---

### 3b — Comentários organizacionais sem WHY removidos

**Regra violada:** *"Comments explain WHY, never WHAT."*

Comentários de seção como `// ─── CT-A001 — Listar usuários paginados` e `// @CT001 | @CT002` não explicam nada não-óbvio — replicam informação que já está no nome do step e na feature file. Removidos de:

- [api/steps/users.api.steps.ts](../api/steps/users.api.steps.ts) — 9 blocos de separador
- [e2e/steps/login.steps.ts](../e2e/steps/login.steps.ts) — 5 comentários de tag CT
- [e2e/steps/checkout.steps.ts](../e2e/steps/checkout.steps.ts) — 9 comentários de tag CT

**Preservado:** o comentário de `checkout.steps.ts` sobre não fazer assert de navegação em `continuo para o resumo do pedido` — explica uma restrição não-óbvia (CT008-CT010 divergem de CT006-CT007 neste mesmo step).

---

## §2 — DRY

### 2a — `ApiClient` instanciado 7 vezes no mesmo arquivo

**Regra violada:** *"Single source of truth for configuration, constants, and schema definitions."*

**Arquivo:** [api/steps/users.api.steps.ts](../api/steps/users.api.steps.ts)

Cada Given step criava `new ApiClient(request, BASE_URL)` de forma independente — a mesma chamada de dois argumentos repetida 7 vezes. Mudança no construtor ou na fonte de `BASE_URL` exigiria tocar 7 locais.

```diff
+ function makeClient(request: APIRequestContext): ApiClient {
+   return new ApiClient(request, BASE_URL);
+ }

  Given('que faço um GET em {string}', async ({ request }, path) => {
-   const client = new ApiClient(request, BASE_URL);
+   const client = makeClient(request);
  });
```

---

## §5 — Estrutura de Arquivos

### 5a — Path morto em `cucumber.js`

**Regra violada:** *"Eliminate dead code and unused imports on every change."*

**Arquivo:** [cucumber.js](../cucumber.js)

O diretório `e2e/support/` não existe. O Cucumber ignora globs sem match silenciosamente, tornando a referência enganosa.

```diff
- require: ['e2e/steps/**/*.ts', 'e2e/support/**/*.ts'],
+ require: ['e2e/steps/**/*.ts'],
```

---

## §4 — Arquitetura / Funções

### 4a — Variável e flags `--out json=` sem consumidor

**Regra violada:** *"Eliminate dead code and unused imports on every change."*

**Arquivo:** [k6/run-k6.js](../k6/run-k6.js)

`outputFile` resolvia `reports/k6/summary.json` e era passado como `--out json=` para o K6 em ambos os branches (mock e normal). O K6 escrevia NDJSON nesse arquivo. Porém, `generate-report.js` lê `summary-handleSummary.json` — o arquivo JSON produzido por `handleSummary()` em `load-test.ts`. O NDJSON de `--out json=` nunca foi lido por nenhum script: gerava disco desperdiçado e confusão sobre qual arquivo era o "output oficial".

```diff
- const outputFile = path.resolve(__dirname, '../reports/k6/summary.json');

  execFileSync(k6Bin, [
    'run',
    '--env', 'BASE_URL=http://localhost:8080/api',
-   '--out', `json=${outputFile}`,
    'load-test.ts',
  ], { cwd: __dirname, stdio: 'inherit' });
```

---

## Itens Auditados e Aceitos

| Arquivo | Observação | Decisão |
| --- | --- | --- |
| `playwright.config.ts:44` | Repete fallback `https://reqres.in` de `constants.ts` | Aceito — serve papel diferente: `baseURL` do projeto Playwright (headers automáticos) vs. argumento do construtor `ApiClient`. Unificar adicionaria indireção sem ganho real. |
| `k6/load-test.ts` | Extensões `.ts` em imports relativos | Aceito — exigência do K6 v1.7.1; não é anti-pattern. |
| `k6/run-k6.js:18` | `res.resume()` com comentário inline | Aceito — explica a razão não-óbvia (drenagem do socket HTTP para evitar leak). Comentário WHY legítimo. |
| `api/helpers/constants.ts` | Arquivo de export único (`BASE_URL`) | Aceito — single source of truth para resolução de URL com fallback; YAGNI aplicado corretamente. |
| `e2e/steps/checkout.steps.ts:54-55` | Comentário sobre não fazer assert de navegação | Aceito — explica divergência de comportamento entre cenários de sucesso e falha no mesmo step. |
| `api/steps/users.api.steps.ts` — instanciação de `LoginPage`/POM por step | Instância criada por step em vez de por cenário | Aceito — padrão correto para BDD: fixture `{ page }` é injetada por step, POM é stateless. |

---

## Checklist AGENTS-example.md §12

### Críticos

- [x] Sem PII em logs (`console.log` ausente em todo código TypeScript)
- [x] Sem secrets no código (`.env` fora do git, chave via env var)
- [x] Sem duplicação de tipos ou classes
- [x] Todos os arquivos abaixo de 500 linhas (maior: `users.api.steps.ts` com 176 linhas)
- [x] Sem mistura de responsabilidades por arquivo
- [x] Inputs validados nas bordas (validação feita pela API externa; steps são consumidores)

### Importantes

- [x] Cada arquivo/função tem responsabilidade única
- [x] Error handling explícito (`getResponse` lança `Error` descritivo; `waitForWireMock` rejeita com mensagem; K6 propaga `err.status`)
- [x] Tipagem forte — zero `any` em todo o projeto TypeScript
- [x] `BASE_URL` centralizado em `api/helpers/constants.ts` (consumido pelo steps file)
- [x] Lógica de domínio independente de infraestrutura (POM não importa Playwright `expect`; `ApiClient` não conhece BDD)

### Testes

- [x] Happy path + adversariais presentes em todos os módulos (API: 19 cenários; E2E: 11 cenários)
- [x] Zero anti-patterns detectados (The Liar, Mirror, Giant, Mockery, Chain Gang, Flaky)
- [x] Isolamento de estado por cenário via `WeakMap` — determinístico

### Qualidade

- [x] Comentários explicam WHY, nunca WHAT (após fixes desta revisão)
- [x] Zero over-engineering — sem abstrações sem dois casos de uso concretos
- [x] Dead code eliminado (`outputFile`, flags `--out`, path morto, docstring, comentários organizacionais)
