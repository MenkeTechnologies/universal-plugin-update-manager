#!/usr/bin/env python3
"""
Cross-check catalog key references against i18n/app_i18n_en.json.

Scans:
  - frontend/**/*.html
  - frontend/js/**/*.js
  - src-tauri/src/native_menu.rs, tray_menu.rs (t("key", …) / t(strings, "key", …))

Writes an HTML report: issue tables plus a full catalog table (every English key,
reference count, sample locations, value), and a summary of `node --test test/i18n*.test.js`.
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
PALETTE_JS_REL = "frontend/js/command-palette.js"
I18N_TEST_GLOB = "i18n*.test.js"
LOG_TAIL_CHARS = 48_000

# Mirrors `docs/index.html` + `frontend/index.html` tokens (cyber HUD, Orbitron headings, grid bg).
I18N_REPORT_CSS = """
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    ::selection {
      background: rgba(5, 217, 232, 0.3);
      color: #fff;
    }

    :root {
      --bg-primary: #05050a;
      --bg-secondary: #0a0a14;
      --bg-card: #0d0d1a;
      --bg-hover: #12122a;
      --accent: #ff2a6d;
      --accent-light: #ff6b9d;
      --accent-glow: rgba(255, 42, 109, 0.4);
      --cyan: #05d9e8;
      --cyan-glow: rgba(5, 217, 232, 0.4);
      --cyan-dim: rgba(5, 217, 232, 0.15);
      --magenta: #d300c5;
      --magenta-glow: rgba(211, 0, 197, 0.3);
      --green: #39ff14;
      --green-bg: rgba(57, 255, 20, 0.08);
      --red: #ff073a;
      --text: #e0f0ff;
      --text-dim: #7a8ba8;
      --text-muted: #3d4f6a;
      --border: #1a1a3e;
      --border-glow: #2a1a4e;
      --cyber-grid-line: rgba(5, 217, 232, 0.042);
      --cyber-grid-cross: rgba(5, 217, 232, 0.034);
    }

    [data-theme="light"] {
      --bg-primary: #f0f2f5;
      --bg-secondary: #e4e7ec;
      --bg-card: #ffffff;
      --bg-hover: #f7f8fa;
      --accent: #d6196e;
      --accent-light: #e84d8a;
      --accent-glow: rgba(214, 25, 110, 0.15);
      --cyan: #0891b2;
      --cyan-glow: rgba(8, 145, 178, 0.2);
      --cyan-dim: rgba(8, 145, 178, 0.08);
      --magenta: #a300a3;
      --magenta-glow: rgba(163, 0, 163, 0.15);
      --green: #15803d;
      --green-bg: rgba(21, 128, 61, 0.08);
      --red: #dc2626;
      --text: #1e293b;
      --text-dim: #475569;
      --text-muted: #94a3b8;
      --border: #cbd5e1;
      --border-glow: #a5b4c8;
      --cyber-grid-line: rgba(8, 145, 178, 0.08);
      --cyber-grid-cross: rgba(8, 145, 178, 0.055);
    }

    [data-theme="light"] .app::after {
      background: repeating-linear-gradient(
        0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.02) 2px, rgba(0, 0, 0, 0.02) 4px);
    }

    [data-theme="light"] .app::before {
      background: radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.12) 100%);
    }

    [data-theme="light"] .crt-scanline {
      background: linear-gradient(90deg,
        transparent 0%, rgba(0, 0, 0, 0.04) 20%, rgba(0, 0, 0, 0.08) 50%,
        rgba(0, 0, 0, 0.04) 80%, transparent 100%);
      box-shadow: 0 0 15px 5px rgba(0, 0, 0, 0.03);
    }

    [data-theme="light"] .crt-scanline-v {
      background: linear-gradient(180deg,
        transparent 0%, rgba(0, 0, 0, 0.03) 20%, rgba(0, 0, 0, 0.06) 50%,
        rgba(0, 0, 0, 0.03) 80%, transparent 100%);
      box-shadow: 0 0 15px 5px rgba(0, 0, 0, 0.02);
    }

    body {
      font-family: 'Share Tech Mono', 'SF Mono', 'Fira Code', monospace;
      background-color: var(--bg-primary);
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(5, 217, 232, 0.045) 0%, transparent 52%),
        radial-gradient(ellipse at 80% 20%, rgba(211, 0, 197, 0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 82%, rgba(255, 42, 109, 0.035) 0%, transparent 48%),
        linear-gradient(var(--cyber-grid-line) 1px, transparent 1px),
        linear-gradient(90deg, var(--cyber-grid-cross) 1px, transparent 1px);
      background-size: auto, auto, auto, 52px 52px, 52px 52px;
      background-attachment: fixed;
      color: var(--text);
      min-height: 100vh;
      line-height: 1.55;
    }

    [data-theme="light"] body {
      background-image:
        radial-gradient(ellipse at 22% 48%, rgba(8, 145, 178, 0.09) 0%, transparent 52%),
        radial-gradient(ellipse at 78% 22%, rgba(163, 0, 163, 0.07) 0%, transparent 50%),
        linear-gradient(var(--cyber-grid-line) 1px, transparent 1px),
        linear-gradient(90deg, var(--cyber-grid-cross) 1px, transparent 1px);
      background-size: auto, auto, 44px 44px, 44px 44px;
      background-attachment: fixed;
    }

    .app {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app::after {
      content: '';
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 2px,
        rgba(5, 217, 232, 0.015) 2px, rgba(5, 217, 232, 0.015) 4px);
      pointer-events: none;
      z-index: 9999;
    }

    .app::before {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.5) 100%);
      pointer-events: none;
      z-index: 9998;
    }

    .app.no-crt::after,
    .app.no-crt::before { display: none; }

    .crt-scanline {
      position: fixed;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%, rgba(5, 217, 232, 0.03) 20%, rgba(5, 217, 232, 0.08) 50%,
        rgba(5, 217, 232, 0.03) 80%, transparent 100%);
      box-shadow: 0 0 15px 5px rgba(5, 217, 232, 0.04);
      pointer-events: none;
      z-index: 9997;
      animation: hscan 12s linear infinite;
    }

    .crt-scanline-v {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg,
        transparent 0%, rgba(255, 42, 109, 0.03) 20%, rgba(255, 42, 109, 0.06) 50%,
        rgba(255, 42, 109, 0.03) 80%, transparent 100%);
      box-shadow: 0 0 15px 5px rgba(255, 42, 109, 0.03);
      pointer-events: none;
      z-index: 9997;
      animation: vscan 18s linear infinite;
    }

    @keyframes hscan {
      0% { top: -2px; opacity: 0; }
      5% { opacity: 1; }
      95% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }

    @keyframes vscan {
      0% { left: -2px; opacity: 0; }
      5% { opacity: 1; }
      95% { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }

    body.no-neon-glow * {
      animation-name: none !important;
      animation-duration: 0s !important;
    }

    body.no-neon-glow .doc-card {
      box-shadow: 0 0 20px var(--cyan-glow), 0 4px 24px rgba(0, 0, 0, 0.35);
    }

    [data-theme="light"] body.no-neon-glow .doc-card {
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    }

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(5, 5, 10, 0.5); }
    [data-theme="light"] ::-webkit-scrollbar-track { background: rgba(226, 232, 240, 0.8); }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--cyan) 0%, var(--magenta) 100%);
      border-radius: 4px;
      box-shadow: 0 0 8px var(--cyan-glow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, var(--accent) 0%, var(--cyan) 100%);
    }

    .docs-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(180deg, #070714 0%, #0d0d22 42%, var(--bg-secondary) 100%);
      position: relative;
      box-shadow:
        0 4px 28px rgba(0, 0, 0, 0.55),
        0 1px 0 rgba(5, 217, 232, 0.1),
        inset 0 1px 0 rgba(5, 217, 232, 0.06);
      z-index: 1;
    }

    [data-theme="light"] .docs-header {
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .docs-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--cyan), var(--accent), var(--cyan), transparent);
      opacity: 0.6;
    }

    .docs-header-inner {
      max-width: 92rem;
      margin: 0 auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .docs-title-block h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      background: linear-gradient(90deg, var(--cyan), #fff, var(--accent), var(--cyan));
      background-size: 300% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 8px var(--cyan-glow));
      animation: logo-shimmer 6s linear infinite;
      margin: 0 0 6px;
    }

    [data-theme="light"] .docs-title-block h1 {
      filter: drop-shadow(0 0 4px var(--cyan-glow));
    }

    @keyframes logo-shimmer {
      0% { background-position: 0% 0%; }
      100% { background-position: 300% 0%; }
    }

    .docs-sub {
      font-size: 11px;
      color: var(--text-dim);
      letter-spacing: 0.5px;
      max-width: 42rem;
    }

    .docs-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .docs-header-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      min-width: 0;
    }

    .hud-scheme-row {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      max-width: min(36rem, 92vw);
    }

    .hud-scheme-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-muted);
      text-align: right;
    }

    .scheme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 3px;
    }

    .scheme-btn {
      padding: 5px 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 2px;
      cursor: pointer;
      text-align: left;
      font-family: 'Share Tech Mono', monospace;
      transition: all 0.2s;
    }

    .scheme-btn:hover {
      border-color: var(--cyan);
      box-shadow: 0 0 10px var(--cyan-dim);
    }

    .scheme-btn.active {
      border-color: var(--cyan);
      border-left: 3px solid var(--cyan);
      box-shadow: 0 0 12px var(--cyan-glow);
    }

    .scheme-btn-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    .scheme-btn-desc {
      font-size: 10px;
      color: var(--text-muted);
    }

    .scheme-btn-preview {
      display: flex;
      gap: 4px;
      margin-top: 5px;
      flex-wrap: wrap;
    }

    .scheme-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    button, a.btn {
      font-family: 'Share Tech Mono', monospace;
    }

    a.btn {
      text-decoration: none;
    }

    .btn {
      padding: 8px 14px;
      border-radius: 2px;
      border: none;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, transparent 60%);
    }

    .btn-secondary {
      background: transparent;
      color: var(--cyan);
      border: 1px solid var(--cyan);
      box-shadow: 0 0 8px var(--cyan-dim);
    }

    .btn-secondary:hover {
      background: rgba(5, 217, 232, 0.08);
      box-shadow: 0 0 15px var(--cyan-glow);
      transform: translateY(-1px);
    }

    .btn-secondary:active { transform: translateY(1px) scale(0.98); }
    .btn-secondary.active {
      background: rgba(5, 217, 232, 0.12);
      box-shadow: 0 0 12px var(--cyan-glow);
    }

    [data-theme="light"] .btn-secondary:hover { background: rgba(8, 145, 178, 0.1); }

    .docs-main {
      position: relative;
      z-index: 1;
      flex: 1;
      max-width: 92rem;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem;
      width: 100%;
    }

    .doc-card {
      background-color: var(--bg-card);
      background-image: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 30%, transparent 50%);
      border: 1px solid var(--cyan);
      border-radius: 2px;
      padding: 1.25rem 1.35rem;
      margin: 1.25rem 0;
      position: relative;
      box-shadow: 0 0 40px var(--cyan-glow);
      backdrop-filter: blur(12px) saturate(1.4);
      -webkit-backdrop-filter: blur(12px) saturate(1.4);
    }

    .doc-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 10%;
      right: 10%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      pointer-events: none;
    }

    body:not(.no-neon-glow) .doc-card {
      animation: neon-border-glow 2.5s ease-in-out infinite;
    }

    @keyframes neon-border-glow {
      0%, 100% {
        box-shadow: 0 0 20px var(--cyan-glow), 0 0 4px var(--cyan-glow);
        border-color: var(--cyan);
      }
      50% {
        box-shadow: 0 0 40px var(--cyan-glow), 0 0 12px var(--magenta-glow);
        border-color: var(--accent);
      }
    }

    .doc-card h2 {
      font-family: 'Orbitron', sans-serif;
      font-size: 13px;
      color: var(--cyan);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0 0 0.75rem;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .doc-card > p, .doc-card > .meta { margin: 0 0 1rem; }

    .meta {
      color: var(--text-dim);
      font-size: 13px;
      margin-top: 8px;
    }

    .meta.warn { color: var(--accent-light); }

    .banner {
      padding: 12px 16px;
      border-radius: 2px;
      margin: 0 0 1rem;
      font-size: 13px;
      border: 1px solid var(--border);
    }

    .banner.ok {
      border-color: var(--green);
      background: var(--green-bg);
      color: var(--text);
    }

    .banner.bad {
      border-color: var(--red);
      background: rgba(255, 7, 58, 0.08);
      color: var(--text);
    }

    .table-wrap {
      overflow-x: auto;
      margin-top: 0.5rem;
      -webkit-overflow-scrolling: touch;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      min-width: 0;
    }

    table.catalog-all { min-width: 48rem; }

    th, td {
      border: 1px solid var(--border);
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: var(--bg-secondary);
      color: var(--cyan);
      font-family: 'Orbitron', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    td.val {
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 36rem;
      font-size: 12px;
      color: var(--text-dim);
    }

    td.locs {
      max-width: 22rem;
      word-break: break-all;
      color: var(--text-muted);
      font-size: 11px;
    }

    td.warn { color: var(--accent-light); font-weight: 600; }

    code {
      font-family: 'Share Tech Mono', ui-monospace, monospace;
      font-size: 0.88em;
      padding: 2px 6px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 2px;
      color: var(--text);
    }

    pre.testlog {
      font-size: 11px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 2px;
      padding: 12px;
      max-height: 28rem;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin-top: 8px;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.25);
      color: var(--text);
    }

    [data-theme="light"] pre.testlog {
      box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.04);
    }

    span.ok { color: var(--green); font-weight: 600; }
    span.bad { color: var(--red); font-weight: 600; }

    details {
      margin-top: 12px;
      color: var(--text-dim);
      font-size: 12px;
    }

    details summary {
      cursor: pointer;
      color: var(--cyan);
      font-weight: 600;
    }

    a {
      color: var(--cyan);
      text-decoration: none;
      transition: color 0.15s, text-shadow 0.15s;
    }

    a:hover {
      color: var(--accent-light);
      text-shadow: 0 0 8px var(--cyan-glow);
    }

    .crt-scanline[hidden],
    .crt-scanline-v[hidden] { display: none !important; }

    .doc-footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
    }
