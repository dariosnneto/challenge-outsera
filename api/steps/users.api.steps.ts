import { createBdd } from 'playwright-bdd';
import { expect, APIRequestContext } from '@playwright/test';
import { ApiClient, ApiResponse } from '../helpers/api.client';
import { BASE_URL } from '../helpers/constants';

const { Given, Then } = createBdd();

function makeClient(request: APIRequestContext): ApiClient {
  return new ApiClient(request, BASE_URL);
}

const scenarioState = new WeakMap<object, { response: ApiResponse | undefined; responses: ApiResponse[] }>();

function getState(request: object) {
  if (!scenarioState.has(request)) {
    scenarioState.set(request, { response: undefined, responses: [] });
  }
  return scenarioState.get(request)!;
}

function getResponse(request: object): ApiResponse {
  const { response } = getState(request);
  if (!response) throw new Error('No response captured — check your Given step');
  return response;
}

type BddDataTable = { rowsHash(): Record<string, string> };

function getField(body: unknown, field: string): unknown {
  return field.split('.').reduce((obj, key) => (obj as Record<string, unknown>)?.[key], body);
}

Given(
  'que faço um GET em {string} com parâmetro {string} igual a {string}',
  async ({ request }, path: string, param: string, value: string) => {
    const client = makeClient(request);
    const res = await client.get(path, { [param]: value });
    const s = getState(request);
    s.response = res;
    s.responses.push(res);
  }
);

Given('que faço um GET em {string}', async ({ request }, path: string) => {
  const client = makeClient(request);
  const res = await client.get(path);
  const s = getState(request);
  s.response = res;
  s.responses = [res];
});

Then('as páginas não devem compartilhar IDs de usuários', ({ request }) => {
  const { responses } = getState(request);
  expect(responses.length).toBeGreaterThanOrEqual(2);
  const ids1 = (responses[0].body as { data: { id: number }[] }).data.map((u) => u.id);
  const ids2 = (responses[1].body as { data: { id: number }[] }).data.map((u) => u.id);
  expect(ids1.filter((id) => ids2.includes(id))).toHaveLength(0);
});

Given(
  'que faço um POST em {string} com os dados:',
  async ({ request }, path: string, dataTable: BddDataTable) => {
    const client = makeClient(request);
    const res = await client.post(path, dataTable.rowsHash());
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given('que faço um POST em {string} com corpo vazio', async ({ request }, path: string) => {
  const client = makeClient(request);
  const res = await client.post(path, {});
  const s = getState(request);
  s.response = res;
  s.responses = [res];
});

Given(
  'que faço um PUT em {string} com os dados:',
  async ({ request }, path: string, dataTable: BddDataTable) => {
    const client = makeClient(request);
    const res = await client.put(path, dataTable.rowsHash());
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given(
  'que faço um PUT em {string} com corpo texto {string}',
  async ({ request }, path: string, body: string) => {
    const raw = await request.put(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'text/plain' },
      data: body,
    });
    const res: ApiResponse = { status: raw.status(), headers: raw.headers(), body: undefined, raw };
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given(
  'que faço um PATCH em {string} com os dados:',
  async ({ request }, path: string, dataTable: BddDataTable) => {
    const client = makeClient(request);
    const res = await client.patch(path, dataTable.rowsHash());
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given('que faço um DELETE em {string}', async ({ request }, path: string) => {
  const client = makeClient(request);
  const res = await client.delete(path);
  const s = getState(request);
  s.response = res;
  s.responses = [res];
});

Then('o status da resposta deve ser {int}', ({ request }, status: number) => {
  expect(getResponse(request).status).toBe(status);
});

Then('o cabeçalho {string} deve conter {string}', ({ request }, header: string, value: string) => {
  expect(getResponse(request).headers[header]).toContain(value);
});

Then('o cabeçalho {string} não deve estar presente', ({ request }, header: string) => {
  expect(getResponse(request).headers[header]).toBeUndefined();
});

Then('o campo {string} deve ser igual a {int}', ({ request }, field: string, value: number) => {
  expect(getField(getResponse(request).body, field)).toBe(value);
});

Then('o campo {string} deve ser igual a {string}', ({ request }, field: string, value: string) => {
  expect(getField(getResponse(request).body, field)).toBe(value);
});

Then('o campo {string} deve ser um número', ({ request }, field: string) => {
  expect(typeof getField(getResponse(request).body, field)).toBe('number');
});

Then('o campo {string} deve ser uma lista não vazia', ({ request }, field: string) => {
  const actual = getField(getResponse(request).body, field) as unknown[];
  expect(Array.isArray(actual)).toBe(true);
  expect(actual.length).toBeGreaterThan(0);
});

Then('o campo {string} deve ser uma string não vazia', ({ request }, field: string) => {
  const actual = getField(getResponse(request).body, field) as string;
  expect(typeof actual).toBe('string');
  expect(actual.length).toBeGreaterThan(0);
});

Then('o campo {string} deve ser uma data ISO válida', ({ request }, field: string) => {
  const actual = getField(getResponse(request).body, field) as string;
  expect(typeof actual).toBe('string');
  expect(new Date(actual).getTime()).not.toBeNaN();
});

Then('o corpo da resposta deve ser um objeto vazio', ({ request }) => {
  expect(getResponse(request).body).toEqual({});
});

Then('o corpo da resposta deve estar vazio', ({ request }) => {
  expect(getResponse(request).body).toBeUndefined();
});
