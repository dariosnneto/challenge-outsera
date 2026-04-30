import { createBdd } from 'playwright-bdd';
import { makeClient, getState, BddDataTable } from './common.steps';

const { Given } = createBdd();

Given(
  'que faço um POST em {string} com os dados:',
  async ({ request }, path: string, dataTable: BddDataTable) => {
    const res = await makeClient(request).post(path, dataTable.rowsHash());
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given('que faço um POST em {string} com corpo vazio', async ({ request }, path: string) => {
  const res = await makeClient(request).post(path, {});
  const s = getState(request);
  s.response = res;
  s.responses = [res];
});
