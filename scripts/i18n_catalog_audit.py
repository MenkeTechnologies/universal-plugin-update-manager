#!/usr/bin/env python3
"""
Cross-check catalog key references against i18n/app_i18n_en.json.

Scans:
  - frontend/**/*.html
  - frontend/js/**/*.js
  - src-tauri/src/native_menu.rs, tray_menu.rs (t("key", …) / t(strings, "key", …))

Writes an HTML report: issue tables, the English catalog as multiple tables grouped by
inferred UI surface (refs and locations scoped per surface; keys may repeat), and a
summary of `node --test test/i18n*.test.js`.
Exit 1 if any referenced key is missing or empty in English, or if any i18n Node test fails
(unless --skip-node-tests). Exit 0 when clean.

Usage:
  python3 scripts/i18n_catalog_audit.py
  python3 scripts/i18n_catalog_audit.py -o reports/i18n_catalog_audit.html
  python3 scripts/i18n_catalog_audit.py --skip-node-tests
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GITHUB_REPO_WEB = "https://github.com/MenkeTechnologies/Audio-Haxor"
GITHUB_ISSUES_WEB = f"{GITHUB_REPO_WEB}/issues"
EN_JSON = ROOT / "i18n" / "app_i18n_en.json"
I18N_DIR = ROOT / "i18n"
I18N_TEST_GLOB = "i18n*.test.js"
LOG_TAIL_CHARS = 48_000

HUD_STATIC_CSS_PATH = ROOT / "docs" / "hud-static.css"


def load_package_version(root: Path) -> str:
    p = root / "package.json"
    if not p.is_file():
        return ""
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return ""
    v = data.get("version")
    return str(v).strip() if v is not None else ""


def git_head_meta(root: Path) -> tuple[str, str, str]:
    """(short_sha, full_sha, iso_date). Missing git → ('unknown', 'unknown', '')."""
    try:
        full = subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        full = "unknown"
    short = full[:7] if len(full) >= 7 else full
    try:
        date = subprocess.check_output(
            ["git", "-C", str(root), "log", "-1", "--format=%cI"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        date = ""
    return short, full, date


def load_hud_static_css() -> str:
    if not HUD_STATIC_CSS_PATH.is_file():
        raise FileNotFoundError(f"Missing shared HUD stylesheet: {HUD_STATIC_CSS_PATH}")
    return HUD_STATIC_CSS_PATH.read_text(encoding="utf-8")


def parse_node_spec_summary(text: str) -> tuple[int | None, int | None, int | None, float | None]:
    """Parse Node's default spec reporter footer (tests / pass / fail / duration_ms)."""
    tests_n = pass_n = fail_n = None
    dur: float | None = None
    for line in text.splitlines():
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        if parts[-2] == "tests" and parts[-1].isdigit():
            tests_n = int(parts[-1])
        elif parts[-2] == "pass" and parts[-1].isdigit():
            pass_n = int(parts[-1])
        elif parts[-2] == "fail" and parts[-1].isdigit():
            fail_n = int(parts[-1])
        elif parts[-2] == "duration_ms":
            try:
                dur = float(parts[-1])
            except ValueError:
                pass
    return tests_n, pass_n, fail_n, dur


