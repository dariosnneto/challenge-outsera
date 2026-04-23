# Code Review Report v2 — QA Automation Challenge

**Data:** 2026-04-23
**Revisor:** SDET Authority Analysis
**Projeto:** `challenge-outsera` — Playwright + TypeScript + BDD
**Critérios:** AGENTS-example.md (Langflow Agent Project Review)
**Versão anterior:** `docs/code-review-report.md` (P1/P2/P3 aplicados)
**Resultado final:** APROVADO COM RESSALVAS — 4 achados bloqueadores identificados

---

## Sumário Executivo

Esta é a segunda análise do projeto, realizada após a aplicação das correções da v1. As melhorias foram incorporadas corretamente — dead code removido, `BASE_URL` centralizado, `null!` eliminado, comentários normalizados. Porém a análise mais profunda revelou **4 novos achados de maior impacto**, sendo um deles de segurança crítica.

| Categoria | v1 | v2 | Delta |
|-----------|----|----|-------|
| Segurança & PII | ⚠️ WARN | 🔴 CRÍTICO | Piorou — API key em git history |
| DRY | ⚠️ WARN | ⚠️ WARN | Novo achado: 25+ instâncias |
| Estrutura de arquivos | ✅ PASS | ✅ PASS | Mantido |
| Arquitetura | ⚠️ WARN | ⚠️ WARN | `world.ts` ainda presente |
| Qualidade de código | ✅ PASS | ⚠️ WARN | Type assertions não validadas |
| Testes | ✅ PASS | ⚠️ WARN | When steps sem assertions |
| Observabilidade | ⚠️ WARN | ✅ PASS | Contexto reavaliado |
| Dead code | ⚠️ WARN | ✅ PASS | Corrigido na v1 |

---

## Métricas de Tamanho — CONFORME

Todos os arquivos dentro dos limites do guia (≤500 prod / ≤1000 test):

| Arquivo | Linhas | Limite | Status |
|---------|--------|--------|--------|
| `api/helpers/api.client.ts` | 66 | 500 | ✅ |
| `api/helpers/constants.ts` | 1 | 500 | ✅ |
| `api/steps/users.api.steps.ts` | 175 | 500 | ✅ |
| `api/tests/users.get.spec.ts` | 68 | 1000 | ✅ |
| `api/tests/users.post.spec.ts` | 86 | 1000 | ✅ |
| `api/tests/users.put.spec.ts` | 60 | 1000 | ✅ |
| `api/tests/users.delete.spec.ts` | 39 | 1000 | ✅ |
| `e2e/steps/checkout.steps.ts` | 91 | 500 | ✅ |
| `e2e/steps/login.steps.ts` | 43 | 500 | ✅ |
| `e2e/pages/*.ts` | 26–47 | 500 | ✅ |
| `e2e/support/world.ts` | 40 | 500 | ✅ |
| `playwright.config.ts` | 75 | 500 | ✅ |

---

## 1. SEGURANÇA — 🔴 CRÍTICO

### 1.1 API key exposta no histórico do git

**Arquivo:** `.env` — linha 1

```
REQRES_API_KEY=pro_f5c13c2f563cb1efcfee887916f4b3bbd0b79bef0bd21342ddeb8e3654bd1929
```

**Avaliação:** O `.env` está no `.gitignore`, portanto **não é rastreado agora**. Porém se o arquivo foi comitado em algum momento anterior (durante a session de trabalho), a chave existe permanentemente no `git log` / `git show` mesmo após ser removida. Qualquer pessoa com acesso ao repositório pode recuperá-la com `git log --all --full-history -- .env`.

O guia é explícito: *"No hardcoded API keys, tokens, or passwords"* e *"Keep secrets out of code — use environment variables or secret managers."*

**Ação imediata obrigatória:**
1. Revogar a chave atual em `https://app.reqres.in/api-keys`
2. Gerar nova chave e armazená-la **somente** em variável de ambiente local e em GitHub Secrets
3. Se o repositório for compartilhado, purgar o histórico git com `git filter-branch` ou `bfg-repo-cleaner`
4. Criar `.env.example` documentando as variáveis necessárias sem valores reais:

```env
# Obtenha sua chave em: https://app.reqres.in/api-keys
REQRES_API_KEY=your_key_here
BASE_URL_API=https://reqres.in
BASE_URL_E2E=https://www.saucedemo.com
```

