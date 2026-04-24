# K6 Load Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar testes de carga com K6 simulando 500 usuários simultâneos por 5 minutos contra a API pública reqres.in, gerando relatório HTML com análise de resultados.

**Architecture:** Script K6 em TypeScript (via k6 bundle) com cenário de rampa gradual, thresholds definidos para p95 < 2s e error rate < 1%. O relatório é gerado pelo output nativo do K6 (`--out json`) processado por `k6-html-reporter` para produzir HTML legível.

**Tech Stack:** K6 (CLI standalone), TypeScript (bundled via esbuild), k6-html-reporter (Node.js), reqres.in (API pública mock).

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `k6/load-test.ts` | Criar | Script principal K6: cenário, VUs, thresholds |
| `k6/helpers/http-client.ts` | Criar | Wrappers para chamadas HTTP tipadas |
| `k6/helpers/checks.ts` | Criar | Funções de verificação reutilizáveis |
| `k6/generate-report.js` | Criar | Script Node.js que converte JSON → HTML |
| `package.json` | Modificar | Adicionar scripts `test:k6` e `test:k6:report` |
| `reports/k6/` | Criar (runtime) | Diretório para `summary.json` e `report.html` |

---

## Task 1: Instalar K6 e dependências de relatório

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Verificar se K6 está instalado globalmente**

```bash
k6 version
```

Se não estiver instalado: baixar em https://k6.io/docs/get-started/installation/ (Windows: `winget install k6 --source winget` ou `choco install k6`).

- [ ] **Step 2: Instalar k6-html-reporter como devDependency**

```bash
npm install --save-dev k6-html-reporter @types/k6
```

- [ ] **Step 3: Criar diretório de reports K6**

```bash
mkdir -p reports/k6
```

Adicionar `reports/k6/` ao `.gitignore` se existir, ou criar `.gitignore` na raiz:

```
# K6 reports (runtime artifacts)
reports/k6/
```

- [ ] **Step 4: Adicionar scripts no package.json**

No `package.json`, adicionar dentro de `"scripts"`:

```json
"test:k6": "k6 run --out json=reports/k6/summary.json k6/load-test.ts",
"test:k6:report": "npm run test:k6 && node k6/generate-report.js"
```

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: add k6 and k6-html-reporter dependencies"
```

---

## Task 2: Criar helpers HTTP e de verificação

**Files:**
- Create: `k6/helpers/http-client.ts`
- Create: `k6/helpers/checks.ts`

- [ ] **Step 1: Criar `k6/helpers/http-client.ts`**

```typescript
import http from 'k6/http';
import { Params, Response } from 'k6/http';

const BASE_URL = 'https://reqres.in/api';

export function getUsers(page: number = 1): Response {
  const params: Params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'GET /users' },
  };
  return http.get(`${BASE_URL}/users?page=${page}`, params);
}

export function getUserById(id: number): Response {
  const params: Params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'GET /users/:id' },
  };
  return http.get(`${BASE_URL}/users/${id}`, params);
}

export function createUser(name: string, job: string): Response {
  const payload = JSON.stringify({ name, job });
  const params: Params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /users' },
  };
  return http.post(`${BASE_URL}/users`, payload, params);
}
```

- [ ] **Step 2: Criar `k6/helpers/checks.ts`**

```typescript
import { check } from 'k6';
import { Response } from 'k6/http';

