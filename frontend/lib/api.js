// ========== API 请求封装 ==========
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('未登录或登录已过期');
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

// 流式请求（SSE）
export async function apiFetchStream(url, body, onChunk, onDone, onError) {
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '请求失败' }));
      onError?.(new Error(err.message || '请求失败'));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      // SSE 格式解析
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone?.();
            return;
          }
          try {
            onChunk(data);
          } catch {
            onChunk(data);
          }
        }
      }
    }
    onDone?.();
  } catch (e) {
    onError?.(e);
  }
}