---

### 1.2 Ausência de validação da env var no CI

**Arquivo:** `.github/workflows/ci.yml` — linha 33

```yaml
REQRES_API_KEY: ${{ secrets.REQRES_API_KEY }}
```

Se o secret não estiver configurado no repositório, a variável será string vazia. O Playwright passará `x-api-key: ` (header vazio) e todos os testes retornarão 401 silenciosamente — o CI falhará com mensagens de erro não óbvias.

**Recomendação:** Adicionar step de validação antes dos testes:

```yaml
- name: Validate required secrets
  run: |
    if [ -z "$REQRES_API_KEY" ]; then
      echo "ERROR: REQRES_API_KEY secret is not set"
      exit 1
    fi
  env:
    REQRES_API_KEY: ${{ secrets.REQRES_API_KEY }}
```

---

### 1.3 Credenciais hardcoded em specs (sem env var) — AVISO

**Arquivo:** `api/tests/users.post.spec.ts` — linhas 6–7

```typescript
const VALID_LOGIN = { email: 'eve.holt@reqres.in', password: 'cityslicka' };
const VALID_REGISTER = { email: 'eve.holt@reqres.in', password: 'pistol' };
```

**Contexto:** São credenciais públicas e documentadas do reqres.in — risco real é baixo. Porém divergem do padrão adotado em `checkout.steps.ts` (linhas 10–11), onde o mesmo tipo de dado usa `process.env || fallback`.

**Recomendação de médio prazo:** Mover para `api/helpers/constants.ts` junto com `BASE_URL`, mantendo coerência de padrão.

---

## 2. QUALIDADE DE CÓDIGO — `as unknown as T` em `api.client.ts`

### 2.1 Double cast silencia erros de runtime — BLOQUEADOR DE QUALIDADE

**Arquivo:** `api/helpers/api.client.ts` — linha 26

```typescript
private async toApiResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
  let body: T;
  try {
    body = await response.json() as T;
  } catch {
    body = undefined as unknown as T;   // ← problema
  }
  ...
}
```

**O problema:** `undefined as unknown as T` é um double cast que instrui o TypeScript a tratar `undefined` como se fosse `T`. Isso compila sem erro mas **mente ao compilador**: qualquer código que acesse `res.body.campo` após uma resposta sem corpo (ex.: 204 No Content) lançará `TypeError: Cannot read properties of undefined` em runtime — sem nenhum aviso estático.

O guia é claro: *"Never cast to `any` just to make something compile"* e *"Handle expected errors explicitly. No silent failures."*

**Por que acontece:** A interface `ApiResponse<T>` define `body: T` como obrigatório. Quando não há corpo (DELETE 204), o campo `body` deveria ser opcional — mas o tipo atual não permite isso.

**Correção:** Tornar `body` opcional na interface, eliminando a necessidade do cast:

```typescript
// api/helpers/api.client.ts

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T | undefined;   // ← honest sobre a possibilidade de undefined
  raw: APIResponse;
}

private async toApiResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
  let body: T | undefined;
  try {
    body = await response.json() as T;
  } catch {
    body = undefined;
  }
  return { status: response.status(), headers: response.headers(), body, raw: response };
}
```

Isso propaga `body: T | undefined` para todos os consumidores, forçando checagem explícita onde necessário — exatamente o comportamento que o TypeScript strict mode deve garantir.

---

### 2.2 Type assertions sem validação de runtime em `users.api.steps.ts` — WARN

**Arquivo:** `api/steps/users.api.steps.ts` — linhas 140, 146, 152, 168–169

```typescript
// linha 140 — assume que o campo é array
const actual = getField(getResponse(request).body, field) as unknown[];

// linha 146, 152 — assume que o campo é string
const actual = getField(getResponse(request).body, field) as string;

// linhas 168-169 — assume estrutura interna específica
const ids1 = (responses[0].body as { data: { id: number }[] }).data.map(...);
```

**Causa raiz:** `getField()` (linha 173) retorna `unknown`. Cada `Then` faz cast para o tipo esperado **sem validar** se o valor realmente é desse tipo. Se a API retornar estrutura inesperada, o erro ocorre na linha de uso, não na assertion — dificultando diagnóstico.

