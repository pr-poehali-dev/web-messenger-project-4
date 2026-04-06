const URLS = {
  auth: 'https://functions.poehali.dev/23a2b5a0-7a17-4a6d-a8d7-6ee302d83d28',
  chats: 'https://functions.poehali.dev/f3de52d2-f35e-45a2-8ac7-e9120427a2d0',
  users: 'https://functions.poehali.dev/18ba397a-3488-4ff4-aa2a-70340dedf895',
  messages: 'https://functions.poehali.dev/e3ecfab6-23de-438d-a10a-024e5e35984d',
};

function getToken(): string | null {
  return localStorage.getItem('pulse_token');
}

function setToken(token: string) {
  localStorage.setItem('pulse_token', token);
}

function clearToken() {
  localStorage.removeItem('pulse_token');
  localStorage.removeItem('pulse_user');
}

function setUser(user: object) {
  localStorage.setItem('pulse_user', JSON.stringify(user));
}

function getUser() {
  const raw = localStorage.getItem('pulse_user');
  return raw ? JSON.parse(raw) : null;
}

async function request(base: keyof typeof URLS, action: string, method: 'GET' | 'POST', body?: object) {
  const url = new URL(URLS[base]);
  url.searchParams.set('action', action);
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export const api = {
  getToken,
  setToken,
  clearToken,
  setUser,
  getUser,

  auth: {
    register: (username: string, display_name: string, password: string) =>
      request('auth', 'register', 'POST', { username, display_name, password }),
    login: (username: string, password: string) =>
      request('auth', 'login', 'POST', { username, password }),
    logout: () => request('auth', 'logout', 'POST'),
    me: () => request('auth', 'me', 'GET'),
  },

  chats: {
    list: () => request('chats', 'list', 'GET'),
    create: (member_ids: string[], is_group = false, name = '', color = '#a855f7') =>
      request('chats', 'create', 'POST', { member_ids, is_group, name, color }),
    members: (chat_id: string) => {
      const url = new URL(URLS.chats);
      url.searchParams.set('action', 'members');
      url.searchParams.set('chat_id', chat_id);
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(url.toString(), { headers }).then(r => r.json());
    },
  },

  messages: {
    list: (chat_id: string, limit = 50, offset = 0) => {
      const url = new URL(URLS.messages);
      url.searchParams.set('action', 'list');
      url.searchParams.set('chat_id', chat_id);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('offset', String(offset));
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(url.toString(), { headers }).then(r => r.json());
    },
    send: (chat_id: string, text: string) =>
      request('messages', 'send', 'POST', { chat_id, text }),
    react: (message_id: string, emoji: string) =>
      request('messages', 'reaction', 'POST', { message_id, emoji }),
  },

  users: {
    search: (q: string) => {
      const url = new URL(URLS.users);
      url.searchParams.set('action', 'search');
      url.searchParams.set('q', q);
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(url.toString(), { headers }).then(r => r.json());
    },
  },
};