def run_i18n_node_tests(root: Path) -> tuple[list[dict[str, object]], str | None]:
    """
    Run each `test/i18n*.test.js` with `node --test <file>` from repo root.
    Returns (rows, skip_reason). skip_reason is set when the suite was not run.
    """
    node = shutil.which("node")
    if not node:
        return [], "node not found on PATH — install Node.js or use --skip-node-tests"
    test_dir = root / "test"
    files = sorted(test_dir.glob(I18N_TEST_GLOB))
    if not files:
        return [], f"no test/{I18N_TEST_GLOB} files"

    rows: list[dict[str, object]] = []
    for f in files:
        rel = str(f.relative_to(root))
        row: dict[str, object] = {
            "file": rel,
            "exit_code": -1,
            "tests": None,
            "pass": None,
            "fail": None,
            "duration_ms": None,
            "timeout": False,
            "error": None,
            "log_tail": "",
        }
        try:
            proc = subprocess.run(
                [node, "--test", str(f)],
                cwd=str(root),
                capture_output=True,
                text=True,
                timeout=600,
                env=os.environ.copy(),
            )
        except subprocess.TimeoutExpired as e:
            row["timeout"] = True
            row["error"] = "timeout (600s)"
            merged = ""
            if e.stdout:
                merged += e.stdout
            if e.stderr:
                merged += "\n" + e.stderr
            row["log_tail"] = merged[-LOG_TAIL_CHARS:] if merged else ""
            rows.append(row)
            continue
        except OSError as e:
            row["error"] = str(e)
            rows.append(row)
            continue

        row["exit_code"] = proc.returncode
        merged = (proc.stdout or "") + ("\n" + proc.stderr if proc.stderr else "")
        tests_n, pass_n, fail_n, dur = parse_node_spec_summary(merged)
        row["tests"] = tests_n
        row["pass"] = pass_n
        row["fail"] = fail_n
        row["duration_ms"] = dur
        row["log_tail"] = merged[-LOG_TAIL_CHARS:] if merged else ""
        rows.append(row)

    return rows, None


def format_i18n_tests_html(rows: list[dict[str, object]], skip_reason: str | None) -> tuple[str, bool]:
    """Build HTML fragment for the Node i18n test section. Returns (html, suite_ok)."""
    if skip_reason:
        esc = escape(skip_reason)
        return (
            f"""  <h2>Node.js i18n tests (<code>test/{escape(I18N_TEST_GLOB)}</code>)</h2>
  <p class="meta"><strong>Skipped:</strong> {esc}</p>
""",
            True,
        )

    total_tests = sum(int(r["tests"] or 0) for r in rows)
    total_pass = sum(int(r["pass"] or 0) for r in rows)
    total_fail = sum(int(r["fail"] or 0) for r in rows)

    def row_ok(r: dict[str, object]) -> bool:
        if r.get("timeout") or r.get("error"):
            return False
        ec = int(r.get("exit_code", -1))
        fn = r.get("fail")
        fail_n = int(fn) if fn is not None else 0
        return ec == 0 and fail_n == 0

    suite_ok = all(row_ok(r) for r in rows)

    trs: list[str] = []
    for r in rows:
        fn = escape(str(r["file"]))
        ec = int(r["exit_code"])
        t = r["tests"]
        p = r["pass"]
        f = r["fail"]
        d = r["duration_ms"]
        t_s = "—" if t is None else str(int(t))
        p_s = "—" if p is None else str(int(p))
        f_s = "—" if f is None else str(int(f))
        d_s = "—" if d is None else f"{float(d):.1f}"
        ok = row_ok(r)
        st = "ok" if ok else "bad"
        note = ""
        if r.get("timeout"):
            note = ' <small style="color:#f88">timeout</small>'
        elif r.get("error"):
            note = f' <small style="color:#f88">{escape(str(r["error"]))}</small>'
        elif ec != 0 and (f is None or int(f) == 0):
            note = ' <small style="color:#f88">non-zero exit</small>'
        trs.append(
            "<tr>"
            f"<td><code>{fn}</code></td>"
            f"<td>{t_s}</td><td>{p_s}</td><td>{f_s}</td>"
            f"<td>{d_s}</td>"
            f"<td><span class=\"{st}\">{'OK' if ok else 'FAIL'}</span>{note}</td>"
            "</tr>"
        )

    details_blocks: list[str] = []
    for r in rows:
        if row_ok(r):
            continue
        tail = str(r.get("log_tail") or "")
        if not tail.strip():
            continue
        fn = escape(str(r["file"]))
        details_blocks.append(
            f"<details><summary><code>{fn}</code> — output (tail)</summary>"
            f"<pre class=\"testlog\">{escape(tail)}</pre></details>"
        )

    summary_cls = "ok" if suite_ok else "bad"
    summary_txt = (
        f"All {len(rows)} i18n test file(s) passed ({total_pass}/{total_tests} tests, {total_fail} failed)."
        if suite_ok
        else f"One or more i18n test files failed ({total_pass}/{total_tests} tests passed, {total_fail} failed)."
    )

    meta_line = (
        f"Each row is <code>node --test &lt;file&gt;</code> from the repo root (same as CI). "
        f"Totals: <strong>{total_pass}</strong> passed of <strong>{total_tests}</strong> tests; "
        f"<strong>{total_fail}</strong> failed."
    )
    frag = f"""  <h2>Node.js i18n tests (<code>test/{escape(I18N_TEST_GLOB)}</code>)</h2>
  <p class="meta">{meta_line}</p>
  <div class="banner {summary_cls}">{escape(summary_txt)}</div>
  <table>
    <thead><tr><th>File</th><th>Tests</th><th>Pass</th><th>Fail</th><th>ms</th><th>Status</th></tr></thead>
    <tbody>
    {''.join(trs)}
    </tbody>
  </table>
{"".join(details_blocks)}
"""
    return frag, suite_ok