**Avaliação contextual:** Em testes BDD, a assertion imediatamente seguinte (`expect(Array.isArray(actual)).toBe(true)`) já valida o tipo antes de usar o valor. O risco real é baixo, mas viola a diretriz de *"strong typing everywhere"*.

**Recomendação:** Manter os casts atuais (são funcionais e o teste valida em seguida), mas documentar que a assertion que segue cada cast é a verificação de tipo de runtime.

---

## 3. DRY — Instanciação Repetida de `ApiClient`

### 3.1 `new ApiClient(request, BASE_URL)` em 25 locais — WARN

A instanciação do `ApiClient` é repetida em todos os 19 testes spec e em 7 steps BDD — total de **26 ocorrências** do mesmo padrão:

```typescript
const client = new ApiClient(request, BASE_URL);
```

**Arquivos afetados:**

| Arquivo | Ocorrências |
|---------|-------------|
| `api/tests/users.get.spec.ts` | 5 |
| `api/tests/users.post.spec.ts` | 7 |
| `api/tests/users.put.spec.ts` | 3 |
| `api/tests/users.delete.spec.ts` | 3 |
| `api/steps/users.api.steps.ts` | 7 |

**Avaliação:** O guia exige extração quando a *mesma lógica* aparece em 3+ lugares (Rule of Three). Aqui são 26. O `request` é uma fixture Playwright com escopo de teste — pode ser usado diretamente via `test.use` ou em um `beforeEach` factory.

**Recomendação para spec files:** Criar factory local no topo de cada spec (sem novo arquivo — YAGNI):

```typescript
// Padrão sugerido dentro de cada spec file
function apiClient(request: APIRequestContext) {
  return new ApiClient(request, BASE_URL);
}

// Uso nos testes
const res = await apiClient(request).get('/api/users');
```

**Para os BDD steps:** O pattern atual no `users.api.steps.ts` é aceitável porque cada `Given` recebe um `request` diferente (scoped por cenário via WeakMap). A instanciação local não pode ser elevada para o escopo do módulo sem quebrar o isolamento.

---

### 3.2 Page Object instanciado em cada step — ACEITÁVEL

`new LoginPage(page)`, `new DashboardPage(page)` etc. são instanciados dentro de cada step. Isso é repetitivo, mas correto: `page` é fixture injetada por step, e o POM é stateless (só locators). Não é DRY ruim — é isolamento correto por design do Playwright-BDD.

---

## 4. ARQUITETURA — `world.ts` é código morto

### 4.1 `e2e/support/world.ts` não é usado por nenhum step ativo — BLOQUEADOR

**Arquivo:** `e2e/support/world.ts` (40 linhas)

```typescript
import { setWorldConstructor, World, IWorldOptions, Before, After, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
```

**Evidências de que é código morto:**
- Nenhum step em `e2e/steps/` importa `world.ts` ou `ICustomWorld`
- Todos os steps E2E usam `{ page }` injetado pelo Playwright-BDD: `async ({ page }, ...)` — não usam `this.page`
- O `playwright.config.ts` já gerencia o ciclo de vida do browser via `use: { ...devices['Desktop Chrome'] }`
- O `e2e/bdd.setup.ts` (globalSetup) só executa `bddgen`, não referencia `world.ts`
- Screenshot em falha já está configurado em `playwright.config.ts` linha 32: `screenshot: 'only-on-failure'`

**Impacto real:**
1. O `Before` hook (linhas 22–29) lança um browser Chromium **extra** a cada cenário quando o runner `cucumber-js` é invocado diretamente via `npm run test:e2e:cucumber`
2. Confunde novos colaboradores sobre qual sistema de lifecycle está ativo
3. Aumenta o tempo de boot sem benefício

**Recomendação:** Remover o arquivo. Se o runner `cucumber-js` for necessário no futuro, recriá-lo com documentação explícita.

---

## 5. TESTES — When steps sem assertions

### 5.1 Steps `When` do checkout não verificam estado da UI — WARN

**Arquivo:** `e2e/steps/checkout.steps.ts`

| Linha | Step | Assertion presente? |
|-------|------|---------------------|
| 22–25 | `When('adiciono {string} ao carrinho')` | ❌ Nenhuma |
| 28–31 | `When('vou ao carrinho')` | ❌ Nenhuma |
| 34–37 | `When('prossigo para o checkout')` | ❌ Nenhuma |
| 40–46 | `When('preencho o formulário...')` | ❌ Nenhuma |
| 49–52 | `When('continuo para o resumo...')` | ❌ Nenhuma |
| 55–58 | `When('finalizo o pedido')` | ❌ Nenhuma |
| 81–84 | `When('removo {string} do carrinho')` | ❌ Nenhuma |

