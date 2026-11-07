#!/usr/bin/env python3
"""
Generate synthetic seed documents (PDFs / scanned images) and cached extraction JSON.

Usage:
  python scripts/seed.py            # generate PDFs + JSON only (offline, committed)
  python scripts/seed.py --load     # also load into Supabase (needs SUPABASE_URL +
                                    SUPABASE_SERVICE_ROLE_KEY; service-role only)

The generated files under data/seeds/ are committed to the repo.
Python (reportlab, Pillow) is only needed to regenerate them.
All companies, people and data are fictional; no real personal data is seeded.
"""
import argparse
import json
import os
import re
import secrets
import sys
from pathlib import Path

from dotenv import load_dotenv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------------------------------------------------------------------------
# Environment loading for --load
# Reads .env.local then .env from the project root (later file wins).
# Does not override variables already set in the actual environment.
# ---------------------------------------------------------------------------
ENV_FILES = [".env.local", ".env"]


def load_env_files():
    """Load .env.local then .env from the project root. Return list of files read."""
    root = Path(__file__).resolve().parent.parent
    read_files = []
    for name in ENV_FILES:
        path = root / name
        if not path.is_file():
            continue
        load_dotenv(path, override=False)
        read_files.append(str(path))
    return read_files


def resolve_supabase_url():
    """SUPABASE_URL takes precedence; fall back to NEXT_PUBLIC_SUPABASE_URL.

    Supabase client SDKs expect the project base URL, so strip a trailing
    /rest/v1 path if someone pasted the REST endpoint.
    """
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    if not url:
        return None
    url = url.strip()
    for suffix in ("/rest/v1/", "/rest/v1"):
        if url.endswith(suffix):
            url = url[: -len(suffix)]
            break
    return url


def require_load_env(read_files):
    """Exit with a non-zero code if --load cannot run due to missing config.

    Names exactly which variable is missing and which files were checked.
    Never prints passwords or keys.
    """
    missing = []
    if not resolve_supabase_url():
        missing.append("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)")
    if not os.environ.get("SUPABASE_SERVICE_ROLE_KEY"):
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        files = ", ".join(read_files) if read_files else "(none found)"
        print("ERROR: --load cannot run; required variable(s) missing:", ", ".join(missing))
        print(f"Checked env files: {files}")
        print("Create .env (or .env.local) at the project root with these values.")
        print("See deployment.md for the Windows PowerShell setup steps.")
        sys.exit(1)


ROOT = Path(__file__).resolve().parent.parent
SEED_DIR = ROOT / "data" / "seeds"
CACHE_DIR = SEED_DIR / "cache"

W, H = A4  # 595.28 x 841.89

# ---------------------------------------------------------------------------
# ISO 6346 container check digit (same algorithm as lib/iso6346.ts)
# ---------------------------------------------------------------------------
LETTER_VALUES = {
    "A": 10, "B": 12, "C": 13, "D": 14, "E": 15, "F": 16, "G": 17, "H": 18,
    "I": 19, "J": 20, "K": 21, "L": 23, "M": 24, "N": 25, "O": 26, "P": 27,
    "Q": 28, "R": 29, "S": 30, "T": 31, "U": 32, "V": 34, "W": 35, "X": 36,
    "Y": 37, "Z": 38,
}


def container_check_digit(prefix10):
    total = 0
    for i, ch in enumerate(prefix10):
        v = int(ch) if ch.isdigit() else LETTER_VALUES[ch]
        total += v * (2 ** i)
    r = total % 11
    return 0 if r == 10 else r


def make_container(letters, digits):
    base = letters + digits  # exactly 10 chars
    return base + str(container_check_digit(base))


CONTAINERS = {
    "A": [make_container("MSKU", "123456"), make_container("TCNU", "987654")],
    "B": [make_container("MSKU", "111111")],
    "C": [make_container("CMAU", "555555")],
    "D": [make_container("MSKU", "222222"), make_container("TCNU", "333333")],
    "E": [make_container("CMAU", "444444")],
    "F": [make_container("MSKU", "555555")],
    "G": [make_container("TCNU", "666666")],
    "H": [make_container("CMAU", "777777"), make_container("MSKU", "888888")],
    "I": [make_container("TCNU", "999999")],
    "J": [make_container("MSKU", "000000")],
    "K": [make_container("CMAU", "121212")],
    "L": [make_container("TCNU", "343434")],
}

# ---------------------------------------------------------------------------
# Drawing helpers
# ---------------------------------------------------------------------------
def _text(c, s, x, y, size=9, bold=False):
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, s)


def _line(c, x1, y1, x2, y2):
    c.setStrokeGray(0.4)
    c.setLineWidth(0.5)
    c.line(x1, y1, x2, y2)


def _draw_header(c, title, sub):
    _text(c, title, 50, H - 50, size=13, bold=True)
    _text(c, sub, 50, H - 66, size=8)
    _line(c, 50, H - 74, W - 50, H - 74)


def _draw_party_block(c, label, party, x, y):
    _text(c, label, x, y, size=8, bold=True)
    _text(c, party["name"], x, y - 13, size=9)
    _text(c, party.get("address", ""), x, y - 24, size=8)
    _text(c, party.get("city_country", ""), x, y - 34, size=8)


def render_invoice(path, data):
    c = canvas.Canvas(str(path), pagesize=A4)
    _draw_header(c, "COMMERCIAL INVOICE", data["doc_sub"])
    _draw_party_block(c, "EXPORTER / SUPPLIER", data["supplier"], 50, H - 100)
    _draw_party_block(c, "IMPORTER / CONSIGNEE", data["consignee"], 300, H - 100)
    y = H - 160
    _text(c, f"Invoice No: {data['invoice_number']}", 50, y, size=9, bold=True)
    _text(c, f"Invoice Date: {data['invoice_date']}", 300, y, size=9)
    _text(c, f"Currency: {data['currency']}   Incoterm: {data['incoterm']}", 50, y - 16, size=9)
    y -= 44
    _text(c, "Description", 50, y, size=8, bold=True)
    _text(c, "HSN", 260, y, size=8, bold=True)
    _text(c, "Qty", 320, y, size=8, bold=True)
    _text(c, "Unit Price", 370, y, size=8, bold=True)
    _text(c, "Line Total", 460, y, size=8, bold=True)
    _line(c, 50, y - 4, W - 50, y - 4)
    y -= 16
    grand = 0.0
    for it in data["line_items"]:
        _text(c, it["description"], 50, y, size=8)
        _text(c, it["hsn"], 260, y, size=8)
        _text(c, str(it["qty"]), 320, y, size=8)
        _text(c, f"{it['unit_price']:.2f}", 370, y, size=8)
        _text(c, f"{it['line_total']:.2f}", 460, y, size=8)
        grand += it["line_total"]
        y -= 16
    _line(c, 50, y - 2, W - 50, y - 2)
    y -= 16
    _text(c, f"Total: {data['currency']} {grand:.2f}", 460, y, size=9, bold=True)
    y -= 30
    _text(c, f"Packages: {data['packages']}", 50, y, size=9)
    _text(c, f"Gross Weight: {data['invoice_gross']} kg", 50, y - 14, size=9)
    _text(c, f"Net Weight: {data['net_weight']} kg", 50, y - 28, size=9)
    c.showPage()
    c.save()


