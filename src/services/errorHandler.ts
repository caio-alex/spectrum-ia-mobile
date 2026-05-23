import axios from 'axios';

/**
 * Mensagens de erro amigáveis para o usuário. Garantimos que NUNCA repassamos:
 *  - stack traces
 *  - mensagens internas do backend que vazem implementação (ex.: "JPA",
 *    "Hibernate", "PSQLException", paths de arquivo)
 *  - payloads cifrados ou tokens
 *
 * O backend já está configurado para devolver ApiError limpo, mas a defesa em
 * profundidade exige que o client filtre também — caso algum endpoint legado
 * ou proxy intermediário devolva HTML/stack.
 */

const INTERNAL_LEAK_PATTERNS = [
  /stack/i,
  /trace/i,
  /exception/i,
  /\bSQL\b/i,
  /hibernate/i,
  /\bnull pointer\b/i,
  /\borg\.[a-z.]+/i,
  /\bcom\.[a-z.]+/i,
  /\bjava\.[a-z.]+/i,
];

const STATUS_FALLBACK: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada ou credenciais inválidas.',
  403: 'Você não tem permissão para esta operação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: o recurso já existe.',
  422: 'Dados inválidos. Verifique os campos e tente novamente.',
  429: 'Muitas requisições. Aguarde alguns instantes e tente novamente.',
  500: 'Falha no servidor. Tente novamente em instantes.',
  502: 'Serviço temporariamente indisponível.',
  503: 'Serviço temporariamente indisponível.',
  504: 'Tempo esgotado. Tente novamente.',
};

export interface ExtractErrorOptions {
  /** Mensagem padrão se não houver nada utilizável. */
  fallback?: string;
  /** Overrides por status code. */
  byStatus?: Record<number, string>;
}

export function extractApiErrorMessage(err: unknown, opts: ExtractErrorOptions = {}): string {
  const fallback = opts.fallback ?? 'Não foi possível concluir a operação. Tente novamente.';

  if (!axios.isAxiosError(err)) {
    return fallback;
  }

  if (err.code === 'ECONNABORTED') return 'Tempo esgotado. Verifique sua conexão.';
  if (err.code === 'ERR_NETWORK') return 'Sem conexão. Verifique a internet.';

  const status = err.response?.status;
  if (status && opts.byStatus?.[status]) return opts.byStatus[status];

  const body = err.response?.data as
    | { message?: unknown; error?: unknown; fields?: Array<{ field?: string; message?: string }> }
    | undefined;

  // Mensagem do primeiro campo inválido — útil para 400 de validação
  if (Array.isArray(body?.fields) && body.fields.length > 0) {
    const first = body.fields[0];
    if (typeof first?.message === 'string' && isSafeMessage(first.message)) {
      const prefix = first.field ? `${first.field}: ` : '';
      return `${prefix}${first.message}`;
    }
  }

  if (typeof body?.message === 'string' && isSafeMessage(body.message)) {
    return body.message;
  }

  if (status && STATUS_FALLBACK[status]) return STATUS_FALLBACK[status];

  return fallback;
}

function isSafeMessage(msg: string): boolean {
  if (!msg) return false;
  if (msg.length > 400) return false;
  // HTML page do proxy / Spring Whitelabel
  if (/<\/?[a-z][\s\S]*>/i.test(msg)) return false;
  if (INTERNAL_LEAK_PATTERNS.some((re) => re.test(msg))) return false;
  return true;
}
