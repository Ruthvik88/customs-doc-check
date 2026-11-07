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


def generate():
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

        # Invoice PDF
        inv_pdf = sdir / "invoice.pdf"
        render_invoice(inv_pdf, data)
        inv_json = invoice_extraction(data)
        (cdir / "invoice.json").write_text(json.dumps(inv_json, indent=2))

        # Packing list PDF
        pl_pdf = sdir / "packing_list.pdf"
        render_packing_list(pl_pdf, data)
        pl_json = packing_list_extraction(data)
        (cdir / "packing_list.json").write_text(json.dumps(pl_json, indent=2))

        # Bill of lading (PDF unless missing_bl)
        if s["special"] == "missing_bl":
            bl_path = None
            bl_json = None
        else:
            bl_pdf = sdir / "bill_of_lading.pdf"
            render_bl(bl_pdf, data)
            bl_json = bl_extraction(data)
            (cdir / "bill_of_lading.json").write_text(json.dumps(bl_json, indent=2))
            bl_path = str(bl_pdf)

        # Skewed scan: SHP-24815 invoice is also an image (scanned)
        if s["special"] == "skewed_scan":
            scan_png = sdir / "invoice_scan.png"
            render_scan_png(scan_png, data)

        manifest.append({
            "shipment_number": num,
            "supplier": data["supplier"]["name"],
            "country": data["supplier"]["city_country"].split(", ")[-1],
            "status": s["status"],
            "currency": data["currency"],
            "special": s["special"],
            "invoice_pdf": str(inv_pdf),
            "packing_list_pdf": str(pl_pdf),
            "bill_of_lading_pdf": bl_path,
            "scan_png": str(sdir / "invoice_scan.png") if s["special"] == "skewed_scan" else None,
            "cached_invoice": str(cdir / "invoice.json"),
            "cached_packing_list": str(cdir / "packing_list.json"),
            "cached_bill_of_lading": str(cdir / "bill_of_lading.json") if bl_json else None,
        })

    (SEED_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"Generated {len(SHIPMENTS)} shipments into {SEED_DIR}")
    print("Cached extraction JSON in", CACHE_DIR)
    return manifest


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
        try:
            sb.auth.admin.create_user({
                "email": email, "password": pwd, "email_confirm": True,
                "user_metadata": {"role": role, "full_name": full},
            })
            print(f"created: auth user {email}")
            created_users += 1
        except Exception as e:
            print(f"error creating auth user {email}: {e}")

    # Let auth propagate before reading users / writing profiles.
    import time
    time.sleep(1)

    # Set app_metadata role via service role (not user-editable). Idempotent.
    for email, pwd, role, full in demo_users:
        uid = _get_user_id(sb, email)
        if uid is None:
            print(f"error: cannot set app_metadata for {email}: user not found")
            continue
        try:
            sb.auth.admin.update_user_by_id(uid, {"app_metadata": {"role": role}})
            print(f"updated: app_metadata role={role} for {email}")
        except Exception as e:
            print(f"error setting app_metadata for {email}: {e}")

    # Profiles (idempotent upsert)
    profile_ids = {}
    created_profiles = 0
    skipped_profiles = 0
    for email, pwd, role, full in demo_users:
        uid = _get_user_id(sb, email)
        if uid is None:
            print(f"error: cannot write profile for {email}: user not found")
            continue
        before = sb.table("profiles").select("id").eq("id", uid).execute().data
        sb.table("profiles").upsert({"id": uid, "role": role, "full_name": full, "email": email}).execute()
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
        existing = sb.table("suppliers").select("id").eq("name", name).execute().data
        if existing:
            supplier_ids[s["key"]] = existing[0]["id"]
            print(f"skipped: supplier {name} already exists")
            skipped_suppliers += 1
        else:
            res = sb.table("suppliers").insert({
                "name": name, "country": country,
            }).execute()
            supplier_ids[s["key"]] = res.data[0]["id"]
            print(f"created: supplier {name}")
            created_suppliers += 1
    print(f"suppliers: {created_suppliers} created, {skipped_suppliers} skipped")

    # Shipments (idempotent by shipment_number)
    shipment_ids = {}
    created_shipments = 0
    skipped_shipments = 0
    for s in SHIPMENTS:
        num = s["shipment_number"]
        existing = sb.table("shipments").select("id").eq("shipment_number", num).execute().data
        if existing:
            shipment_ids[num] = existing[0]["id"]
            print(f"skipped: shipment {num} already exists")
            skipped_shipments += 1
            continue
        res = sb.table("shipments").insert({
            "shipment_number": num,
            "supplier_id": supplier_ids[s["key"]],
            "status": s["status"],
            "created_by": exec_id,
        }).execute()
        shipment_ids[num] = res.data[0]["id"]
        print(f"created: shipment {num} status={s['status']}")
        created_shipments += 1
    print(f"shipments: {created_shipments} created, {skipped_shipments} skipped")

    # Documents: upload seed PDFs to the private 'documents' bucket and create rows.
    # The 'documents' bucket must already exist as a private bucket (see deployment.md).
    created_documents = 0
    skipped_documents = 0
    document_ids = {}  # (shipment_number, type) -> document id

    def mime_type_for(file_name):
        ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""
        return {"pdf": "application/pdf", "png": "image/png"}.get(ext, "application/octet-stream")

    for s in SHIPMENTS:
        num = s["shipment_number"]
        shipment_id = shipment_ids[num]
        docs = [
            ("invoice", s.get("invoice_pdf")),
            ("packing_list", s.get("packing_list_pdf")),
            ("bill_of_lading", s.get("bill_of_lading_pdf")),
        ]
        if s.get("scan_png"):
            docs.append(("invoice_scan", s["scan_png"]))
        for doc_type, file_path in docs:
            if not file_path or not Path(file_path).is_file():
                continue
            key = (num, doc_type)
            existing = sb.table("documents").select("id").eq("shipment_id", shipment_id).eq("type", doc_type).execute().data
            if existing:
                document_ids[key] = existing[0]["id"]
                print(f"skipped: document {num}/{doc_type} already exists")
                skipped_documents += 1
                continue
            file_bytes = Path(file_path).read_bytes()
            storage_path = f"{num}/{doc_type}.png" if doc_type == "invoice_scan" else f"{num}/{doc_type}.pdf"
            try:
                sb.storage.from_("documents").upload(
                    storage_path,
                    file_bytes,
                    file_options={"content-type": mime_type_for(file_path), "upsert": True},
                )
            except Exception as e:
                print(f"error uploading {storage_path}: {e}")
                continue
            res = sb.table("documents").insert({
                "shipment_id": shipment_id,
                "type": doc_type,
                "storage_path": storage_path,
                "file_name": Path(file_path).name,
                "file_size": len(file_bytes),
                "mime_type": mime_type_for(file_path),
                "status": "extracted",
            }).execute()
            document_ids[key] = res.data[0]["id"]
            print(f"created: document {num}/{doc_type}")
            created_documents += 1
    print(f"documents: {created_documents} created, {skipped_documents} skipped")

    # Fields + line items from cached extraction JSON (idempotent by shipment).
    created_fields = 0
    created_line_items = 0
    for s in SHIPMENTS:
        num = s["shipment_number"]
        shipment_id = shipment_ids[num]
        already = sb.table("fields").select("id").eq("shipment_id", shipment_id).limit(1).execute().data
        if already:
            print(f"skipped: fields/line_items for {num} already exist")
            continue
        for doc_type in ("invoice", "packing_list", "bill_of_lading"):
            cache_path = s.get(f"cached_{doc_type}")
            if not cache_path or not Path(cache_path).is_file():
                continue
            doc_id = document_ids.get((num, doc_type))
            if doc_id is None:
                print(f"error: no document id for {num}/{doc_type}; skipping fields")
                continue
            data = json.loads(Path(cache_path).read_text(encoding="utf-8"))
            for f in data.get("fields", []):
                sb.table("fields").insert({
                    "shipment_id": shipment_id,
                    "document_id": doc_id,
                    "key": f["key"],
                    "value": f.get("value"),
                    "ai_value": f.get("ai_value"),
                    "confidence": f.get("confidence"),
                    "status": f.get("status", "extracted"),
                    "source_page": f.get("source_page", 1),
                }).execute()
                created_fields += 1
            for li in data.get("line_items", []):
                sb.table("line_items").insert({
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
                }).execute()
                created_line_items += 1
        print(f"created: fields+line_items for {num}")
    print(f"fields: {created_fields} created")
    print(f"line_items: {created_line_items} created")

    print("Seed load complete.")
    print(f"summary: users {created_users} created/{skipped_users} skipped, "
          f"suppliers {created_suppliers} created/{skipped_suppliers} skipped, "
          f"shipments {created_shipments} created/{skipped_shipments} skipped, "
          f"documents {created_documents} created/{skipped_documents} skipped")


def _get_user_id(sb, email):
    res = sb.auth.admin.list_users()
    for u in res or []:
        if u.email == email:
            return u.id
    return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--load", action="store_true", help="load into Supabase (service role)")
    args = parser.parse_args()
    manifest = generate()
    if args.load:
        load_into_supabase(manifest)