def render_packing_list(path, data):
    c = canvas.Canvas(str(path), pagesize=A4)
    _draw_header(c, "PACKING LIST", data["doc_sub"])
    _draw_party_block(c, "EXPORTER / SUPPLIER", data["supplier"], 50, H - 100)
    _draw_party_block(c, "IMPORTER / CONSIGNEE", data["consignee"], 300, H - 100)
    y = H - 160
    _text(c, f"Reference Invoice: {data['invoice_number']}", 50, y, size=9, bold=True)
    _text(c, f"Date: {data['invoice_date']}", 300, y, size=9)
    y -= 44
    _text(c, "Description", 50, y, size=8, bold=True)
    _text(c, "HSN", 260, y, size=8, bold=True)
    _text(c, "Qty", 320, y, size=8, bold=True)
    _text(c, "Packages", 370, y, size=8, bold=True)
    _line(c, 50, y - 4, W - 50, y - 4)
    y -= 16
    for it in data["line_items"]:
        _text(c, it["description"], 50, y, size=8)
        _text(c, it["hsn"], 260, y, size=8)
        _text(c, str(it["qty"]), 320, y, size=8)
        _text(c, str(it.get("packages", it["qty"] // 100 or 1)), 370, y, size=8)
        y -= 16
    y -= 6
    _line(c, 50, y - 2, W - 50, y - 2)
    y -= 16
    _text(c, f"Total Packages: {data['packages']}", 50, y, size=9)
    _text(c, f"Gross Weight: {data['pl_gross']} kg", 50, y - 14, size=9)
    _text(c, f"Net Weight: {data['net_weight']} kg", 50, y - 28, size=9)
    _text(c, "Containers: " + ", ".join(data["containers"]), 50, y - 44, size=9)
    c.showPage()
    c.save()


def render_bl(path, data):
    c = canvas.Canvas(str(path), pagesize=A4)
    _draw_header(c, "BILL OF LADING", data["doc_sub"])
    _draw_party_block(c, "SHIPPER / SUPPLIER", data["supplier"], 50, H - 100)
    _draw_party_block(c, "CONSIGNEE", data["consignee"], 300, H - 100)
    y = H - 160
    _text(c, f"BL Number: {data['bl_number']}", 50, y, size=9, bold=True)
    _text(c, f"Vessel: {data['vessel']}", 300, y, size=9)
    _text(c, f"Port of Loading: {data['port_of_loading']}", 50, y - 16, size=9)
    _text(c, f"Port of Discharge: {data['port_of_discharge']}", 300, y - 16, size=9)
    y -= 50
    _text(c, "Description", 50, y, size=8, bold=True)
    _text(c, "Qty", 300, y, size=8, bold=True)
    _text(c, "Packages", 360, y, size=8, bold=True)
    _text(c, "Gross Weight (kg)", 440, y, size=8, bold=True)
    _line(c, 50, y - 4, W - 50, y - 4)
    y -= 16
    for it in data["line_items"]:
        _text(c, it["description"], 50, y, size=8)
        _text(c, str(it["qty"]), 300, y, size=8)
        _text(c, str(it.get("packages", it["qty"] // 100 or 1)), 360, y, size=8)
        _text(c, str(it.get("gross_kg", data["invoice_gross"] // len(data["line_items"]))), 440, y, size=8)
        y -= 16
    y -= 10
    _line(c, 50, y - 2, W - 50, y - 2)
    y -= 16
    _text(c, f"Total Packages: {data['packages']}", 50, y, size=9)
    _text(c, f"Gross Weight: {data['invoice_gross']} kg", 50, y - 14, size=9)
    _text(c, "Containers: " + ", ".join(data["containers"]), 50, y - 28, size=9)
    c.showPage()
    c.save()


def render_scan_png(path, data):
    """Skewed scan: draw invoice to an image, then rotate + blur (Pillow)."""
    img = Image.new("RGB", (900, 1150), "white")
    d = ImageDraw.Draw(img)
    try:
        f_b = ImageFont.truetype("arial.ttf", 22)
        f_n = ImageFont.truetype("arial.ttf", 18)
        f_s = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        f_b = f_n = f_s = ImageFont.load_default()

    d.text((60, 40), "COMMERCIAL INVOICE (SCANNED)", font=f_b, fill="black")
    d.text((60, 78), data["doc_sub"], font=f_s, fill="gray")
    d.text((60, 120), f"EXPORTER / SUPPLIER: {data['supplier']['name']}", font=f_n, fill="black")
    d.text((60, 148), f"IMPORTER / CONSIGNEE: {data['consignee']['name']}", font=f_n, fill="black")
    d.text((60, 186), f"Invoice No: {data['invoice_number']}", font=f_n, fill="black")
    d.text((60, 214), f"Invoice Date: {data['invoice_date']}", font=f_n, fill="black")
    d.text((60, 242), f"Currency: {data['currency']}   Incoterm: {data['incoterm']}", font=f_n, fill="black")
    y = 280
    d.text((60, y), "Description                 HSN     Qty  Unit Price  Line Total", font=f_s, fill="black")
    y += 24
    grand = 0.0
    for it in data["line_items"]:
        d.text((60, y), f"{it['description']}   {it['hsn']}   {it['qty']}   {it['unit_price']:.2f}   {it['line_total']:.2f}", font=f_n, fill="black")
        grand += it["line_total"]
        y += 26
    d.text((60, y + 10), f"Total: {data['currency']} {grand:.2f}", font=f_b, fill="black")
    d.text((60, y + 40), f"Packages: {data['packages']}", font=f_n, fill="black")
    d.text((60, y + 68), f"Gross Weight: {data['invoice_gross']} kg", font=f_n, fill="black")
    d.text((60, y + 96), f"Net Weight: {data['net_weight']} kg", font=f_n, fill="black")

    img = img.rotate(6, expand=True, resample=Image.BICUBIC)  # skewed
    img = img.filter(ImageFilter.GaussianBlur(radius=1.6))    # blurred
    img.save(path, "PNG")


# ---------------------------------------------------------------------------
# Seed data (all fictional)
# ---------------------------------------------------------------------------
CONSIGNEE = {
    "name": "Nhava Sheva Imports Pvt. Ltd.",
    "address": "Plot 12, JNPT Road, Nhava Sheva",
    "city_country": "Navi Mumbai, Maharashtra 400707, India",
}


def supplier(name, country, address="", city=""):
    return {"name": name, "address": address, "city_country": f"{city}, {country}"}


SHIPMENTS = [
    {
        "key": "A", "shipment_number": "SHP-24811", "status": "Needs review",
        "supplier": supplier("Company B", "China", "No. 88 Huamu Road", "Shanghai"),
        "currency": "USD", "incoterm": "FOB",
        "invoice_number": "INV-2025-1142", "invoice_date": "2025-10-20",
        "bl_number": "BL-2025-0981", "vessel": "MV Ocean Star",
        "port_of_loading": "Shanghai, China", "port_of_discharge": "Nhava Sheva, India",
        "packages": 40, "invoice_gross": 3120, "pl_gross": 3165, "net_weight": 3000,
        "special": "weight_mismatch",
        "line_items": [
            {"description": "LED panel light 40W", "hsn": "940540", "qty": 2400, "unit_price": 6.80, "line_total": 16320.00},
            {"description": "Mounting bracket", "hsn": "830249", "qty": 2400, "unit_price": 1.20, "line_total": 2880.00},
        ],
    },
    {
        "key": "B", "shipment_number": "SHP-24812", "status": "Approved",
        "supplier": supplier("Company C", "Sweden", "Industrivägen 14", "Gothenburg"),
        "currency": "EUR", "incoterm": "CIF",
        "invoice_number": "INV-SE-3310", "invoice_date": "2025-10-22",
        "bl_number": "BL-SE-7741", "vessel": "MV Baltic Trader",
        "port_of_loading": "Gothenburg, Sweden", "port_of_discharge": "Nhava Sheva, India",
        "packages": 6, "invoice_gross": 1460, "pl_gross": 1460, "net_weight": 1420,
        "special": "clean",
        "line_items": [
            {"description": "Steel ball valve DN50", "hsn": "848180", "qty": 180, "unit_price": 42.50, "line_total": 7650.00},
        ],
    },
    {
        "key": "C", "shipment_number": "SHP-24813", "status": "Ready for approval",
        "supplier": supplier("Company D", "United States", "4500 Logistics Blvd", "Houston"),
        "currency": "USD", "incoterm": "FOB",
        "invoice_number": "INV-US-5502", "invoice_date": "2025-10-24",
        "bl_number": "BL-US-1129", "vessel": "MV Pacific Link",
        "port_of_loading": "Houston, USA", "port_of_discharge": "Nhava Sheva, India",
        "packages": 22, "invoice_gross": 980, "pl_gross": 980, "net_weight": 940,
        "special": "clean",
        "line_items": [
            {"description": "Stainless steel fasteners", "hsn": "731815", "qty": 5000, "unit_price": 0.90, "line_total": 4500.00},
            {"description": "Zinc washers M10", "hsn": "731816", "qty": 5000, "unit_price": 0.15, "line_total": 750.00},
        ],
    },
    {
        "key": "D", "shipment_number": "SHP-24814", "status": "Needs review",
        "supplier": supplier("Company E", "Germany", "Hafenstraße 21", "Hamburg"),
        "currency": "EUR", "incoterm": "EXW",
        "invoice_number": "INV-DE-8841", "invoice_date": "2025-10-25",
        "bl_number": "BL-DE-2203", "vessel": "MV North Star",
        "port_of_loading": "Hamburg, Germany", "port_of_discharge": "Nhava Sheva, India",
        "packages": 18, "invoice_gross": 2100, "pl_gross": 2100, "net_weight": 2040,
        "special": "invoice_total_mismatch",
        "line_items": [
            {"description": "Industrial rubber hose 2in", "hsn": "400912", "qty": 320, "unit_price": 18.50, "line_total": 5920.00},
            {"description": "Hose clamps SS", "hsn": "732690", "qty": 320, "unit_price": 2.10, "line_total": 672.00},
        ],
    },
    {
        "key": "E", "shipment_number": "SHP-24815", "status": "Extracting",
        "supplier": supplier("Company F", "India", "Plot 5, MIDC", "Pune"),
        "currency": "USD", "incoterm": "FOB",
        "invoice_number": "INV-IN-9011", "invoice_date": "2025-10-26",
        "bl_number": "BL-IN-4430", "vessel": "MV Coastal Express",
        "port_of_loading": "Mundra, India", "port_of_discharge": "Nhava Sheva, India",
        "packages": 12, "invoice_gross": 640, "pl_gross": 640, "net_weight": 610,
        "special": "skewed_scan",
        "line_items": [
            {"description": "Cotton fabric rolls", "hsn": "520812", "qty": 150, "unit_price": 22.00, "line_total": 3300.00},
        ],
    },
    {
        "key": "F", "shipment_number": "SHP-24816", "status": "Needs review",
        "supplier": supplier("Company G (光耀贸易)", "China", "龙华区观澜路 56 号", "深圳"),
        "currency": "USD", "incoterm": "FOB",
        "invoice_number": "INV-CN-2055", "invoice_date": "2025-10-27",
        "bl_number": "BL-CN-3392", "vessel": "MV Pearl River",
        "port_of_loading": "Shenzhen, China", "port_of_discharge": "Nhava Sheva, India",
        "packages": 30, "invoice_gross": 720, "pl_gross": 720, "net_weight": 680,
        "special": "bilingual",
        "line_items": [
            {"description": "Ceramic mugs / 陶瓷杯", "hsn": "691110", "qty": 600, "unit_price": 3.40, "line_total": 2040.00},
        ],
    },
    {
        "key": "G", "shipment_number": "SHP-24817", "status": "Needs review",
        "supplier": supplier("Company H", "United Arab Emirates", "JAFZA PO Box 1234", "Dubai"),
        "currency": "USD", "incoterm": "FCA",
        "invoice_number": "INV-AE-4109", "invoice_date": "2025-10-28",
        "bl_number": None, "vessel": None, "port_of_loading": None, "port_of_discharge": None,
        "packages": 8, "invoice_gross": 1890, "pl_gross": 1890, "net_weight": 1840,
        "special": "missing_bl",
        "line_items": [
            {"description": "Automotive spare parts", "hsn": "870899", "qty": 450, "unit_price": 12.00, "line_total": 5400.00},
        ],
    },
    {
        "key": "H", "shipment_number": "SHP-24818", "status": "Approved",
        "supplier": supplier("Company I", "Japan", "1-5-1 Minatomirai", "Yokohama"),
        "currency": "JPY", "incoterm": "CIF",
        "invoice_number": "INV-JP-7782", "invoice_date": "2025-10-29",
        "bl_number": "BL-JP-0045", "vessel": "MV Sakura Express",
        "port_of_loading": "Yokohama, Japan", "port_of_discharge": "Nhava Sheva, India",
        "packages": 14, "invoice_gross": 430, "pl_gross": 430, "net_weight": 400,
        "special": "clean",
        "line_items": [
            {"description": "Precision ball bearings 6204", "hsn": "848210", "qty": 2200, "unit_price": 850, "line_total": 1870000.00},
        ],
    },
    {
        "key": "I", "shipment_number": "SHP-24819", "status": "Draft",
        "supplier": supplier("Company J", "United Kingdom", "Unit 4, Felixstowe Rd", "Ipswich"),
        "currency": "GBP", "incoterm": "FOB",
        "invoice_number": "INV-UK-3001", "invoice_date": "2025-10-30",
        "bl_number": "BL-UK-9102", "vessel": "MV Thames Link",
        "port_of_loading": "Felixstowe, UK", "port_of_discharge": "Nhava Sheva, India",
        "packages": 24, "invoice_gross": 1250, "pl_gross": 1250, "net_weight": 1200,
        "special": "clean",
        "line_items": [
            {"description": "Office task chair", "hsn": "940130", "qty": 180, "unit_price": 89.00, "line_total": 16020.00},
        ],
    },
    {
        "key": "J", "shipment_number": "SHP-24820", "status": "Extracting",
        "supplier": supplier("Company K", "Singapore", "7 Sungei Kadut Loop", "Singapore"),
        "currency": "USD", "incoterm": "FOB",
        "invoice_number": "INV-SG-1540", "invoice_date": "2025-10-31",
        "bl_number": "BL-SG-6083", "vessel": "MV Lion City",
        "port_of_loading": "Singapore", "port_of_discharge": "Nhava Sheva, India",
        "packages": 28, "invoice_gross": 1560, "pl_gross": 1560, "net_weight": 1500,
        "special": "clean",
        "line_items": [
            {"description": "Solar PV cable 4mm2", "hsn": "854449", "qty": 900, "unit_price": 4.20, "line_total": 3780.00},
        ],
    },
    {
        "key": "L", "shipment_number": "SHP-24821", "status": "Ready for approval",
        "supplier": supplier("Company L", "Italy", "Via delle Industrie 9", "Milan"),
        "currency": "EUR", "incoterm": "EXW",
        "invoice_number": "INV-IT-2190", "invoice_date": "2025-11-03",
        "bl_number": "BL-IT-5566", "vessel": "MV Adriatic Line",
        "port_of_loading": "Genoa, Italy", "port_of_discharge": "Nhava Sheva, India",
        "packages": 16, "invoice_gross": 890, "pl_gross": 890, "net_weight": 850,
        "special": "clean",
        "line_items": [
            {"description": "Espresso machine group head", "hsn": "841950", "qty": 340, "unit_price": 31.00, "line_total": 10540.00},
        ],
    },
]


def field(key, value, confidence=0.94, status="extracted", page=1, ai_value=None):
    return {
        "key": key, "value": value, "ai_value": ai_value if ai_value is not None else value,
        "confidence": confidence, "status": status, "source_page": page,
    }


def invoice_extraction(data):
    grand = sum(i["line_total"] for i in data["line_items"])
    # Demo: inject low-confidence and wrong values so the needs_review flow
    # is exercised without live API calls.
    gw_conf = 0.65 if data["key"] == "A" else 0.94   # SHP-24811 low confidence
    inc_conf = 0.75 if data["key"] == "B" else 0.94  # SHP-24812 low confidence
    if data["special"] == "invoice_total_mismatch":
        it_value = f"{data['currency']} {grand + 200:.2f}"  # wrong total
        it_conf = 0.35                                       # low confidence
    else:
        it_value = f"{data['currency']} {grand:.2f}"
        it_conf = 0.92
    fields = [
        field("supplier", data["supplier"]["name"]),
        field("consignee", CONSIGNEE["name"]),
        field("invoice_number", data["invoice_number"]),
        field("invoice_date", data["invoice_date"]),
        field("currency", data["currency"]),
        field("incoterm", data["incoterm"], confidence=inc_conf),
        field("packages", str(data["packages"])),
        field("gross_weight_kg", str(data["invoice_gross"]), confidence=gw_conf),
        field("net_weight_kg", str(data["net_weight"])),
    ]
    fields.append(field("invoice_total", it_value, confidence=it_conf))
    return {
        "document_type": "invoice",
        "supplier": data["supplier"]["name"],
        "consignee": CONSIGNEE["name"],
        "invoice_number": data["invoice_number"],
        "invoice_date": data["invoice_date"],
        "currency": data["currency"],
        "incoterm": data["incoterm"],
        "invoice_total": f"{data['currency']} {grand:.2f}",
        "packages": data["packages"],
        "gross_weight_kg": data["invoice_gross"],
        "net_weight_kg": data["net_weight"],
        "line_items": [
            {
                "description": i["description"], "hsn": i["hsn"], "qty": i["qty"],
                "unit_price": i["unit_price"], "line_total": i["line_total"],
                "confidence": 0.96, "status": "extracted", "source_page": 1,
            }
            for i in data["line_items"]
        ],
        "fields": fields,
        "source_text": f"INVOICE {data['invoice_number']} {data['supplier']['name']}",
    }


def packing_list_extraction(data):
    # Demo: inject low-confidence values so the needs_review flow is exercised.
    gw_conf = 0.70 if data["key"] == "A" else 0.94  # SHP-24811 low confidence
    fields = [
        field("supplier", data["supplier"]["name"]),
        field("consignee", CONSIGNEE["name"]),
        field("packages", str(data["packages"])),
        field("gross_weight_kg", str(data["pl_gross"]), confidence=gw_conf),
        field("net_weight_kg", str(data["net_weight"])),
        field("containers", ", ".join(data["containers"])),
    ]
    return {
        "document_type": "packing_list",
        "supplier": data["supplier"]["name"],
        "consignee": CONSIGNEE["name"],
        "packages": data["packages"],
        "gross_weight_kg": data["pl_gross"],
        "net_weight_kg": data["net_weight"],
        "containers": data["containers"],
        "line_items": [
            {
                "description": i["description"], "hsn": i["hsn"], "qty": i["qty"],
                "unit_price": i["unit_price"], "line_total": i["line_total"],
                "confidence": 0.95, "status": "extracted", "source_page": 1,
            }
            for i in data["line_items"]
        ],
        "fields": fields,
        "source_text": f"PACKING LIST ref {data['invoice_number']}",
    }


def bl_extraction(data):
    fields = [
        field("bl_number", data["bl_number"]),
        field("vessel", data["vessel"]),
        field("port_of_loading", data["port_of_loading"]),
        field("port_of_discharge", data["port_of_discharge"]),
        field("supplier", data["supplier"]["name"]),
        field("consignee", CONSIGNEE["name"]),
        field("packages", str(data["packages"])),
        field("gross_weight_kg", str(data["invoice_gross"])),
        field("containers", ", ".join(data["containers"])),
    ]
    return {
        "document_type": "bill_of_lading",
        "bl_number": data["bl_number"],
        "vessel": data["vessel"],
        "port_of_loading": data["port_of_loading"],
        "port_of_discharge": data["port_of_discharge"],
        "supplier": data["supplier"]["name"],
        "consignee": CONSIGNEE["name"],
        "packages": data["packages"],
        "gross_weight_kg": data["invoice_gross"],
        "containers": data["containers"],
        "fields": fields,
        "source_text": f"BILL OF LADING {data['bl_number']} {data['vessel']}",
    }


def _write_if_changed(path, text):
    """Write text to path only if the LF-normalized content differs.

    Re-running generate() therefore never touches committed seed files whose
    content is already correct. New writes use LF line endings.
    """
    new_bytes = text.encode("utf-8")
    if path.is_file():
        existing = path.read_bytes()
        if existing.replace(b"\r\n", b"\n") == new_bytes.replace(b"\r\n", b"\n"):
            return
    path.write_bytes(new_bytes)


def _rel_path(path):
    """Return a forward-slash path relative to the project root.

    Committed manifest entries must never contain absolute Windows paths or
    usernames.
    """
    return str(Path(path).relative_to(ROOT)).replace("\\", "/")


def generate(regenerate=False):
    """Generate seed PDFs and cached JSON.

    Skips rendering when the output files already exist so repeated runs do not
    rewrite committed binary files (reportlab embeds a creation timestamp, so
    regeneration changes bytes on every run). Pass regenerate=True to force.
    """
    SEED_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    manifest = []
    for s in SHIPMENTS:
        key = s["key"]
        num = s["shipment_number"]
        sdir = SEED_DIR / num
        sdir.mkdir(parents=True, exist_ok=True)
        cdir = CACHE_DIR / num
        cdir.mkdir(parents=True, exist_ok=True)

        data = dict(s)
        data["consignee"] = CONSIGNEE
        data["doc_sub"] = f"{num}  |  {data['supplier']['name']} -> {CONSIGNEE['name']}"
        data["containers"] = CONTAINERS[key]

        def maybe_write(path, produce):
            if regenerate or not path.exists():
                produce(path)

        # Invoice PDF + cached JSON (inv_json always defined below)
        inv_pdf = sdir / "invoice.pdf"
        maybe_write(inv_pdf, lambda p: render_invoice(p, data))
        inv_json_path = cdir / "invoice.json"
        if regenerate or not inv_json_path.exists():
            inv_json = invoice_extraction(data)
            inv_json_path.write_text(json.dumps(inv_json, indent=2))
        else:
            inv_json = json.loads(inv_json_path.read_text(encoding="utf-8"))

        # Packing list PDF + cached JSON (pl_json always defined below)
        pl_pdf = sdir / "packing_list.pdf"
        maybe_write(pl_pdf, lambda p: render_packing_list(p, data))
        pl_json_path = cdir / "packing_list.json"
        if regenerate or not pl_json_path.exists():
            pl_json = packing_list_extraction(data)
            pl_json_path.write_text(json.dumps(pl_json, indent=2))
        else:
            pl_json = json.loads(pl_json_path.read_text(encoding="utf-8"))

        # Bill of lading (PDF unless missing_bl). bl_json always defined.
        if s["special"] == "missing_bl":
            bl_path = None
            bl_json = None
        else:
            bl_pdf = sdir / "bill_of_lading.pdf"
            maybe_write(bl_pdf, lambda p: render_bl(p, data))
            bl_json_path = cdir / "bill_of_lading.json"
            if regenerate or not bl_json_path.exists():
                bl_json = bl_extraction(data)
                bl_json_path.write_text(json.dumps(bl_json, indent=2))
            else:
                bl_json = json.loads(bl_json_path.read_text(encoding="utf-8"))
            bl_path = str(bl_pdf)

        # Skewed scan: SHP-24815 invoice is also an image (scanned)
        if s["special"] == "skewed_scan":
            scan_png = sdir / "invoice_scan.png"
            maybe_write(scan_png, lambda p: render_scan_png(p, data))

        manifest.append({
            "shipment_number": num,
            "supplier": data["supplier"]["name"],
            "country": data["supplier"]["city_country"].split(", ")[-1],
            "status": s["status"],
            "currency": data["currency"],
            "special": s["special"],
            "invoice_pdf": _rel_path(inv_pdf),
            "packing_list_pdf": _rel_path(pl_pdf),
            "bill_of_lading_pdf": _rel_path(bl_pdf) if bl_path else None,
            "scan_png": _rel_path(sdir / "invoice_scan.png") if s["special"] == "skewed_scan" else None,
            "cached_invoice": _rel_path(cdir / "invoice.json"),
            "cached_packing_list": _rel_path(cdir / "packing_list.json"),
            "cached_bill_of_lading": _rel_path(cdir / "bill_of_lading.json") if bl_json else None,
        })

    _write_if_changed(SEED_DIR / "manifest.json", json.dumps(manifest, indent=2))
    print(f"Generated {len(SHIPMENTS)} shipments into {SEED_DIR}")
    print("Cached extraction JSON in", CACHE_DIR)
    return manifest


# ---------------------------------------------------------------------------
# Cross-check computation (Python mirror of lib/crosschecks.ts).
# Pure, deterministic, no I/O -- used to seed crosscheck_results rows.
# ---------------------------------------------------------------------------
DEFAULT_WEIGHT_TOLERANCE = 0.005
DEFAULT_TOTAL_TOLERANCE = 0.01


def _cc_to_num(v):
    if v is None:
        return None
    s = re.sub(r"[^0-9.\-]", "", str(v))
    if s in ("", "-", ".", "-."):
        return None
    try:
        n = float(s)
    except ValueError:
        return None
    return n


def _cc_doc_view(doc_json):
    fields = {f["key"]: f for f in doc_json.get("fields", []) if isinstance(f, dict)}

    def get(key):
        f = fields.get(key)
        return f.get("value") if f else None

    lines = []
    for li in doc_json.get("line_items", []) or []:
        lines.append({
            "description": li.get("description"),
            "hsn": li.get("hsn"),
            "qty": _cc_to_num(li.get("qty")),
            "unitPrice": _cc_to_num(li.get("unit_price")),
            "lineTotal": _cc_to_num(li.get("line_total")),
        })
    containers_raw = get("containers")
    containers = [c.strip() for c in str(containers_raw).split(",")] if containers_raw else []
    return {
        "total": _cc_to_num(get("invoice_total")),
        "currency": get("currency"),
        "incoterm": get("incoterm"),
        "supplier": get("supplier"),
        "packages": _cc_to_num(get("packages")),
        "grossWeight": _cc_to_num(get("gross_weight_kg")),
        "containers": containers,
        "lines": lines,
    }


def _cc_normalize_text(s):
    return re.sub(r"[^a-z0-9]+", " ", str(s or "").lower()).strip()


def _cc_iso6346_valid(c):
    c = (c or "").strip().upper()
    if len(c) != 11:
        return False
    letters = "0123456789A?"  # placeholder; real mapping below
    values = {
        "A": 10, "B": 12, "C": 13, "D": 14, "E": 15, "F": 16, "G": 17, "H": 18,
        "I": 19, "J": 20, "K": 21, "L": 23, "M": 24, "N": 25, "O": 26, "P": 27,
        "Q": 28, "R": 29, "S": 30, "T": 31, "U": 32, "V": 34, "W": 35, "X": 36,
        "Y": 37, "Z": 38,
    }
    try:
        total = 0
        for i, ch in enumerate(c[:10]):
            total += values[ch] * (2 ** i)
        check = 0 if total % 11 == 10 else total % 11
        return str(check) == c[10]
    except KeyError:
        return False


def _cc_result(check_type, status, value_a=None, value_b=None, delta=None,
               fields_involved=None, details=None):
    return {
        "check_type": check_type,
        "status": status,
        "value_a": value_a,
        "value_b": value_b,
        "delta": delta,
        "fields_involved": fields_involved or [],
        "details": details or {},
    }


def compute_crosschecks(invoice_json, packing_json, bl_json,
                        weight_tolerance=DEFAULT_WEIGHT_TOLERANCE,
                        total_tolerance=DEFAULT_TOTAL_TOLERANCE):
    invoice = _cc_doc_view(invoice_json or {})
    packing = _cc_doc_view(packing_json or {})
    bl = _cc_doc_view(bl_json or {})
    results = []

    # 1. Invoice total vs sum of line totals
    total = invoice["total"]
    lines = invoice["lines"] or []
    if total is None or not lines:
        results.append(_cc_result("invoice_total", "cannot_check",
                                  value_a=str(total) if total is not None else None,
                                  fields_involved=["invoice_total", "line_items[].line_total"],
                                  details={"reason": "missing invoice total or no line items"}))
    else:
        line_sum = sum((l["lineTotal"] or 0) for l in lines)
        delta = abs(line_sum - total)
        status = "pass" if delta <= total_tolerance else "fail"
        results.append(_cc_result("invoice_total", status,
                                  value_a=str(total), value_b=str(line_sum),
                                  delta=f"{delta:.2f}",
                                  fields_involved=["invoice_total", "line_items[].line_total"],
                                  details={"currency": invoice["currency"], "tolerance": total_tolerance,
                                           "line_count": len(lines)}))

    # 1b. Line total vs qty x unit price (per line)
    if not lines:
        results.append(_cc_result("line_item_math", "cannot_check",
                                  fields_involved=["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
                                  details={"reason": "no line items"}))
    else:
        failing = 0
        first_fail = None
        for l in lines:
            qty, unit, lt = l["qty"], l["unitPrice"], l["lineTotal"]
            if qty is None or unit is None or lt is None:
                results.append(_cc_result("line_item_math", "cannot_check",
                                          fields_involved=["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
                                          details={"reason": "incomplete line data"}))
                failing = -1  # marker: already appended cannot_check
                break
            expected = qty * unit
            if abs(lt - expected) > total_tolerance:
                failing += 1
                if first_fail is None:
                    first_fail = (str(lt), str(expected), f"{abs(lt-expected):.2f}")
        if failing == -1:
            pass
        elif failing == 0:
            results.append(_cc_result("line_item_math", "pass",
                                      fields_involved=["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
                                      details={"tolerance": total_tolerance, "line_count": len(lines),
                                               "failing_lines": 0}))
        else:
            results.append(_cc_result("line_item_math", "fail",
                                      value_a=first_fail[0], value_b=first_fail[1], delta=first_fail[2],
                                      fields_involved=["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
                                      details={"tolerance": total_tolerance, "line_count": len(lines),
                                               "failing_lines": failing}))

    # 2. Line item quantities: invoice vs packing list
    inv_lines = invoice["lines"] or []
    pl_lines = packing["lines"] or []
    if not inv_lines or not pl_lines:
        results.append(_cc_result("line_item_qty", "cannot_check",
                                  fields_involved=["line_items[].description", "line_items[].hsn", "line_items[].qty"],
                                  details={"reason": "missing invoice or packing list lines"}))
    else:
        pl_by_key = {}
        for l in pl_lines:
            hsn = (l["hsn"] or "").strip()
            key = f"hsn:{hsn}" if hsn else f"desc:{_cc_normalize_text(l['description'])}"
            pl_by_key[key] = l
        failing = 0
        matched = 0
        unmatched = []
        for inv in inv_lines:
            hsn = (inv["hsn"] or "").strip()
            key = f"hsn:{hsn}" if hsn else f"desc:{_cc_normalize_text(inv['description'])}"
            pl = pl_by_key.get(key)
            if not pl:
                unmatched.append(inv["description"])
                continue
            matched += 1
            if inv["qty"] is None or pl["qty"] is None or inv["qty"] != pl["qty"]:
                failing += 1
        status = "pass" if failing == 0 and matched == len(inv_lines) else "fail"
        results.append(_cc_result("line_item_qty", status,
                                  value_a=str(len(inv_lines)), value_b=str(matched),
                                  delta=f"{failing} line(s) mismatch" if failing else None,
                                  fields_involved=["line_items[].description", "line_items[].hsn", "line_items[].qty"],
                                  details={"invoice_lines": len(inv_lines), "matched_lines": matched,
                                           "unmatched": unmatched, "failing_lines": failing}))

    # 3. Total packages: invoice vs packing list vs bill of lading
    values = [("invoice", invoice["packages"]), ("packing_list", packing["packages"]),
              ("bill_of_lading", bl["packages"])]
    values = [(src, n) for src, n in values if n is not None]
    if len(values) < 2:
        results.append(_cc_result("total_packages", "cannot_check",
                                  fields_involved=["packages"],
                                  details={"reason": "fewer than two documents report packages"}))
    else:
        first = values[0][1]
        inconsistent = [v for v in values if v[1] != first]
        status = "pass" if not inconsistent else "fail"
        target = inconsistent[0] if inconsistent else None
        results.append(_cc_result("total_packages", status,
                                  value_a=str(first),
                                  value_b=str(target[1]) if target else None,
                                  delta=str(abs(first - target[1])) if target and first is not None and target[1] is not None else None,
                                  fields_involved=["packages"],
                                  details={"values": [{src: n} for src, n in values]}))

    # 4. Gross weight: invoice vs packing list vs bill of lading
    gw_values = [("invoice", invoice["grossWeight"]), ("packing_list", packing["grossWeight"]),
                 ("bill_of_lading", bl["grossWeight"])]
    gw_values = [(src, n) for src, n in gw_values if n is not None]
    if len(gw_values) < 2:
        results.append(_cc_result("gross_weight", "cannot_check",
                                  fields_involved=["gross_weight_kg"],
                                  details={"reason": "fewer than two documents report gross weight",
                                           "weight_tolerance": weight_tolerance}))
    else:
        worst_pct = 0.0
        worst = None
        for i in range(len(gw_values)):
            for j in range(i + 1, len(gw_values)):
                a = gw_values[i][1]; b = gw_values[j][1]
                ref = b if a == 0 else a
                pct = 0.0 if ref == 0 else (abs(a - b) / abs(ref)) * 100
                if pct > worst_pct:
                    worst_pct = pct
                    worst = (a, b)
        status = "pass" if worst_pct <= weight_tolerance * 100 else "fail"
        results.append(_cc_result("gross_weight", status,
                                  value_a=str(worst[0]) if worst else None,
                                  value_b=str(worst[1]) if worst else None,
                                  delta=f"{worst_pct:.2f}%" if worst else "0%",
                                  fields_involved=["gross_weight_kg"],
                                  details={"weight_tolerance": weight_tolerance,
                                           "weight_tolerance_percent": weight_tolerance * 100,
                                           "values": [{src: n} for src, n in gw_values],
                                           "worst_pair_percent": f"{worst_pct:.2f}"}))

    # 5. Container numbers: packing list vs bill of lading + ISO 6346
    pl_containers = packing["containers"]
    bl_containers = bl["containers"]
    if not pl_containers and not bl_containers:
        results.append(_cc_result("container_numbers", "cannot_check",
                                  fields_involved=["containers"],
                                  details={"reason": "no container numbers on either document"}))
    else:
        invalid = [c for c in pl_containers + bl_containers if not _cc_iso6346_valid(c)]
        pl_set = set(pl_containers); bl_set = set(bl_containers)
        only_pl = [c for c in pl_containers if c not in bl_set]
        only_bl = [c for c in bl_containers if c not in pl_set]
        mismatch = bool(only_pl or only_bl)
        status = "fail" if (mismatch or invalid) else "pass"
        results.append(_cc_result("container_numbers", status,
                                  value_a=", ".join(pl_containers) if pl_containers else None,
                                  value_b=", ".join(bl_containers) if bl_containers else None,
                                  delta=(f"{len(only_pl) + len(only_bl)} unmatched, {len(invalid)} invalid"
                                         if (only_pl or only_bl or invalid) else None),
                                  fields_involved=["containers"],
                                  details={"only_in_packing_list": only_pl,
                                           "only_in_bill_of_lading": only_bl,
                                           "invalid_containers": invalid}))

    # 6a. Currency and Incoterm consistency across documents
    docs = [("invoice", invoice), ("packing_list", packing), ("bill_of_lading", bl)]
    currencies = [d["currency"] for _, d in docs if d["currency"]]
    incoterms = [d["incoterm"] for _, d in docs if d["incoterm"]]
    issues = []
    if len(currencies) >= 2 and len(set(currencies)) > 1:
        issues.append(f"currency differs: {', '.join(currencies)}")
    if len(incoterms) >= 2 and len(set(incoterms)) > 1:
        issues.append(f"incoterm differs: {', '.join(incoterms)}")
    if len(currencies) < 2 and len(incoterms) < 2:
        results.append(_cc_result("currency_incoterm", "cannot_check",
                                  fields_involved=["currency", "incoterm"],
                                  details={"reason": "insufficient documents report currency/incoterm"}))
    else:
        results.append(_cc_result("currency_incoterm", "pass" if not issues else "fail",
                                  value_a=", ".join(currencies) if currencies else None,
                                  value_b=", ".join(incoterms) if incoterms else None,
                                  delta="; ".join(issues) if issues else None,
                                  fields_involved=["currency", "incoterm"],
                                  details={"issues": issues}))

    # 6b. Supplier name consistency across documents
    names = [d["supplier"] for _, d in docs if d["supplier"]]
    if len(names) < 2:
        results.append(_cc_result("supplier_consistency", "cannot_check",
                                  fields_involved=["supplier"],
                                  details={"reason": "fewer than two documents report a supplier"}))
    else:
        normalized = [_cc_normalize_text(n) for n in names]
        all_same = all(n == normalized[0] for n in normalized)
        fuzzy = all_same
        if not all_same and len(normalized) >= 2:
            t0 = set(normalized[0].split())
            overlap = all(len(set(n.split()) & t0) / len(set(n.split()) | t0) >= 0.85
                          for n in normalized[1:])
            fuzzy = overlap
        results.append(_cc_result("supplier_consistency", "pass" if fuzzy else "fail",
                                  value_a=names[0], value_b=names[1] if len(names) > 1 else None,
                                  delta=None if fuzzy else "names differ after normalisation",
                                  fields_involved=["supplier"],
                                  details={"names": names, "normalized": normalized,
                                           "all_same": all_same, "fuzzy_match": fuzzy}))

    return results


def _load_json(path):
    if not path:
        return None
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    if not p.is_file():
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def _exec(call, context):
    """Run a supabase/storage call, exiting non-zero on any failure.

    supabase-py 2.x raises on API failures (postgrest APIError, storage3
    StorageApiError, etc.) instead of returning an .error attribute. Failures
    are never swallowed here: we print the exception type and message (no
    secrets) together with the context, then exit non-zero.
    """
    try:
        return call()
    except SystemExit:
        raise
    except Exception as e:
        print(f"ERROR: {context}: {type(e).__name__}: {e}")
        sys.exit(1)


def _first_id(res, context):
    """Return res.data[0]['id'], exiting if the response has no data."""
    data = getattr(res, "data", None) or []
    if not data:
        print(f"ERROR: {context}: Supabase returned no data")
        sys.exit(1)
    return data[0]["id"]


def load_into_supabase(manifest):
    """Load seed data into Supabase using the service-role key (server-side only)."""
    read_files = load_env_files()
    require_load_env(read_files)

    url = resolve_supabase_url()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: --load requires the supabase Python package.")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)

    sb = create_client(url, key)

    if not manifest:
        print("ERROR: manifest is empty; nothing to load")
        sys.exit(1)
    manifest_by_number = {m["shipment_number"]: m for m in manifest}
    # Validate that every referenced seed file exists before touching Supabase.
    for m in manifest:
        num = m["shipment_number"]
        for key in ("invoice_pdf", "packing_list_pdf", "cached_invoice", "cached_packing_list"):
            rel = m.get(key)
            if rel and not (ROOT / rel).is_file():
                print(f"ERROR: {num}: referenced file missing: {ROOT / rel}")
                sys.exit(1)
        for key in ("bill_of_lading_pdf", "scan_png"):
            rel = m.get(key)
            if rel and not (ROOT / rel).is_file():
                print(f"ERROR: {num}: referenced file missing: {ROOT / rel}")
                sys.exit(1)

    # Demo users (email/password). Passwords are derived from the
    # DEMO_PASSWORD env var (or a strong random value if unset). No passwords
    # or keys are ever printed.
    demo_password = os.environ.get("DEMO_PASSWORD") or secrets.token_urlsafe(16)
    if os.environ.get("DEMO_PASSWORD"):
        print("Demo password: loaded from DEMO_PASSWORD")
    else:
        print("Demo password: generated randomly (DEMO_PASSWORD not set)")
    demo_users = [
        ("exec@demo.local", demo_password, "documentation_executive", "Demo Executive"),
        ("manager@demo.local", demo_password, "documentation_manager", "Demo Manager"),
    ]

    created_users = 0
    skipped_users = 0
    for email, pwd, role, full in demo_users:
        existing = _get_user_id(sb, email)
        if existing:
            print(f"skipped: auth user {email} already exists")
            skipped_users += 1
            continue
        res = _exec(
            lambda: sb.auth.admin.create_user({
                "email": email, "password": pwd, "email_confirm": True,
                "user_metadata": {"role": role, "full_name": full},
            }),
            f"create auth user {email}",
        )
        # create_user returns a UserResponse object (not a .data row list).
        # If _exec did not raise, the user was created.
        print(f"created: auth user {email}")
        created_users += 1

    # Let auth propagate before reading users / writing profiles.
    import time
    time.sleep(1)

    # Set app_metadata role via service role (not user-editable). Idempotent.
    # skip when the user's app_metadata role already matches.
    for email, pwd, role, full in demo_users:
        uid = _get_user_id(sb, email)
        if uid is None:
            print(f"error: cannot set app_metadata for {email}: user not found")
            sys.exit(1)
        user = _get_user(sb, email)
        if user is not None and (user.app_metadata or {}).get("role") == role:
            print(f"skipped: app_metadata role={role} for {email} already matches")
            continue
        _exec(
            lambda: sb.auth.admin.update_user_by_id(uid, {"app_metadata": {"role": role}}),
            f"set app_metadata for {email}",
        )
        print(f"updated: app_metadata role={role} for {email}")

    # Profiles (idempotent upsert)
    profile_ids = {}
    created_profiles = 0
    skipped_profiles = 0
    for email, pwd, role, full in demo_users:
        uid = _get_user_id(sb, email)
        if uid is None:
            print(f"error: cannot write profile for {email}: user not found")
            sys.exit(1)
        before_res = _exec(
            lambda: sb.table("profiles").select("id").eq("id", uid).execute(),
            f"select profile {email}",
        )
        before = before_res.data or []
        res = _exec(
            lambda: sb.table("profiles").upsert({
                "id": uid, "role": role, "full_name": full, "email": email,
            }).execute(),
            f"upsert profile {email}",
        )
        profile_ids[role] = uid
        if before:
            print(f"skipped: profile {email} already exists (refreshed)")
            skipped_profiles += 1
        else:
            print(f"created: profile {email} role={role}")
            created_profiles += 1

    print(f"users: {created_users} created, {skipped_users} skipped")
    print(f"profiles: {created_profiles} created, {skipped_profiles} skipped")

    exec_id = profile_ids["documentation_executive"]
    manager_id = profile_ids["documentation_manager"]

    # Suppliers (idempotent by name)
    supplier_ids = {}
    created_suppliers = 0
    skipped_suppliers = 0
    for s in SHIPMENTS:
        name = s["supplier"]["name"]
        country = s["supplier"]["city_country"].split(", ")[-1]
        existing_res = _exec(
            lambda: sb.table("suppliers").select("id").eq("name", name).execute(),
            f"select supplier {name}",
        )
        existing = existing_res.data or []
        if existing:
            supplier_ids[s["key"]] = existing[0]["id"]
            print(f"skipped: supplier {name} already exists")
            skipped_suppliers += 1
        else:
            res = _exec(
                lambda: sb.table("suppliers").insert({
                    "name": name, "country": country,
                }).execute(),
                f"insert supplier {name}",
            )
            supplier_ids[s["key"]] = _first_id(res, f"insert supplier {name}")
            print(f"created: supplier {name}")
            created_suppliers += 1
    print(f"suppliers: {created_suppliers} created, {skipped_suppliers} skipped")

    # Shipments (idempotent by shipment_number)
    shipment_ids = {}
    created_shipments = 0
    skipped_shipments = 0
    for s in SHIPMENTS:
        num = s["shipment_number"]
        existing_res = _exec(
            lambda: sb.table("shipments").select("id").eq("shipment_number", num).execute(),
            f"select shipment {num}",
        )
        existing = existing_res.data or []
        if existing:
            shipment_ids[num] = existing[0]["id"]
            print(f"skipped: shipment {num} already exists")
            skipped_shipments += 1
            continue
        res = _exec(
            lambda: sb.table("shipments").insert({
                "shipment_number": num,
                "supplier_id": supplier_ids[s["key"]],
                "status": s["status"],
                "created_by": exec_id,
            }).execute(),
            f"insert shipment {num}",
        )
        shipment_ids[num] = _first_id(res, f"insert shipment {num}")
        print(f"created: shipment {num} status={s['status']}")
        created_shipments += 1
    print(f"shipments: {created_shipments} created, {skipped_shipments} skipped")

    # Documents: upload seed PDFs to the private 'documents' bucket and create rows.
    created_documents = 0
    skipped_documents = 0
    document_ids = {}  # (shipment_number, type) -> document id

    def mime_type_for(file_name):
        ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""
        return {"pdf": "application/pdf", "png": "image/png"}.get(ext, "application/octet-stream")

    # ------------------------------------------------------------------
    # Ensure the private 'documents' storage bucket exists.
    # list_buckets() returns a list of bucket objects (each with .name).
    # ------------------------------------------------------------------
    def _ensure_documents_bucket():
        buckets = _exec(
            lambda: sb.storage.list_buckets(),
            "list storage buckets",
        )
        names = set()
        for b in buckets or []:
            name = getattr(b, "name", None)
            if name:
                names.add(name)
        if "documents" in names:
            return
        # Not present: create it as private.
        _exec(
            lambda: sb.storage.create_bucket("documents", options={"public": False}),
            "create storage bucket 'documents'",
        )
        print("created: storage bucket 'documents' (private)")

    _ensure_documents_bucket()

    for s in SHIPMENTS:
        num = s["shipment_number"]
        shipment_id = shipment_ids[num]
        m = manifest_by_number[num]
        docs = [
            ("invoice", m.get("invoice_pdf")),
            ("packing_list", m.get("packing_list_pdf")),
            ("bill_of_lading", m.get("bill_of_lading_pdf")),
        ]
        if m.get("scan_png"):
            docs.append(("invoice_scan", m["scan_png"]))
        for doc_type, rel_path in docs:
            if not rel_path:
                continue
            file_path = ROOT / rel_path
            if not file_path.is_file():
                print(f"ERROR: {num}: referenced file missing: {file_path}")
                sys.exit(1)
            key = (num, doc_type)
            existing_res = _exec(
                lambda: sb.table("documents").select("id").eq("shipment_id", shipment_id).eq("type", doc_type).execute(),
                f"select document {num}/{doc_type}",
            )
            existing = existing_res.data or []
            if existing:
                document_ids[key] = existing[0]["id"]
                print(f"skipped: document {num}/{doc_type} already exists")
                skipped_documents += 1
                continue
            file_bytes = file_path.read_bytes()
            storage_path = f"{num}/{doc_type}.png" if doc_type == "invoice_scan" else f"{num}/{doc_type}.pdf"
            _exec(
                lambda: sb.storage.from_("documents").upload(
                    storage_path,
                    file_bytes,
                    file_options={"content-type": mime_type_for(str(file_path)), "upsert": "true"},
                ),
                f"upload {storage_path}",
            )
            # Verify the file landed in the bucket.
            exists = _exec(
                lambda: sb.storage.from_("documents").exists(storage_path),
                f"verify uploaded object {storage_path}",
            )
            if not exists:
                print(f"ERROR: upload verified false for {storage_path}")
                sys.exit(1)
            res = _exec(
                lambda: sb.table("documents").insert({
                    "shipment_id": shipment_id,
                    "type": doc_type,
                    "storage_path": storage_path,
                    "file_name": file_path.name,
                    "file_size": len(file_bytes),
                    "mime_type": mime_type_for(str(file_path)),
                    "status": "extracted",
                }).execute(),
                f"insert document {num}/{doc_type}",
            )
            document_ids[key] = _first_id(res, f"insert document {num}/{doc_type}")
            print(f"created: document {num}/{doc_type}")
            created_documents += 1
    print(f"documents: {created_documents} created, {skipped_documents} skipped")

    # Fields + line items from cached extraction JSON (idempotent by shipment).
    created_fields = 0
    created_line_items = 0
    for s in SHIPMENTS:
        num = s["shipment_number"]
        shipment_id = shipment_ids[num]
        m = manifest_by_number[num]
        already_res = _exec(
            lambda: sb.table("fields").select("id").eq("shipment_id", shipment_id).limit(1).execute(),
            f"select fields for {num}",
        )
        already = already_res.data or []
        if already:
            print(f"skipped: fields/line_items for {num} already exist")
            continue
        inserted_any = False
        for doc_type in ("invoice", "packing_list", "bill_of_lading"):
            rel_path = m.get(f"cached_{doc_type}")
            if not rel_path:
                continue
            cache_path = ROOT / rel_path
            if not cache_path.is_file():
                print(f"ERROR: {num}: referenced file missing: {cache_path}")
                sys.exit(1)
            doc_id = document_ids.get((num, doc_type))
            if doc_id is None:
                print(f"ERROR: no document id for {num}/{doc_type}; cannot insert fields")
                sys.exit(1)
            data = json.loads(cache_path.read_text(encoding="utf-8"))
            for f in data.get("fields", []):
                res = _exec(
                    lambda: sb.table("fields").insert({
                        "shipment_id": shipment_id,
                        "document_id": doc_id,
                        "key": f["key"],
                        "value": f.get("value"),
                        "ai_value": f.get("ai_value"),
                        "confidence": f.get("confidence"),
                        "status": f.get("status", "extracted"),
                        "source_page": f.get("source_page", 1),
                    }).execute(),
                    f"insert field {num}/{f.get('key')}",
                )
                if not res.data:
                    print(f"ERROR: insert field {num}/{f.get('key')}: Supabase returned no data")
                    sys.exit(1)
                created_fields += 1
                inserted_any = True
            for li in data.get("line_items", []):
                res = _exec(
                    lambda: sb.table("line_items").insert({
                        "shipment_id": shipment_id,
                        "document_id": doc_id,
                        "description": li.get("description"),
                        "hsn": li.get("hsn"),
                        "qty": li.get("qty"),
                        "unit_price": li.get("unit_price"),
                        "line_total": li.get("line_total"),
                        "confidence": li.get("confidence"),
                        "status": li.get("status", "extracted"),
                        "source_page": li.get("source_page", 1),
                    }).execute(),
                    f"insert line_item for {num}",
                )
                if not res.data:
                    print(f"ERROR: insert line_item for {num}: Supabase returned no data")
                    sys.exit(1)
                created_line_items += 1
                inserted_any = True
        if not inserted_any:
            print(f"ERROR: no fields/line_items inserted for {num}")
            sys.exit(1)
        print(f"created: fields+line_items for {num}")
    print(f"fields: {created_fields} created")
    print(f"line_items: {created_line_items} created")

    # Cross-check rows (idempotent by shipment).
    created_crosschecks = 0
    skipped_crosschecks = 0
    for s in SHIPMENTS:
        num = s["shipment_number"]
        shipment_id = shipment_ids[num]
        m = manifest_by_number[num]
        existing_res = _exec(
            lambda: sb.table("crosscheck_results").select("id").eq("shipment_id", shipment_id).limit(1).execute(),
            f"select crosschecks for {num}",
        )
        existing = existing_res.data or []
        if existing:
            print(f"skipped: crosschecks for {num} already exist")
            skipped_crosschecks += 1
            continue
        invoice_json = _load_json(m.get("cached_invoice"))
        packing_json = _load_json(m.get("cached_packing_list"))
        bl_json = _load_json(m.get("cached_bill_of_lading"))
        results = compute_crosschecks(invoice_json, packing_json, bl_json)
        inserted_any = False
        for r in results:
            res = _exec(
                lambda: sb.table("crosscheck_results").insert({
                    "shipment_id": shipment_id,
                    "check_type": r["check_type"],
                    "status": r["status"],
                    "value_a": r["value_a"],
                    "value_b": r["value_b"],
                    "delta": r["delta"],
                    "fields_involved": r["fields_involved"],
                    "details": r["details"],
                }).execute(),
                f"insert crosscheck {r['check_type']} for {num}",
            )
            if not res.data:
                print(f"ERROR: insert crosscheck {r['check_type']} for {num}: Supabase returned no data")
                sys.exit(1)
            created_crosschecks += 1
            inserted_any = True
        if not inserted_any:
            print(f"ERROR: no crosschecks inserted for {num}")
            sys.exit(1)
        print(f"created: crosschecks for {num} ({len(results)} checks)")
    print(f"crosschecks: {created_crosschecks} created, {skipped_crosschecks} skipped")

    # ------------------------------------------------------------------
    # Post-load validation: every seeded shipment must have documents,
    # fields, line_items and crosschecks rows.
    # ------------------------------------------------------------------
    expected_docs = {
        "SHP-24817": 2,   # no bill of lading
    }
    for s in SHIPMENTS:
        num = s["shipment_number"]
        shipment_id = shipment_ids[num]
        expected = expected_docs.get(num, 3)
        doc_res = _exec(
            lambda: sb.table("documents").select("id", count="exact").eq("shipment_id", shipment_id).execute(),
            f"count documents for {num}",
        )
        doc_count = doc_res.count if doc_res.count is not None else len(doc_res.data or [])
        if doc_count < expected:
            print(f"ERROR: {num} has {doc_count} document(s), expected at least {expected}")
            sys.exit(1)

        field_res = _exec(
            lambda: sb.table("fields").select("id", count="exact").eq("shipment_id", shipment_id).execute(),
            f"count fields for {num}",
        )
        field_count = field_res.count if field_res.count is not None else len(field_res.data or [])
        if field_count == 0:
            print(f"ERROR: {num} has 0 fields")
            sys.exit(1)

        li_res = _exec(
            lambda: sb.table("line_items").select("id", count="exact").eq("shipment_id", shipment_id).execute(),
            f"count line_items for {num}",
        )
        li_count = li_res.count if li_res.count is not None else len(li_res.data or [])
        if li_count == 0:
            print(f"ERROR: {num} has 0 line_items")
            sys.exit(1)

        cc_res = _exec(
            lambda: sb.table("crosscheck_results").select("id", count="exact").eq("shipment_id", shipment_id).execute(),
            f"count crosschecks for {num}",
        )
        cc_count = cc_res.count if cc_res.count is not None else len(cc_res.data or [])
        if cc_count == 0:
            print(f"ERROR: {num} has 0 crosschecks")
            sys.exit(1)

    print(f"validation: all {len(SHIPMENTS)} shipments have documents, fields, line_items and crosschecks")

    print(f"summary: users {created_users} created/{skipped_users} skipped, "
          f"suppliers {created_suppliers} created/{skipped_suppliers} skipped, "
          f"shipments {created_shipments} created/{skipped_shipments} skipped, "
          f"documents {created_documents} created/{skipped_documents} skipped, "
          f"fields {created_fields} created, line_items {created_line_items} created, "
          f"crosschecks {created_crosschecks} created/{skipped_crosschecks} skipped")

    print("Seed load complete.")


def _get_user_id(sb, email):
    res = _exec(lambda: sb.auth.admin.list_users(), "list auth users")
    for u in res or []:
        if u.email == email:
            return u.id
    return None


def _get_user(sb, email):
    """Return the auth User object for email, or None. list_users() -> list[User]."""
    res = _exec(lambda: sb.auth.admin.list_users(), "list auth users")
    for u in res or []:
        if u.email == email:
            return u
    return None


def _snapshot_seed_files():
    """Return dict mapping relative path -> bytes for every file under data/seeds."""
    snap = {}
    for base in (SEED_DIR, CACHE_DIR):
        if not base.is_dir():
            continue
        for path in base.rglob("*"):
            if path.is_file():
                snap[str(path.relative_to(ROOT))] = path.read_bytes()
    return snap


def _restore_seed_files(snap):
    for rel, data in snap.items():
        (ROOT / rel).write_bytes(data)


def _dry_run():
    """Run generate() with files present and with --regenerate; compare manifests.

    Restores every seed byte afterwards so data/seeds is left untouched.
    Does not touch Supabase.
    """
    snap = _snapshot_seed_files()
    try:
        manifest_normal = generate(regenerate=False)
        manifest_regen = generate(regenerate=True)
    finally:
        _restore_seed_files(snap)

    same = manifest_normal == manifest_regen
    print(
        f"dry-run: normal vs --regenerate manifest {'MATCH' if same else 'DIFFER'}"
    )
    if not same:
        print("dry-run: manifests differ; inspect generate()")
        sys.exit(1)
    print("dry-run: both generate() paths produce the same manifest structure")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--load", action="store_true", help="load into Supabase (service role)")
    parser.add_argument("--regenerate", action="store_true",
                        help="force regeneration of PDFs/cached JSON even if files exist")
    parser.add_argument("--dry-run", action="store_true",
                        help="compare generate() normal vs --regenerate manifests; no writes, no Supabase")
    args = parser.parse_args()

    if args.dry_run:
        _dry_run()
        sys.exit(0)

    manifest = generate(regenerate=args.regenerate)
    if args.load:
        load_into_supabase(manifest)
