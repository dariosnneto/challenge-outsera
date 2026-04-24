import { check } from 'k6';
import { Response } from 'k6/http';

export function checkStatus(res: Response, expectedStatus: number): boolean {
  return check(res, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

export function checkResponseTime(res: Response, maxMs: number): boolean {
  return check(res, {
    [`response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

export function checkJsonBody(res: Response, key: string): boolean {
  return check(res, {
    [`body has '${key}'`]: (r) => {
      try {
        const body = JSON.parse(r.body as string);
        return key in body;
      } catch {
        return false;
      }
    },
  });
}
