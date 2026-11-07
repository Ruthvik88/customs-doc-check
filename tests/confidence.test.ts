import { describe, it, expect } from "vitest";
import { combineConfidence, needsReview, DEFAULT_CONFIDENCE_THRESHOLD } from "~/lib/confidence";

describe("combineConfidence", () => {
  it("clamps model confidence to [0,1]", () => {
    expect(combineConfidence({ modelConfidence: 1.5, validatorsPassed: 1, validatorsTotal: 1, presentInText: true }).confidence).toBeCloseTo(1, 4);
    expect(combineConfidence({ modelConfidence: -0.5, validatorsPassed: 0, validatorsTotal: 1, presentInText: false }).confidence).toBeGreaterThanOrEqual(0);
  });

  it("produces high confidence when all signals agree", () => {
    const out = combineConfidence({ modelConfidence: 0.98, validatorsPassed: 6, validatorsTotal: 6, presentInText: true });
    expect(out.confidence).toBeGreaterThan(0.9);
    expect(out.modelPart).toBe(0.49);
    expect(out.validatorPart).toBe(0.3);
    expect(out.textPart).toBe(0.2);
  });

  it("produces low confidence when model is unsure and validators fail", () => {
    const out = combineConfidence({ modelConfidence: 0.4, validatorsPassed: 0, validatorsTotal: 6, presentInText: false });
    expect(out.confidence).toBeLessThan(0.5);
  });

  it("text absence caps the text term at 0.5", () => {
    const withText = combineConfidence({ modelConfidence: 0.9, validatorsPassed: 6, validatorsTotal: 6, presentInText: true });
    const withoutText = combineConfidence({ modelConfidence: 0.9, validatorsPassed: 6, validatorsTotal: 6, presentInText: false });
    expect(withText.confidence).toBeGreaterThan(withoutText.confidence);
  });

  it("handles zero validators gracefully", () => {
    const out = combineConfidence({ modelConfidence: 0.8, validatorsPassed: 0, validatorsTotal: 0, presentInText: true });
    expect(out.confidence).toBe(0.4 + 0.2); // model 0.5*0.8 + text 0.2
  });
});

describe("needsReview", () => {
  it("uses the default threshold 0.80", () => {
    expect(DEFAULT_CONFIDENCE_THRESHOLD).toBe(0.8);
    expect(needsReview(0.79)).toBe(true);
    expect(needsReview(0.80)).toBe(false);
    expect(needsReview(0.81)).toBe(false);
  });

  it("supports a configurable threshold", () => {
    expect(needsReview(0.75, 0.70)).toBe(false);
    expect(needsReview(0.75, 0.80)).toBe(true);
  });
});
