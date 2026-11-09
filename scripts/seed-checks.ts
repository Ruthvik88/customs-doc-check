import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
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
  ["SHP-24817", "bill_of_lading"],
]);
async function main() {
const shipments = await db.from("shipments").select("id,shipment_number,approved_by,status").like("shipment_number", "SHP-248%");
if (shipments.error) throw shipments.error;
const manager = await db.from("profiles").select("id").eq("role", "documentation_manager").single();
if (manager.error) throw manager.error;
const output: string[][] = [["Shipment", "Check", "Status"]];
let failedClean = false;
for (const shipment of shipments.data ?? []) {
  if (["SHP-24812", "SHP-24818"].includes(shipment.shipment_number)) {
    const confirmed = await db.from("fields").update({ status: "confirmed" }).eq("shipment_id", shipment.id);
    if (confirmed.error) throw confirmed.error;
  }
  const [docs, fields, lines] = await Promise.all([
    db.from("documents").select("id,type").eq("shipment_id", shipment.id),
    db.from("fields").select("document_id,key,value").eq("shipment_id", shipment.id),
    db.from("line_items").select("document_id,description,hsn,qty,unit_price,line_total").eq("shipment_id", shipment.id),
  ]);
  if (docs.error) throw docs.error;
  if (fields.error) throw fields.error;
  if (lines.error) throw lines.error;
  const results = runAllCrossChecks(crossCheckInput(fields.data ?? [], lines.data ?? [], docs.data ?? []));
  const expected = cases.get(shipment.shipment_number);
  if (clean.has(shipment.shipment_number) && results.some((result) => result.status !== "pass")) failedClean = true;
  if (expected === "bill_of_lading") {
    if (results.some((result) => result.status === "fail") || results.filter((result) => result.status === "cannot_check").some((result) => result.check_type !== "container_numbers")) {
      throw new Error(`${shipment.shipment_number} has unexpected incomplete checks`);
    }
  } else if (expected && (!results.some((result) => result.check_type === expected && result.status === "fail")
    || results.filter((result) => result.status === "fail").some((result) => result.check_type !== expected))) {
    throw new Error(`${shipment.shipment_number} did not fail only ${expected}`);
  }
  const remove = await db.from("crosscheck_results").delete().eq("shipment_id", shipment.id);
  if (remove.error) throw remove.error;
  const insert = await db.from("crosscheck_results").insert(results.map((result) => ({ shipment_id: shipment.id, ...result })));
  if (insert.error) throw insert.error;
  if (["SHP-24812", "SHP-24818"].includes(shipment.shipment_number)) {
    const approval = await db.from("shipments").update({ status: "Approved", approved_by: manager.data.id, approved_at: new Date().toISOString() }).eq("id", shipment.id);
    if (approval.error) throw approval.error;
  }
  for (const result of results) output.push([shipment.shipment_number, result.check_type, result.status]);
}
console.log(output.map((row) => row.map((cell) => cell.padEnd(24)).join(" ")).join("\n"));
if (failedClean) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
