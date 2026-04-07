#!/usr/bin/env python3
"""Copy specific key *values* from `app_i18n_en.json` into every other locale file.

`sync_locale_keys_from_en.py` only adds **missing** keys. When English copy for an
existing key changes, other locales keep the old string until re-translated or
stubbed again — use this script to align them to the current English text.

Usage:
  python3 scripts/sync_i18n_values_from_en.py ui.sd.app_log_verbosity_desc
  python3 scripts/sync_i18n_values_from_en.py key1 key2
"""
from __future__ import annotations

import json
import pathlib
import sys


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: sync_i18n_values_from_en.py <key> [key ...]", file=sys.stderr)
        sys.exit(2)
    keys = sys.argv[1:]
    root = pathlib.Path(__file__).resolve().parents[1]
    i18n = root / "i18n"
    en_path = i18n / "app_i18n_en.json"
    en: dict[str, str] = json.loads(en_path.read_text(encoding="utf-8"))
    for k in keys:
        if k not in en:
            print(f"error: key not in English catalog: {k}", file=sys.stderr)
            sys.exit(1)
    for path in sorted(i18n.glob("app_i18n_*.json")):
        if path.name == "app_i18n_en.json":
            continue
        cur: dict[str, str] = json.loads(path.read_text(encoding="utf-8"))
        n = 0
        for k in keys:
            if k in cur and cur[k] != en[k]:
                cur[k] = en[k]
                n += 1
        if n > 0:
            path.write_text(
                json.dumps(dict(sorted(cur.items())), ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        print(f"{path.name}: updated {n} key(s)", flush=True)


if __name__ == "__main__":
    main()