export function checkStatus(res: Response, expectedStatus: number): boolean {
  return check(res, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

export function checkResponseTime(res: Response, maxMs: number): boolean {
  return check(res, {
    [`response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

export function checkJsonBody(res: Response, key: string): boolean {
  return check(res, {
    [`body has '${key}'`]: (r) => {
      try {
        const body = JSON.parse(r.body as string);
        return key in body;
      } catch {
        return false;
      }
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add k6/helpers/http-client.ts k6/helpers/checks.ts
git commit -m "feat(k6): add http client and check helpers"
```

---

## Task 3: Criar o script principal de carga

**Files:**
- Create: `k6/load-test.ts`

- [ ] **Step 1: Criar `k6/load-test.ts`**

```typescript
import { sleep } from 'k6';
import { Options } from 'k6/options';
import { getUsers, getUserById, createUser } from './helpers/http-client';
import { checkStatus, checkResponseTime, checkJsonBody } from './helpers/checks';

// Thresholds definem os critérios de aceitação do teste de carga.
// p(95) < 2000: 95% das requisições devem responder em menos de 2 segundos.
// rate < 0.01: menos de 1% de erros é tolerado.
export const options: Options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },  // ramp-up: 0 → 100 VUs em 1 min
        { duration: '1m', target: 300 },  // ramp-up: 100 → 300 VUs em 1 min
        { duration: '1m', target: 500 },  // ramp-up: 300 → 500 VUs em 1 min
        { duration: '1m', target: 500 },  // sustain: 500 VUs por 1 min
        { duration: '1m', target: 0 },    // ramp-down: 500 → 0 VUs em 1 min
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],           // 95% < 2s
    http_req_failed: ['rate<0.01'],              // < 1% erros
    'http_req_duration{name:GET /users}': ['p(95)<1500'],
    'http_req_duration{name:GET /users/:id}': ['p(95)<1500'],
    'http_req_duration{name:POST /users}': ['p(95)<2000'],
    checks: ['rate>0.95'],                       // > 95% checks passando
  },
};

export default function () {
  // Cenário 1: Listar usuários (alta frequência)
  const listRes = getUsers(1);
  checkStatus(listRes, 200);
  checkResponseTime(listRes, 2000);
  checkJsonBody(listRes, 'data');

  sleep(0.5);

  // Cenário 2: Buscar usuário específico
  const userId = Math.floor(Math.random() * 12) + 1;
  const getRes = getUserById(userId);
  checkStatus(getRes, 200);
  checkResponseTime(getRes, 2000);
  checkJsonBody(getRes, 'data');

  sleep(0.5);

  // Cenário 3: Criar usuário (menor frequência, operação de escrita)
  const createRes = createUser('Load Test User', 'QA Engineer');
  checkStatus(createRes, 201);
  checkResponseTime(createRes, 2000);
  checkJsonBody(createRes, 'id');

  sleep(1);
}
```

- [ ] **Step 2: Executar o teste em modo dry-run para validar o script (1 VU, 10s)**

```bash
k6 run --vus 1 --duration 10s k6/load-test.ts
```

Saída esperada: métricas exibidas no terminal, sem erros de sintaxe ou de compilação. Os checks devem aparecer com `✓`.

- [ ] **Step 3: Commit**

```bash
git add k6/load-test.ts
git commit -m "feat(k6): add load test script with 500 VUs ramp scenario"
```

---

## Task 4: Criar gerador de relatório HTML

**Files:**
- Create: `k6/generate-report.js`

- [ ] **Step 1: Criar `k6/generate-report.js`**

```javascript
const { generateSummaryReport } = require('k6-html-reporter');
const path = require('path');

const options = {
  jsonFile: path.resolve(__dirname, '../reports/k6/summary.json'),
  output: path.resolve(__dirname, '../reports/k6'),
};

generateSummaryReport(options);

console.log('Relatório HTML gerado em: reports/k6/index.html');
```

- [ ] **Step 2: Commit**

```bash
git add k6/generate-report.js
git commit -m "feat(k6): add html report generator script"
```

---

## Task 5: Executar o teste de carga completo e gerar relatório

**Files:**
- Runtime output: `reports/k6/summary.json`, `reports/k6/index.html`

- [ ] **Step 1: Executar o teste completo (500 VUs, 5 minutos)**

```bash
npm run test:k6:report
```

O K6 exibirá progresso em tempo real no terminal. Aguarde os ~5 minutos de execução. Ao final, o script `generate-report.js` gerará o HTML.

- [ ] **Step 2: Verificar que os arquivos foram gerados**

```bash
ls reports/k6/
```

Esperado: `summary.json` e `index.html` presentes.

- [ ] **Step 3: Abrir o relatório HTML e anotar os resultados**

Abrir `reports/k6/index.html` no navegador. Coletar para análise:

| Métrica | Valor Encontrado | Threshold | Status |
|---|---|---|---|
| `http_req_duration p(95)` | _preencher_ | < 2000ms | ✓/✗ |
| `http_req_failed rate` | _preencher_ | < 1% | ✓/✗ |
| `checks rate` | _preencher_ | > 95% | ✓/✗ |
| `http_reqs` (total) | _preencher_ | — | — |
| `http_req_duration avg` | _preencher_ | — | — |
| `http_req_duration max` | _preencher_ | — | — |
| `vus_max` | _preencher_ | 500 | — |

- [ ] **Step 4: Criar análise de resultados em `docs/k6-analysis.md`**

Criar o arquivo com a seguinte estrutura (preencher com valores reais do relatório):

```markdown
# Análise do Teste de Carga K6

## Configuração
- **API alvo:** https://reqres.in/api
- **Ferramenta:** K6
- **Cenário:** Rampa gradual 0 → 500 VUs → 0 em 5 minutos
- **Endpoints testados:** GET /users, GET /users/:id, POST /users

## Resultados

| Métrica | Valor | Threshold | Status |
|---|---|---|---|
| p(95) duração | Xms | < 2000ms | ✓/✗ |
| Taxa de erro | X% | < 1% | ✓/✗ |
| Taxa de checks | X% | > 95% | ✓/✗ |
| Total requisições | X | — | — |
| Req/s médio | X | — | — |

## Análise de Gargalos

### Pontos Positivos
- [descrever o que passou nos thresholds]

### Gargalos Identificados
- [descrever qualquer threshold que falhou ou métrica preocupante]

### Comportamento sob Carga Máxima (500 VUs)
- [descrever como o p95 se comportou durante o pico]
- [descrever se houve aumento de erros no pico]

## Recomendações
- [recomendações baseadas nos resultados]
```

- [ ] **Step 5: Commit final**

```bash
git add docs/k6-analysis.md
git commit -m "docs: add k6 load test analysis report"
```

---

## Self-Review

### Cobertura da Spec
- [x] Tarefa 1: Script K6 com 500 VUs simultâneos → Task 3 (rampa chega a 500 VUs com `sustain` de 1 min)
- [x] Tarefa 1: Duração de 5 minutos → Task 3 (5 stages × 1 min = 5 min total)
- [x] Tarefa 1: Qualidade do script → Tasks 2+3 (helpers separados, thresholds, tags, cenários múltiplos)
- [x] Tarefa 1: Uso correto de métricas → Task 3 (p95, error rate, checks rate, tags por endpoint)
- [x] Tarefa 1: Identificação de gargalos → Task 3 (thresholds por endpoint) + Task 5 Step 4
- [x] Tarefa 2: Gerar relatório → Tasks 4+5 (k6-html-reporter → index.html)
- [x] Tarefa 2: Análise do resultado → Task 5 Steps 3+4 (tabela de métricas + análise textual)

### Checagem de Placeholders
- Sem TBD ou TODO no plano.
- Todos os blocos de código são completos e executáveis.

### Consistência de Tipos
- `http-client.ts` exporta `getUsers`, `getUserById`, `createUser` — todos importados corretamente em `load-test.ts`.
- `checks.ts` exporta `checkStatus`, `checkResponseTime`, `checkJsonBody` — todos importados em `load-test.ts`.
- `generate-report.js` referencia `summary.json` que é gerado pelo flag `--out json=reports/k6/summary.json` em `package.json`.
