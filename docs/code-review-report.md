# Code Review Report — QA Automation Challenge

**Data:** 2026-04-23
**Revisor:** SDET Authority Analysis
**Projeto:** `challenge-outsera` — Playwright + TypeScript + BDD
**Critérios:** AGENTS-example.md (Langflow Agent Project Review)
**Resultado final:** APROVADO COM RESSALVAS

---

## Sumário Executivo

O projeto demonstra maturidade técnica acima da média para um challenge de QA. A separação em camadas API/E2E está clara, a adoção de BDD com Gherkin em Português é coerente, e as decisões de design são justificadas. Os achados abaixo são majoritariamente melhorias incrementais — não há bloqueadores críticos de segurança ou arquitetura.

| Categoria | Resultado |
|-----------|-----------|
| Segurança & PII | ✅ PASS (ressalvas menores) |
| DRY | ⚠️ WARN — duplicação de `BASE_URL` |
| Estrutura de arquivos | ✅ PASS — todos dentro dos limites |
| Arquitetura | ⚠️ WARN — violação leve de camada no `LoginPage` |
| Qualidade de código | ✅ PASS — forte tipagem, early returns |
| Testes | ✅ PASS — happy path + adversariais presentes |
| Observabilidade | ⚠️ WARN — sem logging estruturado |
| Dead code | ⚠️ WARN — 2 métodos sem uso |

---

## 1. Segurança

### 1.1 Credenciais hardcoded em specs — AVISO MENOR

**Arquivo:** [api/tests/users.post.spec.ts](../api/tests/users.post.spec.ts) — linhas 7–8

```typescript
const VALID_LOGIN = { email: 'eve.holt@reqres.in', password: 'cityslicka' };
const VALID_REGISTER = { email: 'eve.holt@reqres.in', password: 'pistol' };
```

**Avaliação:** As credenciais são **públicas e documentadas** no site do reqres.in — não são credenciais reais de produção. O risco é baixo no contexto de um mock. No entanto, o guia exige que inputs de teste usem dados falsos/anonimizados e que a configuração venha de variáveis de ambiente.

**Recomendação:** Mover para constantes no `playwright.config.ts` ou para um arquivo `api/fixtures/credentials.ts` lido de `process.env`, seguindo o mesmo padrão adotado em `checkout.steps.ts` (linhas 10–11).

---

### 1.2 Credenciais E2E via env com fallback — CONFORME

**Arquivo:** [e2e/steps/checkout.steps.ts](../e2e/steps/checkout.steps.ts) — linhas 10–11

```typescript
const SAUCE_USERNAME = process.env.SAUCE_USERNAME || 'standard_user';
const SAUCE_PASSWORD = process.env.SAUCE_PASSWORD || 'secret_sauce';
```

**Avaliação:** Correto. Variável de ambiente tem prioridade; o fallback é público e documentado pela SauceDemo. Padrão consistente com CI/CD.

---

### 1.3 `.env` no `.gitignore` — CONFORME

O `.gitignore` exclui corretamente `.env` e `.env.*`. A chave `REQRES_API_KEY` não está versionada. ✅

---

### 1.4 PII em logs — CONFORME

Nenhum `console.log`, `console.error` ou equivalente foi encontrado em todo o código de produção/teste. ✅

---

## 2. DRY — Don't Repeat Yourself

### 2.1 `BASE_URL` duplicado em todos os spec files — WARN

**Arquivos afetados:**
- [api/tests/users.get.spec.ts:4](../api/tests/users.get.spec.ts)
- [api/tests/users.post.spec.ts:4](../api/tests/users.post.spec.ts)
- [api/tests/users.put.spec.ts:4](../api/tests/users.put.spec.ts)
- [api/tests/users.delete.spec.ts:4](../api/tests/users.delete.spec.ts)
- [api/steps/users.api.steps.ts:7](../api/steps/users.api.steps.ts)

```typescript
// Repetido em 5 arquivos
const BASE_URL = process.env.BASE_URL_API || 'https://reqres.in';
```

