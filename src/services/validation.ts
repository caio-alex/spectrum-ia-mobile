/**
 * Validações client-side espelhando as regras do backend (Bean Validation).
 * Servem como primeira linha de defesa para entradas malformadas — o backend
 * ainda valida tudo de novo (defense in depth).
 *
 * Cada função retorna {@code null} quando válido, ou a mensagem de erro.
 */

const SAFE_TEXT_REGEX = /^[A-Za-z0-9À-ſ\s\-./&()]+$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const LIMITS = {
  EMAIL_MAX: 254,
  PASSWORD_MIN: 10,
  PASSWORD_MAX: 128,
  COMPANY_MAX: 120,
  FULLNAME_MAX: 120,
  VEHICLE_FIELD_MAX: 80,
  TRIM_MAX: 120,
  SESSION_NAME_MAX: 120,
  SESSION_DESC_MAX: 1000,
} as const;

// Espelha StrongPasswordValidator.BLACKLIST do backend
const PASSWORD_BLACKLIST = new Set([
  'password1', 'password123', 'password2024', 'password2025',
  'passw0rd', 'p@ssw0rd', 'passw0rd1',
  'qwerty1', 'qwerty123', 'qwertyuiop1',
  'welcome1', 'welcome123', 'welcomeback1',
  'admin1', 'admin123', 'administrator1',
  'letmein1', 'iloveyou1', 'monkey1',
  'abcd1234', 'abcdef1', 'asdf1234',
  'spectrum1', 'spectrum123', 'automotivo1',
  'senha123', 'senha1234', 'senhaforte1',
  '123456789a', '1234567890a', 'qazwsx1',
  'trustno1', 'master1', 'dragon1',
]);

const TRIVIAL_SEQUENCES = [
  '0123456789', '9876543210',
  'abcdefghijklmnopqrstuvwxyz',
  'zyxwvutsrqponmlkjihgfedcba',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
];

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Informe o e-mail.';
  if (v.length > LIMITS.EMAIL_MAX) return 'E-mail muito longo.';
  if (!EMAIL_REGEX.test(v)) return 'E-mail inválido.';
  return null;
}

/**
 * Política de senha forte. Regras:
 * - 10 a 128 caracteres
 * - contém maiúscula, minúscula, dígito e caractere especial
 * - sem 3 caracteres iguais em sequência
 * - sem sequências triviais (1234, abcd, qwerty)
 * - não está em lista negra de senhas comuns
 * - não contém seu e-mail, nome ou nome da empresa (se passados)
 *
 * Espelha {@code StrongPasswordValidator} do backend + a regra de correlação
 * que está em {@code AuthServiceImpl.rejectPasswordContainingUserData}.
 */
export function validatePasswordStrength(
  value: string,
  context?: { email?: string; fullName?: string; companyName?: string },
): string | null {
  if (!value) return 'Informe a senha.';
  if (value.length < LIMITS.PASSWORD_MIN) {
    return `A senha deve ter ao menos ${LIMITS.PASSWORD_MIN} caracteres.`;
  }
  if (value.length > LIMITS.PASSWORD_MAX) {
    return `A senha não pode passar de ${LIMITS.PASSWORD_MAX} caracteres.`;
  }
  if (!/[a-z]/.test(value)) return 'A senha deve conter ao menos 1 letra minúscula.';
  if (!/[A-Z]/.test(value)) return 'A senha deve conter ao menos 1 letra maiúscula.';
  if (!/\d/.test(value)) return 'A senha deve conter ao menos 1 dígito.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'A senha deve conter ao menos 1 caractere especial (ex.: !@#$%).';
  if (/(.)\1\1/.test(value)) return 'A senha não pode ter 3 caracteres iguais em sequência.';

  const lower = value.toLowerCase();

  for (const seq of TRIVIAL_SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.substring(i, i + 4))) {
        return 'A senha não pode conter sequências triviais (1234, abcd, qwerty).';
      }
    }
  }

  const normalized = lower.replace(/[^a-z0-9]/g, '');
  if (PASSWORD_BLACKLIST.has(normalized)) {
    return 'Esta senha é comum demais — escolha outra.';
  }

  if (context) {
    const tokens: string[] = [];
    const emailLocal = (context.email ?? '').toLowerCase().split('@')[0] ?? '';
    [emailLocal, context.fullName ?? '', context.companyName ?? ''].forEach((src) => {
      src.toLowerCase().split(/[^a-z0-9]+/).forEach((t) => {
        if (t.length >= 4) tokens.push(t);
      });
    });
    for (const token of tokens) {
      if (lower.includes(token)) {
        return 'A senha não pode conter seu nome, e-mail ou nome da empresa.';
      }
    }
  }

  return null;
}

/**
 * Avalia cada requisito individualmente — útil para um medidor visual
 * na tela de cadastro, mostrando o que falta.
 */
export interface PasswordChecks {
  length: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
  special: boolean;
  noRepeat: boolean;
  noTrivial: boolean;
  notCommon: boolean;
  notUserData: boolean;
  allPassed: boolean;
}

export function evaluatePasswordChecks(
  value: string,
  context?: { email?: string; fullName?: string; companyName?: string },
): PasswordChecks {
  const lower = value.toLowerCase();
  const normalized = lower.replace(/[^a-z0-9]/g, '');

  const hasTrivial = TRIVIAL_SEQUENCES.some((seq) => {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.substring(i, i + 4))) return true;
    }
    return false;
  });

  const userTokens: string[] = [];
  if (context) {
    const emailLocal = (context.email ?? '').toLowerCase().split('@')[0] ?? '';
    [emailLocal, context.fullName ?? '', context.companyName ?? ''].forEach((src) => {
      src.toLowerCase().split(/[^a-z0-9]+/).forEach((t) => {
        if (t.length >= 4) userTokens.push(t);
      });
    });
  }
  const hasUserData = userTokens.length > 0 && userTokens.some((t) => lower.includes(t));

  const checks = {
    length: value.length >= LIMITS.PASSWORD_MIN && value.length <= LIMITS.PASSWORD_MAX,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    digit: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
    noRepeat: !/(.)\1\1/.test(value),
    noTrivial: value.length === 0 || !hasTrivial,
    notCommon: value.length === 0 || !PASSWORD_BLACKLIST.has(normalized),
    notUserData: !hasUserData,
  };
  const allPassed = Object.values(checks).every((v) => v);
  return { ...checks, allPassed };
}

export function validateNonEmpty(
  value: string,
  field: string,
  maxLength: number,
): string | null {
  const v = value.trim();
  if (!v) return `Informe ${field}.`;
  if (v.length > maxLength) return `${capitalize(field)} muito longo(a).`;
  return null;
}

export function validateSafeText(
  value: string,
  field: string,
  maxLength: number,
  required = true,
): string | null {
  const v = value.trim();
  if (!v) {
    return required ? `Informe ${field}.` : null;
  }
  if (v.length > maxLength) return `${capitalize(field)} muito longo(a).`;
  if (!SAFE_TEXT_REGEX.test(v)) {
    return `${capitalize(field)} contém caracteres inválidos.`;
  }
  return null;
}

export function validateYear(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (!Number.isInteger(value)) return 'Ano inválido.';
  if (value < 1990 || value > 2100) return 'Ano fora do intervalo permitido.';
  return null;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}
