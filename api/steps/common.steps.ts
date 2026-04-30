import { createBdd } from 'playwright-bdd';
import { expect, APIRequestContext } from '@playwright/test';
import { ApiClient, ApiResponse } from '../helpers/api.client';
import { BASE_URL } from '../helpers/constants';

const { Then } = createBdd();

// --- State management ---

const scenarioState = new WeakMap<object, { response: ApiResponse | undefined; responses: ApiResponse[] }>();

export function getState(request: object) {
  if (!scenarioState.has(request)) {
    scenarioState.set(request, { response: undefined, responses: [] });
  }
  return scenarioState.get(request)!;
}

export function getResponse(request: object): ApiResponse {
  const { response } = getState(request);
  if (!response) throw new Error('Nenhuma resposta capturada — verifique o step Dado');
  return response;
}

export function makeClient(request: APIRequestContext): ApiClient {
  return new ApiClient(request, BASE_URL);
}

export function getField(body: unknown, field: string): unknown {
  return field.split('.').reduce((obj, key) => (obj as Record<string, unknown>)?.[key], body);
}

export type BddDataTable = { rowsHash(): Record<string, string> };

// --- Steps genéricos de resposta (reutilizados por todas as features) ---

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
