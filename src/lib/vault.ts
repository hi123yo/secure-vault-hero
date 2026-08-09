export type VaultItem = {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  username: string | null;
  password: string;
  notes: string | null;
  category: string;
  favorite: boolean;
  password_updated_at: string;
  created_at: string;
  updated_at: string;
};

export const CATEGORIES = ["login", "banking", "work", "social", "wifi", "note"] as const;

const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}<>?";

export type GeneratorOptions = {
  length: number;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
};

function randomInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] ?? 0) % max;
}

export function generatePassword({ length, upper, digits, symbols }: GeneratorOptions) {
  let pool = LOWER;
  if (upper) pool += UPPER;
  if (digits) pool += DIGITS;
  if (symbols) pool += SYMBOLS;
  let out = "";
  for (let i = 0; i < length; i++) out += pool[randomInt(pool.length)];
  return out;
}

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string };

const COMMON = [
  "password",
  "123456",
  "qwerty",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
  "111111",
];

export function scorePassword(password: string): Strength {
  if (!password) return { score: 0, label: "Empty" };
  const lower = password.toLowerCase();
  if (COMMON.some((c) => lower.includes(c))) return { score: 0, label: "Critical" };

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (password.length >= 16) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;
  if (new Set(password).size < password.length / 2) points--;

  const score = Math.max(0, Math.min(4, points - 1)) as Strength["score"];
  const labels = ["Critical", "Weak", "Fair", "Strong", "Ironclad"];
  return { score, label: labels[score] ?? "Weak" };
}

export function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export type SecurityReport = {
  weak: VaultItem[];
  reused: VaultItem[];
  stale: VaultItem[];
  healthScore: number;
};

export function buildSecurityReport(items: VaultItem[]): SecurityReport {
  const withPassword = items.filter((i) => i.password.length > 0);
  const weak = withPassword.filter((i) => scorePassword(i.password).score <= 1);

  const counts = new Map<string, number>();
  for (const item of withPassword) {
    counts.set(item.password, (counts.get(item.password) ?? 0) + 1);
  }
  const reused = withPassword.filter((i) => (counts.get(i.password) ?? 0) > 1);
  const stale = withPassword.filter((i) => daysSince(i.password_updated_at) > 180);

  const flagged = new Set([...weak, ...reused, ...stale].map((i) => i.id)).size;
  const healthScore = withPassword.length
    ? Math.round(((withPassword.length - flagged) / withPassword.length) * 100)
    : 100;

  return { weak, reused, stale, healthScore };
}