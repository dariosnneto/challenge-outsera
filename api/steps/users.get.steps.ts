import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { makeClient, getState, getResponse } from './common.steps';

const { Given, Then } = createBdd();

Given(
  'que faço um GET em {string} com parâmetro {string} igual a {string}',
  async ({ request }, path: string, param: string, value: string) => {
    const res = await makeClient(request).get(path, { [param]: value });
    const s = getState(request);
    s.response = res;
    s.responses.push(res);
  }
);

Given('que faço um GET em {string}', async ({ request }, path: string) => {
  const res = await makeClient(request).get(path);
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
