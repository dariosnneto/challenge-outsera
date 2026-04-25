# Relatório de Análise de Qualidade — QA Automation Framework

**Data:** 2026-04-25
**Projeto:** `qa-automation-challenge` (challenge-outsera)
**Referência:** AGENTS-example.md — normas de engenharia de software

---

## Sumário Executivo

O projeto possui estrutura bem organizada, tipagem forte em todo o código TypeScript e boa separação de responsabilidades entre camadas. A análise identificou **8 problemas corrigidos** nesta sessão, cobrindo magic numbers, dead code rastreado no git, duplicação de cenários BDD, inconsistência de camada no cliente HTTP e comentários fora do padrão.

| Categoria | Problemas encontrados | Corrigidos |
| --- | --- | --- |
| Dead code / artefato rastreado | 1 | 1 |
| Magic number | 1 | 1 |
| `await` desnecessário | 1 | 1 |
| Duplicação de cenário BDD | 1 | 1 |
| Comentário referenciando tarefa (não WHY) | 1 | 1 |
| Bypass de camada (ApiClient) | 1 | 1 |
| Configuração com valor default desnecessário | 2 | 2 |
| **Total** | **8** | **8** |

---

## 1. Qualidade de Código

### 1.1 `await` desnecessário em seletor síncrono

**Arquivo:** [mobile/utils/navigation.ts](mobile/utils/navigation.ts) — linha 7

**Problema:** `$()` em WebdriverIO retorna um `ChainablePromiseElement` síncrono — não é uma `Promise`. O `await` no lado esquerdo de uma atribuição não tem efeito e gera falsa expectativa de operação assíncrona.

```ts
// ANTES (incorreto)
const logoutItem = await $(SEL.MENU_ITEM_LOG_OUT);

// DEPOIS (correto)
const logoutItem = $(SEL.MENU_ITEM_LOG_OUT);
```

**Referência AGENTS-example:** Seção 3 — *Strong Typing / Correctness*

**Status:** Corrigido

---

### 1.2 Magic number `15000` em `BaseScreen.waitForDisplayed`

**Arquivo:** [mobile/screens/BaseScreen.ts](mobile/screens/BaseScreen.ts) — linha 2

**Problema:** Valor literal `15000` hardcoded como default do parâmetro `timeout`. Todos os outros timeouts do projeto usam as constantes centralizadas em `mobile/constants.ts`. Este era o único ponto fora do padrão.

```ts
// ANTES
async waitForDisplayed(selector: string, timeout = 15000) {

// DEPOIS
import { TIMEOUT } from '../constants';
async waitForDisplayed(selector: string, timeout: number = TIMEOUT.LONG) {
```

A tipagem explícita `timeout: number` foi adicionada para evitar que o TypeScript infira o tipo como literal `15000`, o que impediria passar valores como `TIMEOUT.ITEMS = 20000`.

**Referência AGENTS-example:** Seção 3 — *No Magic Values*

**Status:** Corrigido

---

### 1.3 Comentário referenciando IDs de tarefa em vez de explicar WHY

**Arquivo:** [e2e/steps/web.checkout.steps.ts](e2e/steps/web.checkout.steps.ts) — linhas 48–50

**Problema:** O comentário mencionava `CT006, CT007, CT008-CT010` — referências a IDs de cenários que não são visíveis ao leitor do código e não explicam a razão pela qual a asserção de navegação foi omitida. Esses IDs apodrecem conforme o projeto evolui.

```ts
// ANTES
// Only assert navigation when the step is expected to succeed (CT006, CT007)
// For CT008-CT010 (missing fields), the error is asserted by the next Then step

// DEPOIS
// navigation assertion omitted intentionally — error scenarios assert in the following Then step
```

**Referência AGENTS-example:** Seção 3 — *Comments explain WHY, never WHAT. No TODO comments without ticket references.*

**Status:** Corrigido

---

## 2. DRY — Duplicação

### 2.1 Cenário BDD duplicado: CT-A019 repete CT-A017

**Arquivo:** [api/features/users.delete.feature](api/features/users.delete.feature)

**Problema:** CT-A017 (`Deletar um usuário`) já verificava `status 204` + `corpo vazio` + `cabeçalho content-type ausente`. CT-A019 (`Validar ausência de Content-Type ao deletar usuário`) repetia exatamente as mesmas chamadas e asserções exceto `corpo vazio`, sem adicionar cobertura nova. Dois cenários com o mesmo `Dado` e o mesmo endpoint não justificam existência separada quando não divergem em comportamento testado.

```gherkin
# CT-A017 já cobre todas as asserções relevantes — CT-A019 removido:
Dado que faço um DELETE em "/api/users/2"
Então o status da resposta deve ser 204
E o corpo da resposta deve estar vazio
E o cabeçalho "content-type" não deve estar presente
```

**Referência AGENTS-example:** Seção 2 — *DRY — Don't Repeat Yourself*

**Status:** Corrigido — CT-A019 removido

---

## 3. Arquitetura — Separação de Camadas

