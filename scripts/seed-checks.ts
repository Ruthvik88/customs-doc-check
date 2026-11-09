import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runAllCrossChecks } from "../lib/crosschecks";
import { crossCheckInput } from "../lib/crosscheck-source";

config({ path: ".env.local" });
config({ path: ".env", override: false });
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or .env.local");
const db = createClient(url, key);
const clean = new Set(["SHP-24812", "SHP-24813", "SHP-24818", "SHP-24821"]);
const cases = new Map([
  ["SHP-24811", "gross_weight"], ["SHP-24814", "invoice_total"],
]);
async function main() {
  const shipments = await db.from("shipments").select("id,shipment_number").like("shipment_number", "SHP-248%");
  if (shipments.error) throw shipments.error;
  const manager = await db.from("profiles").select("id").eq("role", "documentation_manager").single();
  if (manager.error) throw manager.error;
  const table: string[][] = [["Shipment", "Check", "Status", "Reason"]];
  const outcomes = new Map<string, ReturnType<typeof runAllCrossChecks>>();

  for (const shipment of shipments.data ?? []) {
    const [docs, fields, lines] = await Promise.all([
      db.from("documents").select("id,type").eq("shipment_id", shipment.id),
      db.from("fields").select("id,document_id,key,value").eq("shipment_id", shipment.id),
      db.from("line_items").select("document_id,description,hsn,qty,unit_price,line_total").eq("shipment_id", shipment.id),
    ]);
    if (docs.error) throw docs.error;
    if (fields.error) throw fields.error;
    if (lines.error) throw lines.error;

    const approvedDemo = ["SHP-24812", "SHP-24818"].includes(shipment.shipment_number);
    const missingRows = [];
    for (const document of docs.data ?? []) {
      const cachePath = resolve("data", "seeds", "cache", shipment.shipment_number, `${document.type}.json`);
      const cached = JSON.parse(readFileSync(cachePath, "utf8"));
      for (const cachedField of cached.fields.filter((field: any) => ["currency", "incoterm"].includes(field.key))) {
        if (!(fields.data ?? []).some((field) => field.document_id === document.id && field.key === cachedField.key)) {
          missingRows.push({
            shipment_id: shipment.id, document_id: document.id, key: cachedField.key,
            value: cachedField.value, ai_value: cachedField.ai_value, confidence: cachedField.confidence,
            status: approvedDemo ? "confirmed" : cachedField.status, source_page: cachedField.source_page,
          });
        }
      }
    }
    if (missingRows.length) {
      const inserted = await db.from("fields").insert(missingRows);
      if (inserted.error) throw inserted.error;
    }
    if (approvedDemo) {
      const confirmed = await db.from("fields").update({ status: "confirmed" }).eq("shipment_id", shipment.id);
      if (confirmed.error) throw confirmed.error;
    }

    const refreshedFields = await db.from("fields").select("document_id,key,value").eq("shipment_id", shipment.id);
    if (refreshedFields.error) throw refreshedFields.error;
    const results = runAllCrossChecks(crossCheckInput(refreshedFields.data ?? [], lines.data ?? [], docs.data ?? []));
    const remove = await db.from("crosscheck_results").delete().eq("shipment_id", shipment.id);
    if (remove.error) throw remove.error;
    const insert = await db.from("crosscheck_results").insert(results.map((result) => ({ shipment_id: shipment.id, ...result })));
    if (insert.error) throw insert.error;
    outcomes.set(shipment.shipment_number, results);
    for (const result of results) {
      table.push([shipment.shipment_number, result.check_type, result.status,
        String(result.details.reason ?? result.delta ?? "")]);
    }
    if (approvedDemo) {
      const approval = await db.from("shipments").update({
        status: "Approved", approved_by: manager.data.id, approved_at: new Date().toISOString(),
      }).eq("id", shipment.id);
      if (approval.error) throw approval.error;
    }
  }

  console.log(table.map((row) => row.map((cell) => cell.padEnd(32)).join(" ")).join("\n"));
  let failures: string[] = [];
  for (const [number, results] of outcomes) {
    if (results.length !== 8) failures.push(`${number}: expected 8 checks, got ${results.length}`);
    if (clean.has(number) && results.some((result) => result.status !== "pass")) failures.push(`${number}: expected 8 passes`);
    const expected = cases.get(number);
    if (expected && (results.filter((result) => result.status === "fail").length !== 1
      || !results.some((result) => result.check_type === expected && result.status === "fail"))) {
      failures.push(`${number}: expected only ${expected} to fail`);
    }
    if (number === "SHP-24811") {
      const weight = results.find((result) => result.check_type === "gross_weight");
      if (!weight || ![weight.value_a, weight.value_b].includes("3120") || ![weight.value_a, weight.value_b].includes("3165")) {
        failures.push("SHP-24811: gross weight must compare 3120 kg and 3165 kg");
      }
    }
    if (number === "SHP-24817") {
      const incomplete = results.filter((result) => result.status === "cannot_check");
      if (results.some((result) => result.status === "fail") || incomplete.length !== 1 || incomplete[0].check_type !== "container_numbers") {
        failures.push("SHP-24817: only the container check may be cannot_check");
      }
    }
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