**Avaliação contextual:** Em BDD, o padrão usual é: `Given` prepara estado, `When` executa ação, `Then` valida. Assertions nos `When` são opcionais pela convenção Gherkin, mas neste projeto há risco concreto:

- `addProductToCart()` usa `filter({ hasText })` + `click()` — se o produto não existir na página, o `.click()` falha com timeout (30s) sem mensagem de erro útil
- `proceedToCheckout()`, `continue()`, `finish()` clicam em botões sem verificar que a página esperada foi carregada antes

**Recomendação:** Adicionar assertions de navegação nos `When` críticos (não em todos — apenas onde a ausência pode mascarar falhas):

```typescript
// When('vou ao carrinho') — verifica que a URL mudou
When('vou ao carrinho', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goToCart();
  await expect(page).toHaveURL(/cart\.html/);
});

// When('prossigo para o checkout')
When('prossigo para o checkout', async ({ page }) => {
  const cart = new CartPage(page);
  await cart.proceedToCheckout();
  await expect(page).toHaveURL(/checkout-step-one/);
});
```

---

### 5.2 Cobertura de cenários de negócio — CONFORME

Todos os 30 casos de teste (CT001–CT030) estão implementados tanto em spec quanto em BDD. Nenhum cenário documentado nas features está sem step definition correspondente. ✅

---

### 5.3 Anti-patterns — NENHUM encontrado ✅

| Anti-pattern | Status |
|-------------|--------|
| The Liar | ✅ Não encontrado |
| The Mirror | ✅ Não encontrado |
| The Giant | ✅ Não encontrado |
| The Mockery | ✅ N/A — sem mocks |
| The Chain Gang | ✅ Não encontrado |
| The Flaky | ✅ Não encontrado |

---

## 6. CI/CD — Gaps operacionais

### 6.1 `tsc --noEmit` ausente no pipeline — WARN

**Arquivo:** `.github/workflows/ci.yml`

Não há step de type-check antes de executar os testes. O TypeScript é transpilado em tempo de execução pelo `ts-node`. Um erro de compilação só é descoberto quando o teste falha — não na fase de validação estática.

**Recomendação:** Adicionar step antes de `npm run test:api`:

```yaml
- name: Type check
  run: npx tsc --noEmit
```

---

### 6.2 `test-results/` pode não existir se todos os testes passarem — WARN

**Arquivo:** `.github/workflows/ci.yml` — linhas 77–79

```yaml
path: |
  reports/
  test-results/
```

Playwright só cria `test-results/` quando há falhas (vídeo e trace são `retain-on-failure`). Se todos os testes passarem, o diretório não existe e o `upload-artifact` pode emitir warning ou falhar dependendo da versão da action.

**Recomendação:** Adicionar `if-no-files-found: ignore` ou criar o diretório no CI:

```yaml
- name: Upload E2E artifacts
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: e2e-test-report
    path: reports/
    if-no-files-found: ignore
```

---

### 6.3 Jobs duplicam `npm ci` e `playwright install` sem cache compartilhado — WARN

Os jobs `api-tests` (linhas 17–42) e `e2e-tests` (linhas 44–81) executam `npm ci` e `playwright install --with-deps chromium` de forma independente. Cada job paga o custo de instalação separadamente (~2–3 min cada).

**Recomendação:** Compartilhar artifacts de dependências entre jobs ou usar cache de layer Docker. Para simplicidade, ao menos o Playwright cache pode ser habilitado:

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

---

## 7. MELHORIAS APROVEITADAS DA v1 — CONFIRMADAS ✅

| Achado v1 | Status v2 |
|-----------|-----------|
| `expect` import morto em `LoginPage.ts` | ✅ Removido |
| `isLoggedIn()` sem uso | ✅ Removido |
| `assertStatus()` sem uso | ✅ Removido |
| `null!` em `users.api.steps.ts` | ✅ Substituído por `undefined` + guard `getResponse()` |
| `BASE_URL` duplicado em 5 arquivos | ✅ Centralizado em `api/helpers/constants.ts` |
| IDs de comentários `CT01-0001` → `@CT001` | ✅ Corrigido em todos os steps files |

