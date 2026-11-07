/**
 * ISO 6346 container number validation.
 *
 * Format: 4-letter owner code + category (e.g. "MSKU") + 6-digit serial +
 * 1 check digit = 11 characters total, e.g. "MSKU1234560".
 *
 * Check digit algorithm (ISO 6346):
 *  - Take the first 10 characters.
 *  - Leftmost char has weight 2^0 = 1, next 2^1 = 2, ... 2^9 = 512.
 *  - Letters map to values (A=10, B=12, C=13 ... Z=38; note 11, 22, 33 are
 *    skipped so the modulo-11 step never collides with a digit value).
 *  - Sum = Σ value(char_i) * 2^i.
 *  - check digit = Sum mod 11; if the remainder is 10, the check digit is 0.
 *
 * Mirrors scripts/seed.py (used to generate the seeded containers) so the
 * validator and the generator stay consistent.
 */

const LETTER_VALUES: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
  K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
  U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
};

export interface ContainerCheck {
  container: string;
  valid: boolean;
  reason?: string;
}

export function containerCheckDigit(prefix10: string): number {
  if (prefix10.length !== 10) {
    throw new Error('ISO 6346 prefix must be exactly 10 characters');
  }
  let total = 0;
  for (let i = 0; i < 10; i++) {
    const ch = prefix10[i].toUpperCase();
    const v = /^\d$/.test(ch) ? parseInt(ch, 10) : LETTER_VALUES[ch];
    if (Number.isNaN(v)) {
      throw new Error(`Invalid ISO 6346 character: ${ch}`);
    }
    total += v * 2 ** i;
  }
  const r = total % 11;
  return r === 10 ? 0 : r;
}

export function iso6346Valid(container: string): boolean {
  const c = normalizeContainer(container);
  if (!/^[A-Z]{4}\d{7}$/.test(c)) return false;
  const prefix10 = c.slice(0, 10);
  const check = c.slice(10);
  return String(containerCheckDigit(prefix10)) === check;
}

export function normalizeContainer(container: string): string {
  return container.trim().toUpperCase().replace(/\s/g, '');
}

export function validateContainers(containers: string[]): ContainerCheck[] {
  return containers.map((c) => {
    const normalized = normalizeContainer(c);
    if (!/^[A-Z]{4}\d{7}$/.test(normalized)) {
      return { container: c, valid: false, reason: 'format' };
    }
    if (!iso6346Valid(normalized)) {
      return { container: c, valid: false, reason: 'check_digit' };
    }
    return { container: normalized, valid: true };
  });
}