### 3.1 Bypass do `ApiClient` para requisição com `Content-Type: text/plain`

**Arquivo:** [api/steps/users.api.steps.ts](api/steps/users.api.steps.ts) — linhas 90–101

**Problema:** O step `'que faço um PUT em {string} com corpo texto {string}'` instanciava `request.put(...)` diretamente, contornando o `ApiClient`. Isso criava dois caminhos distintos para fazer requisições HTTP dentro do mesmo arquivo, quebrando a regra de que toda comunicação externa deve passar pela abstração de transporte.

```ts
// ANTES — bypass direto da camada
const raw = await request.put(`${BASE_URL}${path}`, {
  headers: { 'Content-Type': 'text/plain' },
  data: body,
});
const res: ApiResponse = { status: raw.status(), headers: raw.headers(), body: undefined, raw };
```

**Solução:** Adicionado método `putRaw(path, body, contentType)` ao `ApiClient` para suportar tipos de conteúdo arbitrários, mantendo todos os acessos HTTP através da abstração.

```ts
// DEPOIS — via ApiClient
async putRaw(path: string, body: string, contentType: string): Promise<ApiResponse> {
  const url = `${this.baseURL}${path}`;
  const response = await this.request.put(url, {
    headers: { 'Content-Type': contentType },
    data: body,
  });
  return this.toApiResponse(response);
}

// No step:
const client = makeClient(request);
const res = await client.putRaw(path, body, 'text/plain');
```

**Arquivos modificados:** [api/helpers/api.client.ts](api/helpers/api.client.ts), [api/steps/users.api.steps.ts](api/steps/users.api.steps.ts)

**Referência AGENTS-example:** Seção 4 — *Layer Rules — External Client: apenas comunicação com serviços externos.*

**Status:** Corrigido

---

## 4. Dead Code e Configuração

### 4.1 `screen.xml` — artefato de debug rastreado pelo git

**Arquivo:** `screen.xml` (raiz do projeto)

**Problema:** Dump XML da hierarquia de UI do emulador Android, gerado por ferramenta de inspeção Appium durante sessão de depuração. Não pertence ao repositório, expõe detalhes do ambiente local e é regenerado a cada sessão de debug.

**Ação:** Removido do rastreamento git (`git rm --cached`) e adicionado ao [.gitignore](.gitignore).

**Referência AGENTS-example:** Seção 3 — *Eliminate dead code and unused imports on every change.*

**Status:** Corrigido

---

### 4.2 `exclude: []` desnecessário em `wdio.conf.ts`

**Arquivo:** [mobile/config/wdio.conf.ts](mobile/config/wdio.conf.ts)

**Problema:** A propriedade `exclude: []` declara explicitamente o valor default do WebdriverIO. Não adiciona informação e aumenta o ruído de configuração.

**Referência AGENTS-example:** Seção 2 — *KISS — Keep It Simple*

**Status:** Corrigido — propriedade removida

---

### 4.3 Linha em branco dupla em `wdio.conf.ts`

**Arquivo:** [mobile/config/wdio.conf.ts](mobile/config/wdio.conf.ts) — após bloco `beforeScenario`

**Problema:** Duas linhas em branco consecutivas quebram a consistência de formatação do restante do arquivo.

**Status:** Corrigido

---

## 5. O Que Está Correto — Pontos Positivos

### 5.1 Tipagem forte em todo o TypeScript

Nenhum uso de `any` ou `object` encontrado em todos os arquivos de produção (`api/`, `e2e/`, `mobile/`, `k6/`). Todas as funções públicas possuem tipos de retorno explícitos. Type check (`tsc --noEmit`) passa sem erros em ambos os tsconfigs.

### 5.2 Padrão WeakMap para isolamento de estado BDD

[api/steps/users.api.steps.ts](api/steps/users.api.steps.ts) usa `WeakMap<object, State>` para isolar estado entre cenários, evitando variáveis globais mutáveis. Padrão correto e não-óbvio — garante que respostas de um cenário não vazem para outro.

### 5.3 DRY consolidado

- `ensureLoggedOut()` em `mobile/utils/navigation.ts` — elimina dois blocos idênticos de 20 linhas nos step files
- `DashboardPage` e `CartPage` estendem `BasePage` — consistência com `LoginPage` e `CheckoutPage`
- `makeClient(request)` factory function — elimina instanciações repetidas de `new ApiClient(request, BASE_URL)`
- `parseTable()` wrapper removido — `dataTable.rowsHash()` usado diretamente

### 5.4 Constantes centralizadas

[mobile/constants.ts](mobile/constants.ts) centraliza todos os seletores (`SEL`) e timeouts (`TIMEOUT`). Após a correção 1.2, `BaseScreen` também usa essas constantes — nenhum magic number restante no projeto mobile.

### 5.5 Separação de camadas respeitada