"""


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

# data-i18n, data-i18n-title, data-i18n-placeholder (allow hyphenated dataset attrs in HTML)
RE_HTML_I18N = re.compile(
    r"data-i18n(?:-(?:title|placeholder))?=(?:\"([^\"]+)\"|'([^']+)')",
    re.IGNORECASE,
)

# First string literal argument to these formatters (static keys only).
RE_JS_FMT = re.compile(
    r"\b(?:appFmt|catalogFmt|toastFmt|_audioFmt|_midiFmt|appTableCol|_ui)\s*\(\s*"
    r"(?:`([^`]+)`|'([^']+)'|\"([^\"]+)\")",
)

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


def record(refs: dict[str, list[tuple[str, int]]], key: str, path: Path, line_no: int) -> None:
    if not is_catalog_key(key):
        return
    rel = path.relative_to(ROOT)
    refs[key].append((str(rel), line_no))


def scan_file(path: Path, refs: dict[str, list[tuple[str, int]]]) -> None:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if path.suffix.lower() == ".html":
        for i, line in enumerate(lines, start=1):
            for m in RE_HTML_I18N.finditer(line):
                key = m.group(1) or m.group(2)
                if key:
                    record(refs, key, path, i)
        return

    if path.suffix.lower() == ".js":
        # Whole-file scan so `appFmt` / `catalogFmt` can be split across lines from `(` to the string.
        for m in RE_JS_FMT.finditer(text):
            key = m.group(1) or m.group(2) or m.group(3)
            if key:
                line_no = text.count("\n", 0, m.start()) + 1
                record(refs, key, path, line_no)
        return

    if path.name == "native_menu.rs":
        for i, line in enumerate(lines, start=1):
            for m in RE_RS_T.finditer(line):
                record(refs, m.group(1), path, i)
        return

    if path.name == "tray_menu.rs":
        for i, line in enumerate(lines, start=1):
            for m in RE_RS_TRAY_T.finditer(line):
                record(refs, m.group(1), path, i)
        return


def gather_refs() -> dict[str, list[tuple[str, int]]]:
    refs: dict[str, list[tuple[str, int]]] = defaultdict(list)

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


def write_html(
    out_path: Path,
    en: dict[str, str],
    missing: list[str],
    empty: list[str],
    refs: dict[str, list[tuple[str, int]]],
    locale_rows: list[dict[str, int | str]],
    identical_pairs: list[tuple[str, int]],
    i18n_tests_section: str,
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
        loc_str = "; ".join(f"{f}:{ln}" for f, ln in locs[:12])
        if len(locs) > 12:
            loc_str += f" … (+{len(locs) - 12} more)"
        rows_missing.append(
            f"<tr><td><code>{escape(key)}</code></td><td>{escape(loc_str)}</td></tr>"
        )

    rows_empty = []
    for key in empty:
        locs = refs.get(key, [])
        loc_str = "; ".join(f"{f}:{ln}" for f, ln in locs[:8])
        rows_empty.append(
            f"<tr><td><code>{escape(key)}</code></td><td>{escape(loc_str)}</td></tr>"
        )

    palette_keys = sorted(
        k
        for k, locs in refs.items()
        if any(loc[0] == PALETTE_JS_REL for loc in locs)
    )
    rows_palette: list[str] = []
    palette_missing_en: list[str] = []
    for key in palette_keys:
        if key not in en:
            palette_missing_en.append(key)
            rows_palette.append(
                f"<tr><td><code>{escape(key)}</code></td><td colspan=\"2\">"
                "<strong>missing from en.json</strong></td></tr>"
            )
            continue
        plocs = [loc for loc in refs[key] if loc[0] == PALETTE_JS_REL]
        loc_preview = "; ".join(f"{f}:{ln}" for f, ln in plocs[:3])
        if len(plocs) > 3:
            loc_preview += f" … (+{len(plocs) - 3})"
        val = "" if en[key] is None else str(en[key])
        rows_palette.append(
            "<tr>"
            f"<td><code>{escape(key)}</code></td>"
            f"<td><small>{escape(loc_preview)}</small></td>"
            f'<td class="val" title="{escape(val, quote=True)}">{escape(val)}</td>'
            "</tr>"
        )

    n_unref = 0
    rows_catalog: list[str] = []
    for key in sorted(en.keys()):
        locs = refs.get(key, [])
        n = len(locs)
        if n == 0:
            n_unref += 1
        loc_preview = "; ".join(f"{f}:{ln}" for f, ln in locs[:4])
        if n > 4:
            loc_preview += f" … (+{n - 4} more)"
        val = "" if en[key] is None else str(en[key])
        val_esc = escape(val)
        title_attr = escape(val, quote=True)
        rows_catalog.append(
            "<tr>"
            f"<td><code>{escape(key)}</code></td>"
            f"<td>{n}</td>"
            f"<td class=\"locs\"><small>{escape(loc_preview) if loc_preview else '—'}</small></td>"
            f'<td class="val" title="{title_attr}">{val_esc}</td>'
            "</tr>"
        )

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

    palette_warn = (
        "<p class=\"meta warn\"><strong>Palette references keys missing from en.json:</strong> "
        + escape(", ".join(palette_missing_en))
        + "</p>"
        if palette_missing_en
        else ""
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>app_i18n catalog audit — AUDIO_HAXOR</title>
  <style>{I18N_REPORT_CSS}</style>
</head>
<body>
  <div class="app" id="i18nReportApp">
    <div class="crt-scanline" id="crtH" aria-hidden="true"></div>
    <div class="crt-scanline-v" id="crtV" aria-hidden="true"></div>

    <header class="docs-header">
      <div class="docs-header-inner">
        <div class="docs-title-block">
          <h1>// app_i18n catalog audit</h1>
          <p class="docs-sub">AUDIO_HAXOR · same HUD tokens as <code>docs/index.html</code> · source of truth <code>i18n/app_i18n_en.json</code></p>
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
        <h2>Command palette — static catalog keys (<code>command-palette.js</code>)</h2>
        <p class="meta">{len(palette_keys)} keys referenced via <code>appFmt</code> / <code>catalogFmt</code> / <code>toastFmt</code> in the palette module (DB hit rows use file names, not these keys).</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Key</th><th>Locations in palette file</th><th>English value</th></tr></thead>
            <tbody>
            {''.join(rows_palette)}
            </tbody>
          </table>
        </div>
        {palette_warn}
      </div>

      <div class="doc-card">
        <h2>Full English catalog ({n_en} keys)</h2>
        <p class="meta">Reference count = static hits in scanned HTML/JS/Rust (hover value cell for full text).</p>
        <div class="table-wrap">
          <table class="catalog-all">
            <thead><tr><th>Key</th><th>Refs</th><th>Sample locations</th><th>English value</th></tr></thead>
            <tbody>
            {''.join(rows_catalog)}
            </tbody>
          </table>
        </div>
      </div>

      <p class="doc-footer">Generated by <code>scripts/i18n_catalog_audit.py</code>. Dynamic keys (computed at runtime) are not detected. Rust keys outside <code>native_menu.rs</code> / <code>tray_menu.rs</code> are not scanned.</p>
    </main>
  </div>
  <script>"""
    html = html + hud_js + """
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

    write_html(args.output, en, missing, empty, refs, locale_rows, identical_pairs, i18n_tests_section)

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