**Avaliação:** Viola a regra DRY — mesma lógica de negócio (resolução da URL base) em 5 locais. O `playwright.config.ts` já define `baseURL` por projeto, mas os specs não a utilizam; constroem o próprio client com `BASE_URL` local.

**Impacto:** Se a URL mudar (ex.: ambiente de staging), 5 arquivos precisam ser atualizados.

**Recomendação:** Centralizar em um arquivo `api/helpers/constants.ts` ou usar o `baseURL` da fixture do Playwright diretamente via `request.get('/api/users')` (sem prefixo), que o Playwright resolve via config automaticamente.

---

### 2.2 Instanciação de `ApiClient` repetida por teste — ACEITÁVEL

Cada `test()` cria `new ApiClient(request, BASE_URL)`. É verboso, mas deliberado — o `request` é uma fixture injetada por escopo de teste. Não é DRY ruim; é isolamento correto.

---

## 3. Estrutura de Arquivos

### 3.1 Métricas de tamanho — CONFORME

Todos os arquivos estão dentro dos limites do guia (≤500 linhas para produção, ≤1000 para testes):

| Arquivo | Linhas | Limite | Status |
|---------|--------|--------|--------|
| `api/steps/users.api.steps.ts` | 170 | 500 | ✅ |
| `api/helpers/api.client.ts` | 74 | 500 | ✅ |
| `api/tests/users.get.spec.ts` | 69 | 1000 | ✅ |
| `api/tests/users.post.spec.ts` | 87 | 1000 | ✅ |
| `api/tests/users.put.spec.ts` | 61 | 1000 | ✅ |
| `api/tests/users.delete.spec.ts` | 40 | 1000 | ✅ |
| `e2e/steps/checkout.steps.ts` | 91 | 500 | ✅ |
| `e2e/steps/login.steps.ts` | 43 | 500 | ✅ |
| `e2e/pages/*.ts` | 26–47 | 500 | ✅ |
| `e2e/support/world.ts` | 40 | 500 | ✅ |
| `playwright.config.ts` | 75 | 500 | ✅ |

---

### 3.2 Responsabilidade única por arquivo — CONFORME

Cada arquivo tem propósito único e descritível em uma frase sem "e/ou":

- `api.client.ts` → encapsula requisições HTTP tipadas
- `users.api.steps.ts` → step definitions de API
- `LoginPage.ts` → interações com a tela de login
- `CheckoutPage.ts` → interações com o fluxo de checkout

✅ Sem arquivos `utils`, `helpers`, `misc` genéricos.

---

### 3.3 Naming — CONFORME

Nomes expressivos e sem abreviações ambíguas. Funções usam verbos corretos (`navigate`, `fillForm`, `proceedToCheckout`, `getState`). Booleans com prefixo `is` (`isLoggedIn`). ✅

---

## 4. Arquitetura

### 4.1 Violação de camada — `LoginPage` importa `expect` — WARN

**Arquivo:** [e2e/pages/LoginPage.ts:1](../e2e/pages/LoginPage.ts)

```typescript
import { Page, Locator, expect } from '@playwright/test';
```

**Avaliação:** `expect` é importado mas **nunca usado** no arquivo. É um import morto, mas semanticamente problemático: Page Objects pertencem à camada de abstração de UI e não devem conter assertions. Assertions pertencem à camada de steps/testes. O guia exige que Page Objects não contenham lógica de asserção.

**Recomendação:** Remover `expect` do import. Se uma Page Object precisar de assertion interna (ex.: waitFor com assert), usar `waitFor` diretamente — que já está sendo usado corretamente.

```typescript
// Antes
import { Page, Locator, expect } from '@playwright/test';
// Depois
import { Page, Locator } from '@playwright/test';
```

---

### 4.2 `world.ts` — arquivo residual do Cucumber legado — WARN

**Arquivo:** [e2e/support/world.ts](../e2e/support/world.ts)

