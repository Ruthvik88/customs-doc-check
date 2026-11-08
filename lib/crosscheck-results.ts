import type { CheckResult } from "@/lib/crosschecks";

type ExistingCrosscheck = Pick<
  CheckResult,
  "status" | "value_a" | "value_b" | "delta" | "fields_involved" | "details"
> & {
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
};

function semanticEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length &&
      a.every((value, index) => semanticEqual(value, b[index]));
  }
  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const aKeys = Object.keys(aRecord);
  const bKeys = Object.keys(bRecord);
  return aKeys.length === bKeys.length && aKeys.every((key) =>
    Object.prototype.hasOwnProperty.call(bRecord, key) && semanticEqual(aRecord[key], bRecord[key])
  );
}

export function mergeCrosscheckResolution(
  result: CheckResult,
  existing?: ExistingCrosscheck,
) {
  if (!existing) {
    return { ...result, resolved_by: null, resolved_at: null, resolution_note: null };
  }

  const previousDetails = { ...existing.details };
  const previousHistory = Array.isArray(previousDetails.resolution_history)
    ? previousDetails.resolution_history
    : [];
  delete previousDetails.resolution_history;

  const unchanged =
    result.status === existing.status &&
    result.value_a === existing.value_a &&
    result.value_b === existing.value_b &&
    result.delta === existing.delta &&
    semanticEqual(result.fields_involved, existing.fields_involved) &&
    semanticEqual(result.details, previousDetails);

  if (unchanged) {
    return {
      ...result,
      details: previousHistory.length
        ? { ...result.details, resolution_history: previousHistory }
        : result.details,
      resolved_by: existing.resolved_by,
      resolved_at: existing.resolved_at,
      resolution_note: existing.resolution_note,
    };
  }

  const hasResolution = existing.resolved_by || existing.resolved_at || existing.resolution_note;
  const history = hasResolution
    ? [
        ...previousHistory,
        {
          status: existing.status,
          value_a: existing.value_a,
          value_b: existing.value_b,
          delta: existing.delta,
          fields_involved: existing.fields_involved,
          resolved_by: existing.resolved_by,
          resolved_at: existing.resolved_at,
          resolution_note: existing.resolution_note,
        },
      ]
    : previousHistory;

  return {
    ...result,
    details: history.length ? { ...result.details, resolution_history: history } : result.details,
    resolved_by: null,
    resolved_at: null,
    resolution_note: null,
  };
}
