import { describe, expect, it } from "vitest";
import { mergeCrosscheckResolution } from "@/lib/crosscheck-results";
import type { CheckResult } from "@/lib/crosschecks";

const result: CheckResult = {
  check_type: "gross_weight",
  status: "fail",
  value_a: "3120 kg",
  value_b: "3165 kg",
  delta: "1.44%",
  fields_involved: ["gross_weight_kg"],
  details: { weight_tolerance: 0.005 },
};

const resolved = {
  ...result,
  resolved_by: "manager-id",
  resolved_at: "2026-01-01T00:00:00.000Z",
  resolution_note: "Verified against the original invoice.",
};

describe("mergeCrosscheckResolution", () => {
  it("keeps a resolution when the recomputed result is unchanged", () => {
    expect(mergeCrosscheckResolution(result, resolved)).toMatchObject({
      resolved_by: "manager-id",
      resolved_at: resolved.resolved_at,
      resolution_note: resolved.resolution_note,
      details: result.details,
    });
  });

  it("invalidates a stale resolution but archives its note and actor when the result changes", () => {
    const changed = { ...result, value_b: "3300 kg", delta: "5.45%" };
    const merged = mergeCrosscheckResolution(changed, resolved);

    expect(merged).toMatchObject({
      resolved_by: null,
      resolved_at: null,
      resolution_note: null,
      details: {
        resolution_history: [{
          resolved_by: "manager-id",
          resolved_at: resolved.resolved_at,
          resolution_note: resolved.resolution_note,
        }],
      },
    });
  });

  it("does not duplicate archived resolution history on a repeated unchanged recomputation", () => {
    const changed = { ...result, value_b: "3300 kg", delta: "5.45%" };
    const first = mergeCrosscheckResolution(changed, resolved);
    const second = mergeCrosscheckResolution(changed, first);

    expect(second.details.resolution_history).toHaveLength(1);
    expect(second.resolved_by).toBeNull();
  });

  it("keeps a resolution when JSON objects contain the same keys in a different order", () => {
    const original = { ...resolved, details: { nested: { left: 1, right: 2 } } };
    const reordered = { ...result, details: { nested: { right: 2, left: 1 } } };
    expect(mergeCrosscheckResolution(reordered, original)).toMatchObject({
      resolved_by: resolved.resolved_by,
      resolution_note: resolved.resolution_note,
    });
  });

  it("archives a resolution when a nested JSON value changes", () => {
    const original = { ...resolved, details: { nested: { value: 1 } } };
    const changed = { ...result, details: { nested: { value: 2 } } };
    expect(mergeCrosscheckResolution(changed, original)).toMatchObject({
      resolved_by: null,
      details: { resolution_history: [{ resolution_note: resolved.resolution_note }] },
    });
  });
});