def _app_i18n_stem_to_locale(stem: str) -> str:
    """Map `app_i18n_*.json` stem to UI locale (matches `ipc.js` / SQLite seed codes)."""
    if stem == "en":
        return "en"
    parts = stem.split("_")
    if len(parts) == 1:
        return parts[0]
    if parts[0] == "es" and parts[1] == "419":
        return "es-419"
    return f"{parts[0]}-{parts[1].upper()}"


def gather_locale_file_stats(en_keys: set[str]) -> list[dict[str, int | str]]:
    """One row per `i18n/app_i18n_*.json`: key counts vs English catalog."""
    rows: list[dict[str, int | str]] = []
    n_en = len(en_keys)
    for path in sorted(I18N_DIR.glob("app_i18n_*.json")):
        stem = path.stem
        if not stem.startswith("app_i18n_"):
            continue
        short = stem[len("app_i18n_") :]
        loc = _app_i18n_stem_to_locale(short)
        data: dict[str, object] = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        loc_keys = {k for k in data if isinstance(k, str)}
        missing_vs_en = len(en_keys - loc_keys)
        extra_vs_en = len(loc_keys - en_keys)
        rows.append(
            {
                "locale": loc,
                "file": path.name,
                "keys": len(loc_keys),
                "en_keys": n_en,
                "missing_vs_en": missing_vs_en,
                "extra_vs_en": extra_vs_en,
            }
        )

    def sort_key(r: dict[str, int | str]) -> tuple[int, str]:
        loc = str(r["locale"])
        return (0 if loc == "en" else 1, loc)

    rows.sort(key=sort_key)
    return rows


def gather_locale_identical_to_en(en: dict[str, str]) -> list[tuple[str, int]]:
    """
    For each shipped locale except `en`, count catalog keys whose value string exactly
    matches English (translation still a stub). Sorted by (count asc, locale asc).
    """
    rows: list[tuple[str, int]] = []
    for path in sorted(I18N_DIR.glob("app_i18n_*.json")):
        stem = path.stem
        if not stem.startswith("app_i18n_"):
            continue
        short = stem[len("app_i18n_") :]
        loc = _app_i18n_stem_to_locale(short)
        if loc == "en":
            continue
        data: dict[str, object] = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        identical = 0
        for k, v_en in en.items():
            if k not in data:
                continue
            v_loc = data[k]
            if not isinstance(v_loc, str):
                continue
            en_s = "" if v_en is None else str(v_en)
            if v_loc == en_s:
                identical += 1
        rows.append((loc, identical))
    rows.sort(key=lambda t: (t[1], t[0]))
    return rows


PREFIXES = ("menu.", "tray.", "confirm.", "toast.", "help.", "ui.")

# HTML: attribute distinguishes visible text vs tooltip vs placeholder.
RE_HTML_VISIBLE = re.compile(r"data-i18n=(?:\"([^\"]+)\"|'([^']+)')", re.IGNORECASE)
RE_HTML_TITLE = re.compile(r"data-i18n-title=(?:\"([^\"]+)\"|'([^']+)')", re.IGNORECASE)
RE_HTML_PLACEHOLDER = re.compile(
    r"data-i18n-placeholder=(?:\"([^\"]+)\"|'([^']+)')", re.IGNORECASE
)

