import { sleep } from 'k6';
import { Options } from 'k6/options';
import { getUsers, getUserById, createUser } from './helpers/http-client.ts';
import { checkStatus, checkResponseTime, checkJsonBody } from './helpers/checks.ts';

const scenario = __ENV.K6_SCENARIO || 'load';

// Smoke: valida que o sistema responde antes de qualquer teste de carga
const smokeStages = [
  { duration: '15s', target: 3 },
  { duration: '15s', target: 0 },
];

// Load: rampagem linear escalonada até capacidade nominal
const loadStages = [
  { duration: '1m', target: 100 },
  { duration: '1m', target: 300 },
  { duration: '1m', target: 500 },
  { duration: '1m', target: 500 },
  { duration: '1m', target: 0 },
];

// Spike: pico abrupto para verificar resiliência a rajadas repentinas de tráfego
const spikeStages = [
  { duration: '10s', target: 10 },
  { duration: '10s', target: 500 },  // pico abrupto
  { duration: '30s', target: 500 },  // sustenta o pico
  { duration: '10s', target: 10 },   // queda brusca
  { duration: '20s', target: 0 },
];

// Stress: escalonamento progressivo além da capacidade nominal para encontrar o ponto de ruptura
const stressStages = [
  { duration: '2m', target: 200 },
  { duration: '2m', target: 400 },
  { duration: '2m', target: 600 },
  { duration: '2m', target: 800 },
  { duration: '2m', target: 0 },
];

// Soak: carga moderada com oscilação periódica por período prolongado
// detecta degradação de performance e vazamentos de memória ao longo do tempo
const soakStages = [
  { duration: '2m',  target: 200 },
  { duration: '5m',  target: 200 },  // platô estável
  { duration: '1m',  target: 50 },   // oscilação para baixo
  { duration: '5m',  target: 200 },  // retorno ao platô
  { duration: '1m',  target: 50 },   // segunda oscilação
  { duration: '5m',  target: 200 },  // retorno ao platô
  { duration: '2m',  target: 0 },
];

const stages: Record<string, { duration: string; target: number }[]> = {
  smoke:  smokeStages,
  load:   loadStages,
  spike:  spikeStages,
  stress: stressStages,
  soak:   soakStages,
};

export const options: Options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stages[scenario] ?? loadStages,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:GET /users}': ['p(95)<1500'],
    'http_req_duration{name:GET /users/:id}': ['p(95)<1500'],
    'http_req_duration{name:POST /users}': ['p(95)<2000'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  const listRes = getUsers(1);
  checkStatus(listRes, 200);
  checkResponseTime(listRes, 2000);
  checkJsonBody(listRes, 'data');

  sleep(0.5);

  const userId = Math.floor(Math.random() * 12) + 1;
  const getRes = getUserById(userId);
  checkStatus(getRes, 200);
  checkResponseTime(getRes, 2000);
  checkJsonBody(getRes, 'data');

  sleep(0.5);

  const createRes = createUser('Load Test User', 'QA Engineer');
  checkStatus(createRes, 201);
  checkResponseTime(createRes, 2000);
  checkJsonBody(createRes, 'id');

  sleep(1);
}

export function handleSummary(data: Record<string, unknown>) {
  return {
    '../reports/k6/summary-handleSummary.json': JSON.stringify(data, null, 2),
  };
}
