/**
 * Confidence combiner.
 *
 * Gemini's self-reported confidence is poorly calibrated, so the final
 * confidence for a field is a weighted combination of three signals:
 *
 *   final = 0.50 * model_confidence
 *         + 0.30 * (validators_passed / validators_total)
 *         + 0.20 * (present_in_text ? 1 : 0.5)
 *
 * All terms are clamped to [0, 1], and the result is clamped to [0, 1].
 *
 * Deterministic validators (documented):
 *   - date parses (ISO 8601 / DD-MM-YYYY / MM-DD-YYYY)
 *   - currency is an ISO 4217 code (3 uppercase letters)
 *   - Incoterm is in the known list (EXW, FCA, FOB, CFR, CIF, DPU, DAP, DDP,
 *     FAS, FOB... the eight Incoterms 2020 rules)
 *   - HSN is 6-8 digits
 *   - container number matches ISO 6346 (incl. check digit)
 *   - numbers parse (qty, unit price, weights)
 *
 * present_in_text: whether the final value string can be found in the
 * extracted document text (helps detect hallucinations).
 *
 * Default review threshold: 0.80 (configurable via CONFIDENCE_THRESHOLD).
 * Fields below threshold, or involved in a failed cross-check, become
 * needs_review and must be confirmed or edited by a person before export.
 */

export interface ConfidenceInputs {
  modelConfidence: number; // 0-1, self-reported by Gemini
  validatorsPassed: number; // deterministic validators that passed
  validatorsTotal: number; // total deterministic validators checked
  presentInText: boolean; // value appears in extracted text
}

export interface ConfidenceOutput {
  confidence: number; // 0-1
  modelPart: number;
  validatorPart: number;
  textPart: number;
}

const MODEL_WEIGHT = 0.5;
const VALIDATOR_WEIGHT = 0.3;
const TEXT_WEIGHT = 0.2;

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

function clamp(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export function combineConfidence(inputs: ConfidenceInputs): ConfidenceOutput {
  const modelConfidence = clamp(inputs.modelConfidence);
  const validatorRatio =
    inputs.validatorsTotal > 0
      ? clamp(inputs.validatorsPassed / inputs.validatorsTotal)
      : 0;
  const textScore = inputs.presentInText ? 1 : 0.5;

  const modelPart = MODEL_WEIGHT * modelConfidence;
  const validatorPart = VALIDATOR_WEIGHT * validatorRatio;
  const textPart = TEXT_WEIGHT * textScore;

  const confidence = clamp(modelPart + validatorPart + textPart);

  return { confidence, modelPart, validatorPart, textPart };
}

export function needsReview(confidence: number, threshold = DEFAULT_CONFIDENCE_THRESHOLD): boolean {
  return confidence < threshold;
}
