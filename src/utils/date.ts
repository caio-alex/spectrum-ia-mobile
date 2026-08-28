// src/utils/date.ts
//
// Formatação manual (sem Intl) — o Hermes nem sempre embarca o ICU completo,
// então `toLocaleDateString('pt-BR')` pode cair no formato en-US em release.

const pad = (n: number): string => String(n).padStart(2, '0');

const parse = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** `dd/mm/aaaa` — devolve `—` quando a data é nula ou inválida. */
export function formatDate(iso: string | null | undefined): string {
  const date = parse(iso);
  if (!date) return '—';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** `dd/mm/aaaa às hh:mm`. */
export function formatDateTime(iso: string | null | undefined): string {
  const date = parse(iso);
  if (!date) return '—';
  return `${formatDate(iso)} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `agora`, `há 5 min`, `há 3 h`, `há 2 d` — acima de 7 dias vira data absoluta. */
export function relativeTime(iso: string | null | undefined): string {
  const date = parse(iso);
  if (!date) return '—';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} d`;
  return formatDate(iso);
}
