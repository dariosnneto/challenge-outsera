import http from 'k6/http';
import { Params, Response } from 'k6/http';

const BASE_URL = 'https://reqres.in/api';

export function getUsers(page: number = 1): Response {
  const params: Params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'GET /users' },
  };
  return http.get(`${BASE_URL}/users?page=${page}`, params);
}

export function getUserById(id: number): Response {
  const params: Params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'GET /users/:id' },
  };
  return http.get(`${BASE_URL}/users/${id}`, params);
}

export function createUser(name: string, job: string): Response {
  const payload = JSON.stringify({ name, job });
  const params: Params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /users' },
  };
  return http.post(`${BASE_URL}/users`, payload, params);
}