---

## 8. Checklist Pré-entrega (estado atual)

### Críticos

- [x] Sem PII em logs
- [ ] **Sem segredos no código** — API key pode estar em git history → **REVOGAR E RECRIAR**
- [x] Sem duplicação de tipos ou classes
- [x] Todos os arquivos abaixo dos limites
- [x] Sem mistura de responsabilidades por arquivo
- [x] Inputs validados nas bordas do sistema

### Importantes

- [x] Cada arquivo/função tem responsabilidade única
- [x] Error handling (sem falhas silenciosas)
- [x] Tipagem forte (sem `any` explícito)
- [ ] `body: T` vs `body: T | undefined` — double cast `as unknown as T` ainda presente
- [ ] `world.ts` ainda presente como código morto

### Testes

- [x] Happy path E adversariais presentes
- [x] Todos os testes passam — 51/51
- [x] Sem anti-patterns de teste
- [ ] `When` steps do checkout sem assertions de navegação

### Qualidade

- [x] Sem over-engineering
- [x] Sem padrões legados ativos no fluxo principal
- [ ] `new ApiClient(request, BASE_URL)` repetido 26 vezes
- [ ] Credenciais de mock em `users.post.spec.ts` sem env var (diverge do padrão do projeto)

### Pré-commit

- [x] TypeScript compila sem erros (`tsc --noEmit`)
- [ ] `tsc --noEmit` não está no pipeline CI

---

## 9. Achados por Prioridade

### P1 — Segurança (ação imediata)

| # | Onde | Achado | Ação |
|---|------|--------|------|
| 1 | `.env` | API key potencialmente em git history | Revogar chave, gerar nova, criar `.env.example` |
| 2 | `ci.yml:33` | Sem validação de secret obrigatório | Adicionar step de validação antes dos testes |

### P2 — Qualidade de código (antes de entregar)

| # | Arquivo | Linha | Achado |
|---|---------|-------|--------|
| 3 | `api/helpers/api.client.ts` | 26 | `undefined as unknown as T` — tornar `body` opcional na interface |
| 4 | `e2e/support/world.ts` | — | Arquivo Cucumber legado sem uso — remover |

### P3 — Qualidade de testes (melhoria incremental)

| # | Arquivo | Linha | Achado |
|---|---------|-------|--------|
| 5 | `e2e/steps/checkout.steps.ts` | 28, 34, 49 | `When` de navegação sem assertions de URL |
| 6 | `api/tests/users.post.spec.ts` | 6–7 | Credenciais sem env var (inconsistência de padrão) |

### P4 — CI/CD (melhoria de pipeline)

| # | Arquivo | Linha | Achado |
|---|---------|-------|--------|
| 7 | `ci.yml` | — | Adicionar `tsc --noEmit` antes dos testes |
| 8 | `ci.yml` | 77–79 | `test-results/` pode não existir — adicionar `if-no-files-found: ignore` |
| 9 | `ci.yml` | 24, 60 | Jobs sem cache de Playwright browsers |

### P5 — DRY (refactor de médio prazo)

| # | Arquivo | Achado |
|---|---------|--------|
| 10 | `api/tests/*.spec.ts` | `new ApiClient(request, BASE_URL)` repetido 19 vezes — extrair factory local |

---

## Conclusão

O projeto recebeu as correções da v1 corretamente e está em estado funcional com 51/51 testes passando. A análise aprofundada revelou achados que a primeira passagem não capturou:

**O único bloqueador real de entrega** é o P1 (segurança): se a API key foi comitada em algum momento, ela está no histórico git e deve ser revogada imediatamente — independente de o `.env` estar no `.gitignore` agora.

**Os demais achados** (P2–P5) são melhorias de qualidade progressivas. O P2 (`as unknown as T` e `world.ts`) são os mais relevantes tecnicamente e podem ser resolvidos em minutos. O P3–P5 são incrementais e não bloqueiam entrega.

**Pontos que permanecem sólidos (não regredidos):**
- Zero `any` explícito, zero magic values, zero dead code funcional
- POM estrito, WeakMap para isolamento BDD, documentação de limitações do mock
- TypeScript strict mode compilando sem erros
- 51/51 passando com API key carregada do `.env` via dotenv
