import { createBdd } from 'playwright-bdd';
import { makeClient, getState, BddDataTable } from './common.steps';

const { Given } = createBdd();

Given(
  'que faço um PUT em {string} com os dados:',
  async ({ request }, path: string, dataTable: BddDataTable) => {
    const res = await makeClient(request).put(path, dataTable.rowsHash());
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given(
  'que faço um PUT em {string} com corpo texto {string}',
  async ({ request }, path: string, body: string) => {
    const res = await makeClient(request).putRaw(path, body, 'text/plain');
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);

Given(
  'que faço um PATCH em {string} com os dados:',
  async ({ request }, path: string, dataTable: BddDataTable) => {
    const res = await makeClient(request).patch(path, dataTable.rowsHash());
    const s = getState(request);
    s.response = res;
    s.responses = [res];
  }
);
