// src/api/itemService.js
const BASE = 'http://localhost:8080/api/itens';

async function parseError(res) {
  try {
    const body = await res.json().catch(() => null);
    if (!body) return `Erro HTTP: ${res.status}`;
    return body.message || JSON.stringify(body);
  } catch {
    return `Erro HTTP: ${res.status}`;
  }
}

export async function createItem(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json().catch(() => null);
}

export async function getItemById(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Erro ao carregar item: ${res.status}`);
  return res.json();
}

export async function patchItemStatus(id, body) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json().catch(() => null);
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res));
  return;
}
