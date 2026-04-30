import { createBdd } from 'playwright-bdd';
import { makeClient, getState } from './common.steps';

const { Given } = createBdd();

Given('que faço um DELETE em {string}', async ({ request }, path: string) => {
  const res = await makeClient(request).delete(path);
  const s = getState(request);
  s.response = res;
  s.responses = [res];
});
