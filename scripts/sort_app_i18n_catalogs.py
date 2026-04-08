#!/usr/bin/env python3
"""Rewrite every i18n/app_i18n_*.json with lexicographically sorted top-level keys.

CI (`test/i18n-catalog-files.test.js`) requires sorted keys. Use after hand-editing
JSON or when a script wrote `json.dumps(data)` without sorting.

Usage:
  python3 scripts/sort_app_i18n_catalogs.py
  python3 scripts/sort_app_i18n_catalogs.py --check   # exit 1 if any file would change (CI fast-fail)
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
I18N = ROOT / "i18n"


def main() -> None:
    ap = argparse.ArgumentParser(description="Sort top-level keys in i18n/app_i18n_*.json")
    ap.add_argument(
        "--check",
        action="store_true",
        help="Do not write; exit with status 1 if any catalog is not sorted",
    )
    args = ap.parse_args()

    n_changed = 0
    unsorted: list[str] = []
    for path in sorted(I18N.glob("app_i18n_*.json")):
        raw = path.read_text(encoding="utf-8")
        data: dict[str, str] = json.loads(raw)
        text = json.dumps(dict(sorted(data.items())), ensure_ascii=False, indent=2) + "\n"
        if raw != text:
            n_changed += 1
            unsorted.append(path.name)
            if args.check:
                continue
            path.write_text(text, encoding="utf-8")
            print(f"sorted keys → {path.name}", flush=True)
    if args.check:
        if unsorted:
            print(
                "i18n catalogs have unsorted top-level keys: "
                + ", ".join(unsorted)
                + "\nRun: pnpm run i18n:sort",
                file=sys.stderr,
                flush=True,
            )
            raise SystemExit(1)
        print("all app_i18n_*.json catalogs already sorted", flush=True)
        return
    if n_changed == 0:
        print("all app_i18n_*.json catalogs already sorted", flush=True)


if __name__ == "__main__":
    main()