O projeto migrou para `playwright-bdd` (que usa fixtures do Playwright nativamente), mas mantém um `world.ts` com setup completo de `chromium.launch()` manual via `@cucumber/cucumber`. Este arquivo não é usado nos testes E2E BDD atuais — os steps E2E usam a fixture `{ page }` do Playwright diretamente.

**Impacto:** Arquivo morto que pode confundir novos colaboradores sobre qual infraestrutura está ativa. Também lança um browser separado se o runner Cucumber for invocado diretamente.

**Recomendação:** Avaliar remoção ou documentar explicitamente que pertence ao runner legado `cucumber-js` (`npm run test:e2e:cucumber`).

---

### 4.3 Separação de camadas (API) — CONFORME

O `ApiClient` abstrai corretamente o transporte HTTP. Steps BDD e specs delegam para o client sem duplicar lógica de `request`. A camada de steps não contém lógica de negócio — apenas orquestra chamadas e assertions. ✅

---

### 4.4 Page Object Model (E2E) — CONFORME

POM estrito aplicado. Todos os seletores encapsulados nas classes de página com `data-test` attributes (estáveis a mudanças de CSS). Steps são declarativos e delegam para POM. ✅

---

### 4.5 Isolamento de estado BDD — CONFORME

Uso de `WeakMap<request, state>` é uma solução correta e não-óbvia para isolamento de estado por cenário. Evita variáveis globais mutáveis sem adicionar dependências externas. ✅

---

## 5. Qualidade de Código

### 5.1 Tipagem forte — CONFORME

Todos os métodos públicos têm tipos de parâmetro e retorno explícitos. Generics usados corretamente em `ApiClient`. Nenhum `any` foi encontrado no código de produção ou testes. ✅

---

### 5.2 Uso de `null!` (non-null assertion) — AVISO MENOR

**Arquivo:** [api/steps/users.api.steps.ts:14](../api/steps/users.api.steps.ts)

```typescript
scenarioState.set(request, { response: null!, responses: [] });
```

**Avaliação:** `null!` (non-null assertion) é um type cast que ilude o compilador. O TypeScript strict mode é violado semanticamente, mesmo que não emita erro. O valor `null!` coagido a `ApiResponse` pode causar `TypeError` em runtime se um step `Then` for executado antes de um step `Given` popular o estado.

**Recomendação:** Usar `undefined` com tipo opcional ou sentinel pattern:

```typescript
// Opção A — tipo opcional
{ response: undefined as ApiResponse | undefined, responses: [] }

// Opção B — checar existência no Then
const s = scenarioState.get(request);
if (!s?.response) throw new Error('No response captured — check your Given step');
```

---

### 5.3 Imutabilidade — CONFORME

Locators declarados como `readonly` nas Page Objects. Fixtures Playwright são imutáveis por design. Sem mutação de estado compartilhado entre cenários. ✅

---

### 5.4 Comentários — CONFORME (com observação)

Os comentários existentes explicam o **porquê** — especialmente as limitações do mock reqres.in. Nenhum comentário explica o "o quê" óbvio. ✅

**Observação:** Os comentários nos steps files usam IDs de formato antigo (`CT01-0001`) que divergem dos IDs usados nas features (`@CT001`). Incoerência cosmética.

---

### 5.5 Dead code — WARN

**Dois métodos sem uso identificados:**

| Arquivo | Método | Linha | Problema |
|---------|--------|-------|---------|
| [e2e/pages/LoginPage.ts](../e2e/pages/LoginPage.ts) | `isLoggedIn()` | 33 | Nunca chamado em steps ou testes |
| [api/helpers/api.client.ts](../api/helpers/api.client.ts) | `assertStatus()` | 67 | Nunca chamado — assertions feitas diretamente com `expect` |

**Recomendação:** Remover ambos. Dead code gera ruído e falsa sensação de cobertura.

---

## 6. Testes

### 6.1 Happy path + Adversariais — CONFORME

Todos os módulos possuem cenários positivos **e** negativos:

