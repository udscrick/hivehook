import { MockEndpoint, RequestLog } from './types';

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string') {
        message = (data as { error: string }).error;
      }
    } catch (_err) {
        console.log("Error: ",_err)
      // ignore parse errors; fall back to status text
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getEndpoints(): Promise<MockEndpoint[]> {
  const res = await fetch('/admin/endpoints');
  return handleResponse(res);
}

export async function createEndpoint(data: Omit<MockEndpoint, 'id' | 'createdAt'>): Promise<MockEndpoint> {
  const res = await fetch('/admin/endpoints', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateEndpoint(id: string, data: Partial<Omit<MockEndpoint, 'id' | 'createdAt'>>): Promise<MockEndpoint> {
  const res = await fetch(`/admin/endpoints/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteEndpoint(id: string): Promise<void> {
  const res = await fetch(`/admin/endpoints/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
}

export async function getLogs(limit = 200): Promise<RequestLog[]> {
  const res = await fetch(`/admin/logs?limit=${limit}`);
  return handleResponse(res);
}

export async function clearLogs(): Promise<void> {
  const res = await fetch('/admin/logs', { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
} 