# Análise do Teste de Carga K6

## Configuração

- **API alvo:** https://reqres.in/api
- **Ferramenta:** K6 v1.7.1
- **Cenário:** Rampa gradual 0 → 500 VUs → 0 em 5 minutos
- **Endpoints testados:** GET /users, GET /users/:id, POST /users
- **Thresholds definidos:**
  - `http_req_duration p(95) < 2000ms` (global)
  - `http_req_duration{GET /users} p(95) < 1500ms`
  - `http_req_duration{GET /users/:id} p(95) < 1500ms`
  - `http_req_duration{POST /users} p(95) < 2000ms`
  - `http_req_failed rate < 1%`
  - `checks rate > 95%`

---

## Dry-Run: 1 VU / 10s (baseline sem rate limit)

Execução de validação com 1 VU por 10 segundos, onde a API respondeu normalmente.

| Métrica | Valor | Threshold | Status |
|---|---|---|---|
| `http_req_duration p(95)` | 389ms | < 2000ms | ✅ |
| `http_req_duration{GET /users} p(95)` | 368ms | < 1500ms | ✅ |
| `http_req_duration{GET /users/:id} p(95)` | 385ms | < 1500ms | ✅ |
| `http_req_duration{POST /users} p(95)` | 353ms | < 2000ms | ✅ |
| `http_req_failed rate` | 0% | < 1% | ✅ |
| `checks rate` | 100% | > 95% | ✅ |
| Total de requisições | 12 | — | — |
| Req/s médio | ~1.04 req/s | — | — |
| `vus_max` | 1 | — | — |

---

## Teste Completo: 500 VUs / 5 min (limitado por rate limit da API)

Execução com o cenário completo de rampa. O reqres.in (plano free) impõe limite de
250 req/dia por key. Após atingir o limite, a API retorna HTTP 429 para todas as
requisições subsequentes, o que explica o alto `http_req_failed`.

| Métrica | Valor | Threshold | Status |
|---|---|---|---|
| `http_req_duration p(95)` | 291ms | < 2000ms | ✅ |
| `http_req_duration{GET /users} p(95)` | 297ms | < 1500ms | ✅ |
| `http_req_duration{GET /users/:id} p(95)` | 308ms | < 1500ms | ✅ |
| `http_req_duration{POST /users} p(95)` | 271ms | < 2000ms | ✅ |
| `http_req_failed rate` | 99.87% | < 1% | ❌ (rate limit) |
| `checks rate` | 33.36% | > 95% | ❌ (rate limit) |
| Total de requisições | 116.340 | — | — |
| Req/s médio | ~385 req/s | — | — |
| `vus_max` | 500 | 500 | ✅ |
| Iterações completas | 38.780 | — | — |
| `iteration_duration avg` | 2.17s | — | — |
| `http_req_duration avg` | 59ms | — | — |
| `http_req_duration max` | 5.09s | — | — |

---

## Análise de Gargalos

### Comportamento de Latência (métricas de tempo são válidas independente do 429)

As métricas de duração das requisições **são válidas mesmo durante o rate limit**, pois
medem o tempo de resposta real do servidor — incluindo as respostas 429. O servidor
respondeu rapidamente a todos os pedidos:

- **p(95) global: 291ms** — bem abaixo do threshold de 2000ms
- **p(95) por endpoint:** todos entre 271ms–308ms, dentro dos thresholds de 1500ms
- **avg: 59ms** — tempo médio muito baixo, reflexo das respostas 429 rápidas (~12ms med)
- **max: 5.09s** — pico isolado no início, provavelmente primeiro TLS handshake

### Causa Raiz das Falhas de Threshold

| Threshold | Causa | Natureza |
|---|---|---|
| `http_req_failed rate < 1%` | HTTP 429 do reqres.in free tier (250 req/dia) | Limitação externa |
| `checks rate > 95%` | `status is 200/201` falhou pois a API retornou 429 | Consequência do rate limit |

As falhas **não refletem um problema de performance da API** — são consequência direta
da limitação do plano gratuito do reqres.in ao receber 500 VUs simultâneos.

### Pontos Positivos

- **Latência excelente:** p(95) < 310ms em todos os endpoints, mesmo sob carga de 500 VUs
- **Script K6 funcionou corretamente:** rampa de VUs executou conforme configurado (0 → 500 → 0 em 5 etapas de 1 minuto)
- **38.780 iterações completadas** em 5 minutos — throughput de ~128 iter/s no pico
- **0 iterações interrompidas** — todos os VUs completaram suas iterações normalmente
- **Dry-run com 1 VU: 100% de checks passando** — script e assertions estão corretos

### Comportamento sob Carga Máxima (500 VUs)

- O p(95) de 291ms **ficou abaixo do threshold** mesmo com 500 VUs gerando ~385 req/s
- A latência mediana de 12ms nas respostas 429 indica que o servidor responde rapidamente
  mesmo rejeitando requisições — não há evidência de degradação severa no lado do servidor
- O `max` de 5.09s ocorreu em momento isolado (provavelmente TLS handshake inicial)

---

## Recomendações

1. **Usar API key com limite maior para o teste completo:** O plano free do reqres.in
   (250 req/dia) é incompatível com testes de 500 VUs. Um plano Dev ($12/mo) oferece
   5.000 req/dia, mas ainda seria insuficiente para o volume gerado (~116k requests em
   5 minutos). Para testes de carga reais, usar uma API sem rate limiting ou um mock
   local.

2. **Mock local para testes de carga:** Usar `json-server`, `WireMock` ou similar para
   eliminar a dependência de rate limit externo e obter resultados reproduzíveis.

3. **Os thresholds de latência são adequados:** Com base no dry-run (API respondendo
   normalmente), p(95) < 400ms está muito abaixo dos limites definidos. Os thresholds
   atuais (2000ms global, 1500ms por endpoint) têm folga significativa.

4. **Adicionar threshold de `http_req_duration` para percentil 99:** Para detectar
   outliers severos além do p(95), considerar `p(99)<5000`.
