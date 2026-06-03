const BASE = '/api'

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  NO_SESSION: 'Требуется авторизация',
  UNAUTHORIZED: 'Требуется авторизация',
  NOT_OWNER: 'Можно изменять только свои записи',
  FORBIDDEN: 'Недостаточно прав',
  ENTRY_NOT_FOUND: 'Запись не найдена',
  NOT_FOUND: 'Не найдено',
  BAD_REQUEST: 'Проверьте правильность заполнения полей',
  TOO_MANY_REQUESTS: 'Слишком много попыток, попробуйте позже',
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
}

async function request(path: string, options?: RequestInit) {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const code: string | undefined = body?.code

    if (res.status === 401 && code === 'NO_SESSION' && typeof window !== 'undefined') {
      window.location.href = '/auth'
    }

    throw new Error(CODE_MESSAGES[code ?? ''] ?? body?.message ?? 'Ошибка запроса')
  }

  if (res.status === 204) return null

  return res.json()
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
}
