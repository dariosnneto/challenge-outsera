# K6 WireMock Mock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar suporte a mock local via WireMock para os testes K6, eliminando a dependência do rate limit do reqres.in, com um script `test:k6:mock` que sobe o WireMock via Docker, executa o K6 apontando para `http://localhost:8080`, e derruba o container ao final.

**Architecture:** WireMock standalone em container Docker (porta 8080) com stubs para os 3 endpoints testados (GET /api/users, GET /api/users/:id, POST /api/users). K6 permanece no host Windows. O `http-client.ts` passa a ler `BASE_URL` de `__ENV.BASE_URL` (com fallback para reqres.in). O `run-k6.js` aceita flag `--mock` para subir/derrubar o container e passar `BASE_URL=http://localhost:8080`.

**Tech Stack:** WireMock 3.x (Docker `wiremock/wiremock:latest`), Docker Compose v2, K6 v1.7.1 (host), Node.js `child_process` para orquestração.

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `docker-compose.yml` | Criar | Define serviço WireMock na porta 8080, monta `wiremock/mappings/` |
| `wiremock/mappings/get-users.json` | Criar | Stub GET /api/users?page=1 → 200 com body reqres-like |
| `wiremock/mappings/get-user-by-id.json` | Criar | Stub GET /api/users/* → 200 com body reqres-like |
| `wiremock/mappings/create-user.json` | Criar | Stub POST /api/users → 201 com body reqres-like |
| `k6/helpers/http-client.ts` | Modificar | Ler `BASE_URL` de `__ENV.BASE_URL` em vez de hardcode |
| `k6/run-k6.js` | Modificar | Aceitar flag `--mock`, orquestrar docker compose up/down |
| `package.json` | Modificar | Adicionar script `test:k6:mock` e `test:k6:mock:report` |

---

## Task 1: Criar docker-compose.yml e stubs WireMock

**Files:**
- Create: `docker-compose.yml`
- Create: `wiremock/mappings/get-users.json`
- Create: `wiremock/mappings/get-user-by-id.json`
- Create: `wiremock/mappings/create-user.json`

- [ ] **Step 1: Criar `docker-compose.yml` na raiz do projeto**

```yaml
services:
  wiremock:
    image: wiremock/wiremock:latest
    container_name: k6-wiremock
    ports:
      - "8080:8080"
    volumes:
      - ./wiremock/mappings:/home/wiremock/mappings
    command: --port 8080 --verbose
```

- [ ] **Step 2: Criar diretório `wiremock/mappings/`**

```bash
mkdir -p wiremock/mappings
```

- [ ] **Step 3: Criar `wiremock/mappings/get-users.json`**

Este stub responde a `GET /api/users?page=1` (e qualquer `page`) com o formato exato que o K6 verifica: objeto JSON com chave `data`.

```json
{
  "request": {
    "method": "GET",
    "urlPathPattern": "/api/users",
    "queryParameters": {
      "page": {
        "matches": ".*"
      }
    }
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "page": 1,
      "per_page": 6,
      "total": 12,
      "total_pages": 2,
      "data": [
        { "id": 1, "email": "george.bluth@reqres.in", "first_name": "George", "last_name": "Bluth" },
        { "id": 2, "email": "janet.weaver@reqres.in", "first_name": "Janet", "last_name": "Weaver" }
      ]
    }
  }
}
```

- [ ] **Step 4: Criar `wiremock/mappings/get-user-by-id.json`**

Este stub responde a `GET /api/users/<qualquer id>` com um objeto JSON com chave `data`.

```json
{
  "request": {
    "method": "GET",
    "urlPathPattern": "/api/users/[0-9]+"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "data": {
        "id": 1,
        "email": "george.bluth@reqres.in",
        "first_name": "George",
        "last_name": "Bluth"
      }
    }
  }
}
```

- [ ] **Step 5: Criar `wiremock/mappings/create-user.json`**

Este stub responde a `POST /api/users` com 201 e um objeto JSON com chave `id`.

```json
{
  "request": {
    "method": "POST",
    "urlPath": "/api/users"
  },
  "response": {
    "status": 201,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "id": "999",
      "name": "Load Test User",
      "job": "QA Engineer",
      "createdAt": "2026-04-24T00:00:00.000Z"
    }
  }
}
```

- [ ] **Step 6: Verificar que o WireMock sobe corretamente**

```bash
docker compose up -d wiremock
```

Aguardar ~3 segundos e testar:

```bash
curl http://localhost:8080/api/users?page=1
```

Saída esperada: JSON com chave `data` e status 200.

```bash
curl http://localhost:8080/api/users/1
```

Saída esperada: JSON com chave `data` e status 200.

```bash
curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json" -d '{"name":"test","job":"dev"}'
```

Saída esperada: JSON com chave `id` e status 201.

```bash
docker compose down
```

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml wiremock/
git commit -m "feat(k6): add wiremock stubs for load test mock mode"
```

---

## Task 2: Atualizar `http-client.ts` para usar `BASE_URL` dinâmico

**Files:**
- Modify: `k6/helpers/http-client.ts`

O `http-client.ts` atual tem `BASE_URL` hardcoded para `https://reqres.in/api`. Precisamos que ele leia de `__ENV.BASE_URL`, com fallback para o valor atual caso não esteja definido. O header `x-api-key` só deve ser enviado quando a key estiver disponível (mock não precisa de auth).

- [ ] **Step 1: Atualizar `k6/helpers/http-client.ts`**

Substituir o conteúdo completo por:

```typescript
import http from 'k6/http';
import { Params, Response } from 'k6/http';

const BASE_URL = __ENV.BASE_URL || 'https://reqres.in/api';
const API_KEY = __ENV.REQRES_API_KEY || '';

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  return headers;
}

export function getUsers(page: number = 1): Response {
  const params: Params = { headers: baseHeaders(), tags: { name: 'GET /users' } };
  return http.get(`${BASE_URL}/users?page=${page}`, params);
}

export function getUserById(id: number): Response {
  const params: Params = { headers: baseHeaders(), tags: { name: 'GET /users/:id' } };
  return http.get(`${BASE_URL}/users/${id}`, params);
}

export function createUser(name: string, job: string): Response {
  const payload = JSON.stringify({ name, job });
  const params: Params = { headers: baseHeaders(), tags: { name: 'POST /users' } };
  return http.post(`${BASE_URL}/users`, payload, params);
}
```

- [ ] **Step 2: Validar dry-run contra WireMock manualmente**

```bash
docker compose up -d wiremock
```

Aguardar 3s, depois rodar de dentro de `k6/`:

```bash
"C:\Program Files\k6\k6.exe" run --vus 1 --duration 10s --env BASE_URL=http://localhost:8080/api load-test.ts
```

Saída esperada: todos os checks `✓`, `http_req_failed rate=0.00%`, `checks rate=100%`.

```bash
docker compose down
```

- [ ] **Step 3: Commit**

```bash
git add k6/helpers/http-client.ts
git commit -m "feat(k6): make BASE_URL configurable via env var"
```

---

## Task 3: Atualizar `run-k6.js` para suportar flag `--mock`

**Files:**
- Modify: `k6/run-k6.js`

O `run-k6.js` atual não suporta mock. Precisamos que ele:
1. Detecte a flag `--mock` nos argumentos de processo
2. Em modo mock: suba o WireMock via `docker compose up -d`, aguarde o health check, execute o K6 com `BASE_URL=http://localhost:8080/api`, e derrube o container ao final (mesmo em caso de erro)
3. Em modo normal: comportamento atual (reqres.in com API key)

- [ ] **Step 1: Substituir conteúdo de `k6/run-k6.js`**

```javascript
const { execSync, execFileSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isMock = process.argv.includes('--mock');
const k6Bin = process.platform === 'win32'
  ? 'C:\\Program Files\\k6\\k6.exe'
  : 'k6';
const outputFile = path.resolve(__dirname, '../reports/k6/summary.json');
const projectRoot = path.resolve(__dirname, '..');

function waitForWireMock(retries = 15, delayMs = 1000) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      http.get('http://localhost:8080/__admin/health', (res) => {
        if (res.statusCode === 200) return resolve();
        retry();
      }).on('error', retry);
    };
    const retry = () => {
      attempts++;
      if (attempts >= retries) return reject(new Error('WireMock did not start in time'));
      setTimeout(check, delayMs);
    };
    check();
  });
}

async function run() {
  if (isMock) {
    console.log('[mock] Starting WireMock...');
    execSync('docker compose up -d wiremock', { cwd: projectRoot, stdio: 'inherit' });
    try {
      await waitForWireMock();
      console.log('[mock] WireMock ready. Running K6 against http://localhost:8080/api');
      execFileSync(k6Bin, [
        'run',
        '--env', 'BASE_URL=http://localhost:8080/api',
        '--out', `json=${outputFile}`,
        'load-test.ts',
      ], { cwd: __dirname, stdio: 'inherit' });
    } finally {
      console.log('[mock] Stopping WireMock...');
      execSync('docker compose down', { cwd: projectRoot, stdio: 'inherit' });
    }
  } else {
    const apiKey = process.env.REQRES_API_KEY || '';
    execFileSync(k6Bin, [
      'run',
      '--env', `REQRES_API_KEY=${apiKey}`,
      '--out', `json=${outputFile}`,
      'load-test.ts',
    ], { cwd: __dirname, stdio: 'inherit' });
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Verificar que o modo normal ainda funciona (dry-run, sem chamar a API)**

Apenas checar que o script não quebra na inicialização:

```bash
node k6/run-k6.js --help 2>&1 || true
```

Saída esperada: sem erros de sintaxe Node.js (pode sair com erro de K6 não encontrado — isso é OK).

- [ ] **Step 3: Commit**

```bash
git add k6/run-k6.js
git commit -m "feat(k6): add --mock flag to run-k6.js with WireMock orchestration"
```

---

## Task 4: Adicionar scripts npm e validar end-to-end

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Adicionar scripts `test:k6:mock` e `test:k6:mock:report` em `package.json`**

No bloco `"scripts"`, adicionar após `"test:k6:report"`:

```json
"test:k6:mock": "node k6/run-k6.js --mock",
"test:k6:mock:report": "npm run test:k6:mock && node k6/generate-report.js"
```

O `package.json` completo dos scripts deve ficar:

```json
"scripts": {
  "test:api": "playwright test --project=api --workers=1",
  "test:e2e": "playwright test --project=e2e",
  "test:e2e:cucumber": "cucumber-js",
  "test:all": "npm run test:api && npm run test:e2e",
  "report": "playwright show-report reports/html",
  "test:k6": "node k6/run-k6.js",
  "test:k6:report": "npm run test:k6 && node k6/generate-report.js",
  "test:k6:mock": "node k6/run-k6.js --mock",
  "test:k6:mock:report": "npm run test:k6:mock && node k6/generate-report.js"
}
```

- [ ] **Step 2: Criar diretório `reports/k6/` se não existir**

```bash
mkdir -p reports/k6
```

- [ ] **Step 3: Executar teste mock com 1 VU por 10s para validação rápida**

Antes de rodar os 500 VUs completos, validar o pipeline inteiro:

```bash
docker compose up -d wiremock
```

Aguardar 3s, depois:

```bash
"C:\Program Files\k6\k6.exe" run --vus 1 --duration 10s --env BASE_URL=http://localhost:8080/api k6/load-test.ts
```

Saída esperada:
```
✓ status is 200
✓ response time < 2000ms
✓ body has 'data'
✓ status is 201
✓ body has 'id'
checks rate=100%
http_req_failed rate=0.00%
```

```bash
docker compose down
```

- [ ] **Step 4: Executar o teste mock completo via npm script**

```bash
npm run test:k6:mock
```

O script deve:
1. Imprimir `[mock] Starting WireMock...`
2. Subir o container `k6-wiremock`
3. Imprimir `[mock] WireMock ready. Running K6 against http://localhost:8080/api`
4. Executar K6 com o cenário completo (500 VUs, 5 minutos) — todos os thresholds devem passar
5. Imprimir `[mock] Stopping WireMock...`
6. Derrubar o container

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "feat(k6): add test:k6:mock and test:k6:mock:report npm scripts"
```

---

## Self-Review

### Cobertura da Spec

- [x] WireMock via Docker Compose → Task 1
- [x] Stubs para GET /api/users, GET /api/users/:id, POST /api/users → Task 1
- [x] K6 no host, WireMock em container → arquitetura correta (Tasks 2-4)
- [x] `BASE_URL` via `__ENV.BASE_URL` → Task 2
- [x] `npm run test:k6:mock` → Task 4
- [x] Modo normal (`test:k6`) inalterado → Task 3 mantém o branch sem `--mock`
- [x] WireMock derrubado ao final mesmo em erro → `finally` block em Task 3

### Placeholder Scan

- Sem TBD ou TODO.
- Todos os blocos de código são completos.
- Comandos `curl` para verificação manual incluídos na Task 1.

### Consistência de Tipos

- `BASE_URL` em `http-client.ts` vira `__ENV.BASE_URL` — passado como `--env BASE_URL=...` no `run-k6.js` ✓
- `execFileSync` usado com array de args em Task 3 — evita shell injection com paths que contêm espaços ✓
- `waitForWireMock` checa `/__admin/health` — endpoint nativo do WireMock 3.x ✓
- Stubs usam `urlPathPattern` com regex para os endpoints dinâmicos — compatível com WireMock 3.x ✓