# First string literal argument to these formatters (static keys only).
RE_JS_FMT = re.compile(
    r"\b(appFmt|catalogFmt|toastFmt|_audioFmt|_midiFmt|appTableCol|_ui)\s*\(\s*"
    r"(?:`([^`]+)`|'([^']+)'|\"([^\"]+)\")",
)

JS_FILE_SURFACE: dict[str, str] = {
    "context-menu.js": "Context menu",
    "command-palette.js": "Command palette",
    "settings.js": "Settings",
    "settings-search.js": "Settings",
    "help-overlay.js": "Help overlay",
    "tray-popover.js": "Tray popover",
    "tooltip-hover.js": "Tooltip (hover JS)",
}

SURFACE_RANK: dict[str, int] = {
    "HTML (visible text)": 10,
    "HTML (tooltip title)": 20,
    "HTML (placeholder)": 30,
    "Native menu": 40,
    "Tray menu": 50,
    "Context menu": 60,
    "Command palette": 70,
    "Settings": 80,
    "Help overlay": 90,
    "Tray popover": 100,
    "Tooltip (hover JS)": 110,
    "Toast": 120,
    "Table column (JS)": 130,
}


def surface_sort_key(label: str) -> tuple[int, str]:
    return (SURFACE_RANK.get(label, 1_000), label)


def js_surface(path: Path, formatter: str) -> str:
    if formatter == "toastFmt":
        return "Toast"
    if formatter == "appTableCol":
        return "Table column (JS)"
    name = path.name
    if name in JS_FILE_SURFACE:
        return JS_FILE_SURFACE[name]
    if formatter in ("_audioFmt", "_midiFmt", "_ui"):
        return f"JavaScript ({formatter} · {name})"
    return f"JavaScript ({name})"

# native_menu.rs:  t("menu.foo", "fallback")
RE_RS_T = re.compile(r"\bt\(\s*\"((?:menu|tray|confirm|toast|help|ui)\.[^\"]+)\"\s*,")

# tray_menu.rs: t(strings, "tray.foo", "fallback")
RE_RS_TRAY_T = re.compile(
    r"\bt\(\s*strings\s*,\s*\"((?:menu|tray|confirm|toast|help|ui)\.[^\"]+)\"\s*,",
)


def is_catalog_key(key: str) -> bool:
    key = key.strip()
    if not key or "\n" in key:
        return False
    return any(key.startswith(p) for p in PREFIXES)


RefEntry = tuple[str, int, str]


def record(
    refs: dict[str, list[RefEntry]], key: str, path: Path, line_no: int, surface: str
) -> None:
    if not is_catalog_key(key):
        return
    rel = path.relative_to(ROOT)
    refs[key].append((str(rel), line_no, surface))


def scan_file(path: Path, refs: dict[str, list[RefEntry]]) -> None:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if path.suffix.lower() == ".html":
        for i, line in enumerate(lines, start=1):
            for m in RE_HTML_VISIBLE.finditer(line):
                key = m.group(1) or m.group(2)
                if key:
                    record(refs, key, path, i, "HTML (visible text)")
            for m in RE_HTML_TITLE.finditer(line):
                key = m.group(1) or m.group(2)
                if key:
                    record(refs, key, path, i, "HTML (tooltip title)")
            for m in RE_HTML_PLACEHOLDER.finditer(line):
                key = m.group(1) or m.group(2)
                if key:
                    record(refs, key, path, i, "HTML (placeholder)")
        return

    if path.suffix.lower() == ".js":
        # Whole-file scan so `appFmt` / `catalogFmt` can be split across lines from `(` to the string.
        for m in RE_JS_FMT.finditer(text):
            fmt = m.group(1) or ""
            key = m.group(2) or m.group(3) or m.group(4)
            if key:
                line_no = text.count("\n", 0, m.start()) + 1
                record(refs, key, path, line_no, js_surface(path, fmt))
        return

    if path.name == "native_menu.rs":
        for i, line in enumerate(lines, start=1):
            for m in RE_RS_T.finditer(line):
                record(refs, m.group(1), path, i, "Native menu")
        return

    if path.name == "tray_menu.rs":
        for i, line in enumerate(lines, start=1):
            for m in RE_RS_TRAY_T.finditer(line):
                record(refs, m.group(1), path, i, "Tray menu")
        return


