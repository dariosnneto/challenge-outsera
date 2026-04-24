import { sleep } from 'k6';
import { Options } from 'k6/options';
import { getUsers, getUserById, createUser } from './helpers/http-client.ts';
import { checkStatus, checkResponseTime, checkJsonBody } from './helpers/checks.ts';

const isSmoke = __ENV.K6_SCENARIO === 'smoke';

const smokeStages = [
  { duration: '15s', target: 3 },
  { duration: '15s', target: 0 },
];

const loadStages = [
  { duration: '1m', target: 100 },
  { duration: '1m', target: 300 },
  { duration: '1m', target: 500 },
  { duration: '1m', target: 500 },
  { duration: '1m', target: 0 },
];

export const options: Options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: isSmoke ? smokeStages : loadStages,
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
