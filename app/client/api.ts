import type { State, Proposal, Tokens } from '../shared/model.js';
export interface Bootstrap {
  csrf: string;
  figma: { label: string; connected: boolean };
  agents: { id: string; available: boolean; detail: string }[];
}
let csrf = '';
export async function request<T>(
  url: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/${url}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers:
      body === undefined
        ? {}
        : { 'Content-Type': 'application/json', 'X-DS-Studio': csrf },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? 'Le serveur ne répond pas.');
  return result;
}
export async function bootstrap() {
  const b = await request<Bootstrap>('bootstrap');
  csrf = b.csrf;
  return b;
}
export const getState = () => request<State>('state');
export const commit = (proposal: Proposal) =>
  request<State>('commit', { id: proposal.id });
export async function exportTokens() {
  const tokens = await request<Tokens>('export');
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(tokens, null, 2) + '\n'], {
      type: 'application/json',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'design-system.tokens.json';
  a.click();
  URL.revokeObjectURL(url);
}