| Camada | Responsabilidade | Cumprida |
| --- | --- | --- |
| Page Objects / Screens | Abstração de UI — seletores, ações, `waitFor` | Sim |
| Steps BDD | Orquestração e asserções | Sim |
| ApiClient | Transporte HTTP puro | Sim (após correção 3.1) |
| BaseScreen / BasePage | Comportamentos base reutilizáveis | Sim |
| navigation.ts | Helpers de navegação mobile sem lógica de negócio | Sim |

### 5.6 Tamanho de arquivos dentro dos limites

Nenhum arquivo de produção ultrapassa 100 linhas. O limite do guia é 500 linhas. Há margem ampla para crescimento.

### 5.7 Comentários WHY presentes onde necessário

Os comentários em [mobile/generate-report.js](mobile/generate-report.js) (workaround do bug `@wdio/allure-reporter v9 + Cucumber`), em [mobile/utils/navigation.ts](mobile/utils/navigation.ts) (reinicialização do app por estado de navegação React) e nas features de API (comportamento quirky do mock reqres.in) explicam restrições não-óbvias — exatamente como o guia prescreve.

### 5.8 Segurança — sem segredos no código

Todas as chaves e credenciais usam variáveis de ambiente. O `.env.example` documenta as variáveis necessárias sem expor valores reais. Nenhum segredo hardcoded identificado.

### 5.9 CI robusto e bem estruturado

Pipeline com 4 jobs independentes (API, E2E, K6, Mobile), cache de browsers do Playwright, validação de secrets antes de executar testes, relatórios Allure publicados no GitHub Pages via deploy manual sem dependências de terceiros depreciadas.

---

## 6. Observações — Sem Ação Imediata

| Item | Arquivo | Descrição |
| --- | --- | --- |
| `docs/` ignorado mas rastreado | `.gitignore` | A regra `docs/` não remove arquivos já commitados. Usar `git rm --cached docs/` se o diretório não deve ser público. Decisão do projeto, não bloqueador. |
| Duplicação nos steps K6 do CI | `.github/workflows/ci.yml` | Os steps "Run K6 smoke test" e "Run K6 load test completo" executam o mesmo comando, diferindo apenas pela variável `K6_SCENARIO`. Candidato a refatoração com `matrix` strategy no futuro. |
| Step `_button` descartado | `mobile/steps/mobile.checkout.steps.ts:43` | O parâmetro `_button` é suprimido intencionalmente (prefixo `_`). Correto em TypeScript. O step poderia ser removido se o step genérico `'toco em {string}'` bastasse — avaliação futura dependendo da evolução dos cenários. |

---

## 7. Checklist Pre-Delivery (AGENTS-example §12)

### Crítico (Bloqueadores)

- [x] Nenhum PII em logs, prints ou webhooks
- [x] Nenhum segredo hardcoded no código
- [x] Sem duplicação de tipos, classes ou lógica
- [x] Nenhum arquivo ultrapassa 500 linhas (produção) ou 1000 linhas (testes)
- [x] Sem prefixos de responsabilidade misturados no mesmo arquivo
- [x] Inputs de sistema externos validados nos boundaries

### Importante

- [x] Cada arquivo e função tem responsabilidade única
- [x] Tratamento de erros explícito — sem falhas silenciosas
- [x] Tipagem forte — sem `any` ou `object`
- [x] Constantes em arquivo dedicado (`constants.ts`)
- [x] Lógica independente de frameworks de infraestrutura

### Qualidade

- [x] Comentários explicam WHY, não WHAT
- [x] Sem over-engineering — sem abstrações prematuras
- [x] Sem padrões legados prolongados

### Pré-commit

- [x] `npx tsc --noEmit` — zero erros
- [x] `npx tsc --project mobile/tsconfig.json --noEmit` — zero erros

---

## 8. Arquivos Modificados Nesta Sessão

| Arquivo | Mudança |
| --- | --- |
| [mobile/utils/navigation.ts](mobile/utils/navigation.ts) | Removido `await` desnecessário em `$(SEL.MENU_ITEM_LOG_OUT)` |
| [mobile/screens/BaseScreen.ts](mobile/screens/BaseScreen.ts) | Substituído magic number `15000` por `TIMEOUT.LONG`; adicionado `import { TIMEOUT }`; explicitado tipo `number` no parâmetro |
| [mobile/config/wdio.conf.ts](mobile/config/wdio.conf.ts) | Removido `exclude: []` e linha em branco dupla |
| [e2e/steps/web.checkout.steps.ts](e2e/steps/web.checkout.steps.ts) | Substituído comentário com IDs de tarefa por explicação do WHY real |
| [api/features/users.delete.feature](api/features/users.delete.feature) | Removido CT-A019 (duplicação de CT-A017) |
| [api/helpers/api.client.ts](api/helpers/api.client.ts) | Adicionado método `putRaw(path, body, contentType)` |
| [api/steps/users.api.steps.ts](api/steps/users.api.steps.ts) | Step `PUT com corpo texto` agora usa `client.putRaw()` em vez de bypass direto |
| [.gitignore](.gitignore) | Adicionada regra `screen.xml` |
| `screen.xml` | Removido do rastreamento git (`git rm --cached`) |
