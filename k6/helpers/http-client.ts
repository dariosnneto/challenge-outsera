import http from 'k6/http';
import { Params, Response } from 'k6/http';

const BASE_URL = 'https://reqres.in/api';
const API_KEY = __ENV.REQRES_API_KEY;

function baseHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'x-api-key': API_KEY };
}

export function getUsers(page: number = 1): Response {
  const params: Params = { headers: baseHeaders(), tags: { name: 'GET /users' } };
  return http.get(`${BASE_URL}/users?page=${page}`, params);
}

export function getUserById(id: number): Response {
  const params: Params = { headers: baseHeaders(), tags: { name: 'GET /users/:id' } };
  return http.get(`${BASE_URL}/users/${id}`, params);
}

export function createUser(name: string, job: string): Response {
  const payload = JSON.stringify({ name, job });
  const params: Params = { headers: baseHeaders(), tags: { name: 'POST /users' } };
  return http.post(`${BASE_URL}/users`, payload, params);
}