def gather_refs() -> dict[str, list[RefEntry]]:
    refs: dict[str, list[RefEntry]] = defaultdict(list)

    for html in sorted((ROOT / "frontend").rglob("*.html")):
        scan_file(html, refs)

    js_root = ROOT / "frontend" / "js"
    if js_root.is_dir():
        for js in sorted(js_root.rglob("*.js")):
            scan_file(js, refs)

    for rs_name in ("native_menu.rs", "tray_menu.rs"):
        p = ROOT / "src-tauri" / "src" / rs_name
        if p.is_file():
            scan_file(p, refs)

    return refs


def format_build_banner_parts(
    app_version: str, git_full: str, git_short: str, git_date: str
) -> str:
    """Version: / Commit: (full SHA when available) / Commit date: — HTML-escaped, joined by ·."""
    parts: list[str] = []
    if app_version:
        parts.append(f"Version: v{escape(app_version)}")
    if git_full and git_full != "unknown":
        parts.append(f"Commit: {escape(git_full)}")
    elif git_short and git_short != "unknown":
        parts.append(f"Commit: {escape(git_short)}")
    if git_date and len(git_date) >= 10:
        parts.append(f"Commit date: {escape(git_date[:10])}")
    return " · ".join(parts)


def write_html(
    out_path: Path,
    en: dict[str, str],
    missing: list[str],
    empty: list[str],
    refs: dict[str, list[RefEntry]],
    locale_rows: list[dict[str, int | str]],
    identical_pairs: list[tuple[str, int]],
    i18n_tests_section: str,
    app_version: str,
    git_short: str,
    git_full: str,
    git_date: str,
) -> None:
    hud_js_path = ROOT / "docs" / "hud-theme.js"
    if not hud_js_path.is_file():
        raise FileNotFoundError(f"Missing HUD theme script: {hud_js_path}")
    hud_js = hud_js_path.read_text(encoding="utf-8")

    n_en = len(en)
    n_distinct_refs = len(refs)
    clean = not missing and not empty

    rows_missing = []
    for key in missing:
        locs = refs.get(key, [])
        loc_str = "; ".join(f"{f}:{ln}" for f, ln, _ in locs[:12])
        if len(locs) > 12:
            loc_str += f" … (+{len(locs) - 12} more)"
        rows_missing.append(
            f"<tr><td><code>{escape(key)}</code></td><td>{escape(loc_str)}</td></tr>"
        )

    rows_empty = []
    for key in empty:
        locs = refs.get(key, [])
        loc_str = "; ".join(f"{f}:{ln}" for f, ln, _ in locs[:8])
        rows_empty.append(
            f"<tr><td><code>{escape(key)}</code></td><td>{escape(loc_str)}</td></tr>"
        )

    all_surfaces = sorted(
        {loc[2] for locs in refs.values() for loc in locs},
        key=surface_sort_key,
    )

    catalog_by_type_parts: list[str] = []
    for surf in all_surfaces:
        rows_surf: list[str] = []
        for key in sorted(en.keys()):
            locs = refs.get(key, [])
            locs_here = [loc for loc in locs if loc[2] == surf]
            if not locs_here:
                continue
            n = len(locs_here)
            loc_preview = "; ".join(f"{f}:{ln}" for f, ln, _ in locs_here[:4])
            if n > 4:
                loc_preview += f" … (+{n - 4} more)"
            other = sorted({loc[2] for loc in locs if loc[2] != surf}, key=surface_sort_key)
            other_cell = (
                "<small>" + escape("; ".join(other)) + "</small>" if other else "—"
            )
            val = "" if en[key] is None else str(en[key])
            val_esc = escape(val)
            title_attr = escape(val, quote=True)
            rows_surf.append(
                "<tr>"
                f"<td><code>{escape(key)}</code></td>"
                f"<td>{n}</td>"
                f"<td class=\"locs\"><small>{escape(loc_preview)}</small></td>"
                f"<td class=\"surfaces\">{other_cell}</td>"
                f'<td class="val" title="{title_attr}">{val_esc}</td>'
                "</tr>"
            )
        if not rows_surf:
            continue
        catalog_by_type_parts.append(
            f"<h3>{escape(surf)} <span class=\"meta\">({len(rows_surf)} keys)</span></h3>"
            "<div class=\"table-wrap\">"
            "<table class=\"catalog-all\">"
            "<thead><tr><th>Key</th><th>Refs</th><th>Sample locations</th>"
            "<th>Other UI types</th><th>English value</th></tr></thead>"
            "<tbody>"
            f"{''.join(rows_surf)}"
            "</tbody></table></div>"
        )

    unref_keys = [k for k in sorted(en.keys()) if not refs.get(k)]
    n_unref = len(unref_keys)
    rows_unref: list[str] = []
    for key in unref_keys:
        val = "" if en[key] is None else str(en[key])
        val_esc = escape(val)
        title_attr = escape(val, quote=True)
        rows_unref.append(
            "<tr>"
            f"<td><code>{escape(key)}</code></td>"
            "<td>0</td>"
            "<td class=\"locs\"><small>—</small></td>"
            "<td class=\"surfaces\">—</td>"
            f'<td class="val" title="{title_attr}">{val_esc}</td>'
            "</tr>"
        )
    if rows_unref:
        catalog_by_type_parts.append(
            f"<h3>Not referenced by scan <span class=\"meta\">({n_unref} keys)</span></h3>"
            "<div class=\"table-wrap\">"
            "<table class=\"catalog-all\">"
            "<thead><tr><th>Key</th><th>Refs</th><th>Sample locations</th>"
            "<th>Other UI types</th><th>English value</th></tr></thead>"
            "<tbody>"
            f"{''.join(rows_unref)}"
            "</tbody></table></div>"
        )

    catalog_by_type_html = "\n".join(catalog_by_type_parts)

    status_cls = "ok" if clean else "bad"
    status_txt = (
        "All referenced keys exist in app_i18n_en.json with non-empty values."
        if clean
        else "Issues found — see tables below."
    )

    rows_locales: list[str] = []
    for r in locale_rows:
        loc = escape(str(r["locale"]))
        fn = escape(str(r["file"]))
        k = int(r["keys"])
        ek = int(r["en_keys"])
        mv = int(r["missing_vs_en"])
        xv = int(r["extra_vs_en"])
        bad = ' class="warn"' if (mv or xv) else ""
        rows_locales.append(
            "<tr>"
            f"<td><code>{loc}</code></td>"
            f"<td><code>{fn}</code></td>"
            f"<td>{k}</td>"
            f"<td>{ek}</td>"
            f"<td{bad}>{mv}</td>"
            f"<td{bad}>{xv}</td>"
            "</tr>"
        )

    groups_ident: list[tuple[int, list[str]]] = []
    for loc, cnt in identical_pairs:
        if groups_ident and groups_ident[-1][0] == cnt:
            groups_ident[-1][1].append(loc)
        else:
            groups_ident.append((cnt, [loc]))
    rows_identical: list[str] = []
    for cnt, locs in groups_ident:
        loc_cell = escape(", ".join(locs))
        pct = (100.0 * cnt / n_en) if n_en else 0.0
        rows_identical.append(
            "<tr>"
            f"<td><code>{loc_cell}</code></td>"
            f"<td>{cnt}</td>"
            f"<td>{pct:.1f}%</td>"
            "</tr>"
        )
    identical_table_body = (
        "".join(rows_identical)
        if rows_identical
        else '<tr><td colspan="3">— no locale files —</td></tr>'
    )

    banner = format_build_banner_parts(app_version, git_full, git_short, git_date)
    rep_title = "app_i18n catalog audit — AUDIO_HAXOR"
    if banner:
        rep_title += " · " + banner

    audit_sub = banner if banner else "build unknown"

    build_obj = {
        "version": app_version,
        "gitShaShort": git_short,
        "gitShaFull": git_full,
        "gitCommitDate": git_date,
    }
    build_prelude = "window.__AUDIO_HAXOR_BUILD__=" + json.dumps(
        build_obj, separators=(",", ":")
    ) + ";"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="dark light"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&amp;family=Share+Tech+Mono&amp;display=swap"/>
  <title>{rep_title}</title>
  <style>{load_hud_static_css()}</style>
