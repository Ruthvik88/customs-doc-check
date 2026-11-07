import { describe, it, expect } from "vitest";
import { iso6346Valid, containerCheckDigit, validateContainers } from "~/lib/iso6346";

const mk = (prefix10: string) => prefix10 + String(containerCheckDigit(prefix10));

describe("containerCheckDigit", () => {
  it("computes the check digit for a known container", () => {
    // MSKU123456 -> check digit 5 (verified against ISO 6346 algorithm)
    expect(containerCheckDigit("MSKU123456")).toBe(5);
  });

  it("throws on a prefix that is not 10 characters", () => {
    expect(() => containerCheckDigit("MSKU12345")).toThrow();
  });
});

describe("iso6346Valid", () => {
  it("accepts valid containers", () => {
    expect(iso6346Valid(mk("MSKU123456"))).toBe(true);
    expect(iso6346Valid(mk("TCNU987654"))).toBe(true);
    expect(iso6346Valid(mk("CMAU555555"))).toBe(true);
    // case-insensitive / spaces are normalised away
    expect(iso6346Valid("msku1234565")).toBe(true);
    expect(iso6346Valid("MSKU 1234565")).toBe(true);
  });

  it("rejects an invalid check digit", () => {
    expect(iso6346Valid("MSKU1234560")).toBe(false); // should end in 5
    expect(iso6346Valid("MSKU1234569")).toBe(false);
  });

  it("rejects bad formats", () => {
    expect(iso6346Valid("MSKU123456")).toBe(false); // too short
    expect(iso6346Valid("MSKU12345600")).toBe(false); // too long
    expect(iso6346Valid("")).toBe(false);
    expect(iso6346Valid("ABC1234567")).toBe(false); // 3-letter owner code
  });
});

describe("validateContainers", () => {
  it("reports valid and invalid containers", () => {
    const out = validateContainers([mk("MSKU123456"), "TCNU9999999", "bad"]);
    expect(out[0].valid).toBe(true);
    expect(out[1].valid).toBe(false);
    expect(out[1].reason).toBe("check_digit");
    expect(out[2].valid).toBe(false);
    expect(out[2].reason).toBe("format");
  });
});
