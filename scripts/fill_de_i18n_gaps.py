#!/usr/bin/env python3
"""Fill German locale keys that still match English (i18n/app_i18n_de.json).

Skips ui.ph.ui_ph_* (i18n key indirection strings — same in every locale),
branding, and ui.opt.lang_en. Translates the rest via Google Translate with
post-fixes for placeholders and known product names.

Usage: .venv-i18n/bin/python scripts/fill_de_i18n_gaps.py
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[1]
I18N = ROOT / "i18n"


def main() -> None:
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print(
            "Install: python3 -m venv .venv-i18n && .venv-i18n/bin/pip install deep-translator",
            file=sys.stderr,
        )
        raise SystemExit(1) from None

    en_path = I18N / "app_i18n_en.json"
    de_path = I18N / "app_i18n_de.json"
    en: dict[str, str] = json.loads(en_path.read_text(encoding="utf-8"))
    de: dict[str, str] = json.loads(de_path.read_text(encoding="utf-8"))

    skip_prefix = "ui.ph.ui_ph_"
    skip_keys_exact = {
        "menu.app",
        "tray.tooltip",
        "ui.logo.app_name",
        "ui.page_title",
        "ui.st.audio_haxor",
        "ui.opt.lang_en",
    }
    # Branding / splash title variants (keep ASCII product styling)
    def keep_english(v: str) -> bool:
        if v.strip() in ("AUDIO_HAXOR", "AUDIO HAXOR"):
            return True
        return False

    translator = GoogleTranslator(source="en", target="de")
    ph_re = re.compile(r"\{[a-zA-Z_][a-zA-Z0-9_]*\}")

    to_fix = [
        k
        for k, v in en.items()
        if de.get(k) == v and k not in skip_keys_exact and not k.startswith(skip_prefix) and not keep_english(v)
    ]
    to_fix.sort()

    for i, k in enumerate(to_fix):
        v = en[k]
        try:
            t = translator.translate(v)
        except Exception:
            t = v
        en_ph = ph_re.findall(v)
        for p in en_ph:
            if p not in t:
                t = v
                break
        de[k] = t
        if (i + 1) % 50 == 0:
            print(f"{i + 1}/{len(to_fix)}", flush=True)
        time.sleep(0.08)

    # Conventional language name in selector (matches gen_app_i18n_de.py)
    if de.get("ui.opt.lang_en") == "Englisch":
        de["ui.opt.lang_en"] = "English"

    # Post-replace token casing from legacy gen script
    for k in list(de.keys()):
        if "{Name}" in de[k]:
            de[k] = de[k].replace("{Name}", "{name}")
        if "{Wert}" in de[k]:
            de[k] = de[k].replace("{Wert}", "{value}")

    de_path.write_text(
        json.dumps(de, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(to_fix)} keys in {de_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
