# Export layout — filing software import layout (ASSUMPTION)

This document defines the CSV layout used by the export feature. **It is an
assumption**, made because no real customs-filing software integration was
specified. The layout is deliberately simple and can be re-mapped in
`lib/export.ts` / `app/api/export/route.ts` when a real target layout is known.

## Scope

Out of scope: direct integration with any customs portal, HSN classification,
duty calculation, or customer-facing portal.

## Format

- Encoding: UTF-8
- Delimiter: comma (`,`)
- Line endings: CRLF (`\r\n`)
- Header row: present (first row)
- One row per shipment
- A field value is wrapped in double quotes if it contains a comma, double
  quote, line break, or leading/trailing whitespace. Embedded double quotes
  are escaped by doubling them.

## Columns

All values are the **reconciled (confirmed)** values — `shipments.*` scalar
columns plus the reconciled `fields` rows for `consignee` and `invoice_total`.
Export is gated: the shipment must be `Approved`, with zero
`needs_review` fields and zero unresolved `fail` cross-checks.

| Column | Source | Notes |
|---|---|---|
| shipment_number | `shipments.shipment_number` | e.g. `SHP-24811` |
| supplier | `suppliers.name` | Via `shipments.supplier_id` |
| consignee | `fields` where `key='consignee'` and `status IN ('confirmed','edited')` | Reconciled consignee |
| invoice_number | `shipments.invoice_number` | |
| invoice_date | `shipments.invoice_date` | ISO 8601 (`YYYY-MM-DD`) |
| currency | `shipments.currency` | ISO 4217 (e.g. `USD`) |
| incoterm | `shipments.incoterm` | Incoterms 2020 (e.g. `FOB`) |
| invoice_total | `fields` where `key='invoice_total'` | Reconciled total |
| packages | `shipments.total_packages` | |
| gross_weight_kg | `shipments.gross_weight_kg` | |
| net_weight_kg | `shipments.net_weight_kg` | |
| containers | `shipments.containers` | Joined with `, ` |
| bl_number | `shipments.bl_number` | |
| vessel | `shipments.vessel` | |
| port_of_loading | `shipments.port_of_loading` | |
| port_of_discharge | `shipments.port_of_discharge` | |

## Example

```csv
shipment_number,supplier,consignee,invoice_number,invoice_date,currency,incoterm,invoice_total,packages,gross_weight_kg,net_weight_kg,containers,bl_number,vessel,port_of_loading,port_of_discharge
SHP-24812,"Company C","Nhava Sheva Imports Pvt. Ltd.","INV-SE-3310","2025-10-22","EUR","CIF","7650.00",6,1460,1420,"CMAU5555552","BL-SE-7741","MV Baltic Trader","Gothenburg, Sweden","Nhava Sheva, India"
```

## Gating (server-side)

Before a CSV row is emitted, the export route re-validates:
1. `shipments.status = 'Approved'`
2. `count(*)` of `fields` with `status = 'needs_review'` = 0
3. `count(*)` of `crosscheck_results` with `status = 'fail' AND resolved_by IS NULL` = 0

Only the `documentation_manager` role may export. The export is recorded in
the `exports` table (`shipment_id`, `exported_by`, `file_path`, `created_at`).