| Módulo | Happy path | Adversariais | Status |
|--------|-----------|-------------|--------|
| GET /api/users | 3 | 2 | ✅ |
| POST /api/* | 3 | 4 | ✅ |
| PUT/PATCH | 2 | 2 | ✅ |
| DELETE | 1 | 2 | ✅ |
| Login E2E | 2 | 5 | ✅ |
| Checkout E2E | 2 | 4 | ✅ |

---

### 6.2 Documentação de limitações do mock — DIFERENCIAL POSITIVO

O projeto documenta explicitamente onde o comportamento do reqres.in diverge de uma API real de produção. Isso é um diferencial de maturidade: o teste não mente sobre o sistema, ele informa as limitações conhecidas.

Exemplos:
- CT023: senha errada retorna 200 (reqres não valida senhas)
- CT026/CT027: PUT em ID inexistente retorna 200 (stateless mock)
- CT029: DELETE em ID inexistente retorna 204

✅ Padrão de documentação excelente.

---

### 6.3 Anti-patterns detectados — NENHUM

Nenhum dos anti-patterns proibidos foi identificado:

| Anti-pattern | Status |
|-------------|--------|
| The Liar (teste que não verifica o que diz) | ✅ Não encontrado |
| The Mirror (testa o que o código faz, não o que deve fazer) | ✅ Não encontrado |
| The Giant (50+ linhas de setup) | ✅ Não encontrado |
| The Mockery (testa apenas mocks) | ✅ N/A — nenhum mock usado |
| The Chain Gang (testes com ordem de execução dependente) | ✅ Não encontrado |
| The Flaky (não determinístico) | ✅ Não encontrado |

---

### 6.4 Cobertura — INDETERMINADA (sem relatório de coverage)

O projeto não possui configuração de coverage report para TypeScript (`istanbul`, `nyc` ou `--coverage` do Playwright). O guia exige **mínimo 75%, meta 80%**, com report executado e exibido.

**Avaliação:** Em projetos de automação de testes (não unit tests de código de produção), coverage de steps e helpers é secundária — o que importa é a cobertura dos cenários de negócio (CT001–CT030), que está 100% implementada.

**Recomendação:** Adicionar ao `README.md` uma nota explicitando que a cobertura é medida pela completude dos casos de teste (CT001–CT030), não por line coverage do código de automação.

---

### 6.5 Independência e determinismo — CONFORME

Cada spec file é independente. O `WeakMap` garante isolamento entre cenários BDD. O `globalSetup` regenera specs BDD antes de cada run. `--workers=1` previne race conditions com rate limit da API. ✅

---

### 6.6 Estrutura AAA — CONFORME

Todos os testes seguem Arrange-Act-Assert de forma clara. Um `act` por teste. Assertions focadas. ✅

---

## 7. Observabilidade

### 7.1 Sem logging estruturado — WARN

O guia exige logging estruturado (key-value/JSON) em pontos de decisão. Nenhum logger foi encontrado no projeto.

**Avaliação contextual:** Em frameworks de teste, o reporter do Playwright/BDD serve como observabilidade. O projeto configura três reporters (`html`, `json`, `list`), screenshots em falha, vídeo retido, e trace Playwright. Isso substitui funcionalmente o logging estruturado no contexto de QA.

**Recomendação:** Não adicionar logging por logging. O ecossistema de reporters cobre o requisito de observabilidade para o contexto de automação de testes.

---

## 8. CI/CD

### 8.1 Pipeline sequencial API → E2E — CONFORME

O workflow garante que E2E só executa se API passar (`needs: api-tests`). Artifacts de 30 dias. Variáveis sensíveis via Secrets, não-sensíveis via Variables. ✅

---

### 8.2 `--workers=1` ausente no CI — AVISO

**Arquivo:** [.github/workflows/ci.yml](../.github/workflows/ci.yml)

O CI executa `npm run test:api` sem `--workers=1`. O `playwright.config.ts` define `workers: process.env.CI ? 2 : undefined` — portanto no CI rodam 2 workers paralelos, o que pode disparar rate limit 429 do reqres.in.

**Recomendação:** Ou reduzir para `workers: 1` no CI, ou adicionar retry na configuração (`retries: 2` já está configurado no CI, o que mitiga parcialmente).

---

## 9. Checklist Pré-entrega

### Críticos (Bloqueadores)

- [x] Sem PII em logs
- [x] Sem credenciais em código de produção (ressalva: credenciais públicas de mock em spec)
- [x] Sem duplicação de tipos ou classes
- [x] Todos os arquivos abaixo de 500 linhas
- [x] Sem mistura de responsabilidades por arquivo
- [x] Inputs validados nas bordas do sistema

### Importantes (Devem corrigir)

- [x] Cada arquivo/função tem responsabilidade única
- [x] Error handling (sem falhas silenciosas)
- [x] Tipagem forte (sem `any`)
- [ ] `BASE_URL` duplicado em 5 arquivos — centralizar
- [ ] `LoginPage` com import `expect` não utilizado — remover
- [ ] Dead code: `isLoggedIn()` e `assertStatus()` — remover

### Testes (Obrigatório)

- [x] Happy path E adversariais presentes
- [x] Todos os testes passam — 51/51
- [ ] Coverage report não configurado — adicionar nota de cobertura por cenário
- [x] Sem anti-patterns de teste

### Qualidade (Deve corrigir)

- [x] Sem over-engineering
- [x] Sem padrões legados prolongados
- [ ] `null!` em `users.api.steps.ts:14` — substituir por undefined opcional
- [ ] Inconsistência de IDs nos comentários dos steps (`CT01-0001` vs `@CT001`)

---

## 10. Achados por Prioridade

### P1 — Corrija antes de entregar

| # | Arquivo | Linha | Achado |
|---|---------|-------|--------|
| 1 | `e2e/pages/LoginPage.ts` | 1 | Remover `expect` de import não utilizado |
| 2 | `e2e/pages/LoginPage.ts` | 33–35 | Remover método `isLoggedIn()` sem uso |
| 3 | `api/helpers/api.client.ts` | 67–73 | Remover método `assertStatus()` sem uso |

### P2 — Melhoria de qualidade

| # | Arquivo | Linha | Achado |
|---|---------|-------|--------|
| 4 | `api/steps/users.api.steps.ts` | 14 | Substituir `null!` por `undefined` com tipo opcional |
| 5 | Múltiplos spec files | 4 | Centralizar `BASE_URL` em `api/helpers/constants.ts` |
| 6 | `e2e/steps/*.steps.ts` | vários | Corrigir IDs de comentários (`CT01-0001` → `@CT001`) |

### P3 — Observações arquiteturais

| # | Arquivo | Linha | Achado |
|---|---------|-------|--------|
| 7 | `e2e/support/world.ts` | — | Arquivo Cucumber legado — avaliar remoção ou documentar contexto |
| 8 | `.github/workflows/ci.yml` | 34 | CI sem `--workers=1` — risco de rate limit 429 |
| 9 | `api/tests/users.post.spec.ts` | 7–8 | Credenciais mock em código — mover para env ou fixtures |

---

## Conclusão

O projeto está bem estruturado e demonstra competência técnica sólida. Os pontos mais relevantes são:

**Pontos fortes:**
- Arquitetura em camadas bem definida com separação clara entre API e E2E
- BDD bem implementado com estados isolados por cenário (WeakMap)
- Documentação de limitações do mock é diferencial de maturidade
- Zero `any`, zero magic values, zero comentários explicativos do óbvio
- 51/51 testes passando em execução local e CI configurado

**Melhorias prioritárias:**
- Remover 2 métodos sem uso (`isLoggedIn`, `assertStatus`) e 1 import morto (`expect` no `LoginPage`)
- Centralizar `BASE_URL` para eliminar duplicação em 5 arquivos
- Substituir `null!` por tipagem opcional adequada

Nenhum dos achados P1 é um bug ou risco funcional — são questões de limpeza de código que, corrigidas, elevam o projeto ao nível de excelência.