</head>
<body>
  <div class="app" id="i18nReportApp">
    <div class="crt-scanline" id="crtH" aria-hidden="true"></div>
    <div class="crt-scanline-v" id="crtV" aria-hidden="true"></div>

    <header class="docs-header">
      <div class="docs-header-inner">
        <div class="docs-title-block">
          <h1>// app_i18n catalog audit</h1>
          <p class="docs-sub">{audit_sub} · same HUD tokens as <code>docs/index.html</code> · source of truth <code>i18n/app_i18n_en.json</code></p>
        </div>
        <div class="docs-header-actions">
          <div class="docs-toolbar">
            <button type="button" class="btn btn-secondary" id="btnTheme" title="Toggle light/dark">Theme</button>
            <button type="button" class="btn btn-secondary active" id="btnCrt" title="CRT scanline overlay">CRT</button>
            <button type="button" class="btn btn-secondary active" id="btnNeon" title="Neon border pulse on cards">Neon</button>
            <a class="btn btn-secondary" href="{GITHUB_REPO_WEB}" target="_blank" rel="noopener noreferrer" title="AUDIO_HAXOR on GitHub">GitHub</a>
            <a class="btn btn-secondary" href="{GITHUB_ISSUES_WEB}" target="_blank" rel="noopener noreferrer" title="GitHub Issues">Issues</a>
          </div>
          <div class="hud-scheme-row">
            <span class="hud-scheme-label">Color scheme</span>
            <div class="scheme-grid" id="hudSchemeGrid"></div>
          </div>
        </div>
      </div>
    </header>

    <main class="docs-main">
      <div class="doc-card">
        <h2>Summary</h2>
        <p class="meta">Source of truth: <code>i18n/app_i18n_en.json</code> — <strong>{n_en}</strong> keys; <strong>{n_distinct_refs}</strong> referenced by this scan; <strong>{n_unref}</strong> never referenced by scan; <strong>{len(missing)}</strong> missing; <strong>{len(empty)}</strong> empty (referenced keys with blank English value).</p>
        <div class="banner {status_cls}">{escape(status_txt)}</div>
      </div>

      <div class="doc-card">
        <h2>Supported locales (shipped <code>i18n/app_i18n_*.json</code>)</h2>
        <p class="meta">{len(locale_rows)} file(s). <strong>Keys</strong> = entries in that JSON; <strong>EN keys</strong> = English catalog size ({n_en}); <strong>Missing</strong> = English keys absent from locale file; <strong>Extra</strong> = keys in locale file not in English (should be 0).</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Locale</th><th>File</th><th>Keys</th><th>EN keys</th><th>Missing</th><th>Extra</th></tr></thead>
            <tbody>
            {''.join(rows_locales)}
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-card">
        <h2>Translation debt — values still identical to English</h2>
        <p class="meta">Per locale (excluding <code>en</code>): number of keys whose value exactly matches <code>app_i18n_en.json</code>. Lower is better. Percent = keys still English / <strong>{n_en}</strong> English keys. Locales sharing the same count are shown in one row.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Locale</th><th>Keys == EN</th><th>% of {n_en}</th></tr></thead>
            <tbody>
            {identical_table_body}
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-card">
{i18n_tests_section}
      </div>

      <div class="doc-card">
        <h2>Missing keys (referenced but not in English JSON)</h2>
        <p class="meta">{len(missing)} row(s)</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Key</th><th>Locations (file:line)</th></tr></thead>
            <tbody>
            {''.join(rows_missing) if rows_missing else '<tr><td colspan="2">— none —</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-card">
        <h2>Empty values in English JSON (key exists, value blank)</h2>
        <p class="meta">{len(empty)} row(s)</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Key</th><th>Sample references</th></tr></thead>
            <tbody>
            {''.join(rows_empty) if rows_empty else '<tr><td colspan="2">— none —</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-card">
        <h2>Full English catalog ({n_en} keys)</h2>
        <p class="meta"><strong>{n_en}</strong> keys in <code>app_i18n_en.json</code>, grouped by inferred UI surface. <strong>Refs</strong> and <strong>Sample locations</strong> count only hits for that surface; the same key may appear in several tables. <strong>Other UI types</strong> lists remaining surfaces for that key (or —). Keys with no scan hits are under <em>Not referenced by scan</em>. Hover the English value for the full string.</p>
        {catalog_by_type_html}
      </div>

      <p class="doc-footer">Generated by <code>scripts/i18n_catalog_audit.py</code>. Dynamic keys (computed at runtime) are not detected. Rust keys outside <code>native_menu.rs</code> / <code>tray_menu.rs</code> are not scanned.</p>
    </main>
  </div>
  <script>"""
    html = html + build_prelude + "\n" + hud_js + """
</script>
</body>
</html>
"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Audit app_i18n key references vs English JSON.")
    ap.add_argument(
        "-o",
        "--output",
        type=Path,
        default=ROOT / "reports" / "i18n_catalog_audit.html",
        help="HTML report output path",
    )
    ap.add_argument(
        "--skip-node-tests",
        action="store_true",
        help="Do not run `node --test` on test/i18n*.test.js (HTML will note the skip).",
    )
    args = ap.parse_args()
    out_path = Path(args.output)
    if not out_path.is_absolute():
        out_path = (ROOT / out_path).resolve()
    args.output = out_path

    en: dict[str, str] = json.loads(EN_JSON.read_text(encoding="utf-8"))
    en_keys = set(en.keys())
    locale_rows = gather_locale_file_stats(en_keys)
    identical_pairs = gather_locale_identical_to_en(en)
    refs = gather_refs()

    missing: list[str] = []
    empty: list[str] = []
    for key in sorted(refs.keys()):
        if key not in en:
            missing.append(key)
        elif en[key] is None or str(en[key]).strip() == "":
            empty.append(key)

    if args.skip_node_tests:
        test_rows: list[dict[str, object]] = []
        test_skip = "Skipped via --skip-node-tests"
    else:
        test_rows, test_skip = run_i18n_node_tests(ROOT)
    i18n_tests_section, node_tests_ok = format_i18n_tests_html(test_rows, test_skip)

    app_version = load_package_version(ROOT)
    git_short, git_full, git_date = git_head_meta(ROOT)
    write_html(
        args.output,
        en,
        missing,
        empty,
        refs,
        locale_rows,
        identical_pairs,
        i18n_tests_section,
        app_version,
        git_short,
        git_full,
        git_date,
    )

    print(f"Wrote {args.output.relative_to(ROOT)}")
    print(f"  Referenced keys (distinct): {len(refs)}")
    print(f"  English keys never referenced by scan: {sum(1 for k in en if not refs.get(k))}")
    print(f"  Missing in en.json: {len(missing)}")
    print(f"  Empty values in en.json: {len(empty)}")
    if args.skip_node_tests:
        print("  Node i18n tests: skipped (--skip-node-tests)")
    elif test_skip:
        print(f"  Node i18n tests: not run ({test_skip})")
    else:
        n_files = len(test_rows)
        status = "OK" if node_tests_ok else "FAIL"
        tot_t = sum(int(r.get("tests") or 0) for r in test_rows)
        tot_p = sum(int(r.get("pass") or 0) for r in test_rows)
        tot_f = sum(int(r.get("fail") or 0) for r in test_rows)
        print(f"  Node i18n tests: {status} ({n_files} files, {tot_p}/{tot_t} pass, {tot_f} fail)")

    if missing:
        print("\nMissing keys:", file=sys.stderr)
        for k in missing[:40]:
            print(f"  {k}", file=sys.stderr)
        if len(missing) > 40:
            print(f"  … and {len(missing) - 40} more (see HTML report)", file=sys.stderr)

    if test_skip and "not found on PATH" in test_skip:
        print(f"Warning: {test_skip}", file=sys.stderr)

    catalog_bad = bool(missing or empty)
    tests_bad = (not args.skip_node_tests) and (test_skip is None) and (not node_tests_ok)
    return 1 if (catalog_bad or tests_bad) else 0


if __name__ == "__main__":
    raise SystemExit(main())
