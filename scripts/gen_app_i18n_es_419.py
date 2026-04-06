#!/usr/bin/env python3
"""Build i18n/app_i18n_es_419.json from app_i18n_en.json (Latin American Spanish UI).

Requires: pip install deep-translator (use a venv, e.g. .venv-i18n).

Uses the same Google Translate target as `gen_app_i18n_es.py` (`es`); the shipped
catalog is a distinct locale row (`es-419` in SQLite, BCP 47) so prefs can follow
regional Spanish conventions. Re-run when `app_i18n_en.json` grows.

Usage:
  .venv-i18n/bin/python scripts/gen_app_i18n_es_419.py
"""
from __future__ import annotations

import json
import pathlib
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[1]
I18N_DIR = ROOT / "i18n"

# Native endonyms for the language selector (same set as `gen_app_i18n_hi.py` LANG_SELECTOR_NATIVE).
LANG_SELECTOR_NATIVE = {
    "ui.opt.lang_cs": "Čeština",
    "ui.opt.lang_da": "Dansk",
    "ui.opt.lang_de": "Deutsch",
    "ui.opt.lang_el": "Ελληνικά",
    "ui.opt.lang_en": "English",
    "ui.opt.lang_es": "Español",
    "ui.opt.lang_es_419": "Español (Latinoamérica)",
    "ui.opt.lang_fi": "Suomi",
    "ui.opt.lang_fr": "Français",
    "ui.opt.lang_hi": "हिन्दी",
    "ui.opt.lang_hu": "Magyar",
    "ui.opt.lang_id": "Bahasa Indonesia",
    "ui.opt.lang_it": "Italiano",
    "ui.opt.lang_ja": "日本語",
    "ui.opt.lang_ko": "한국어",
    "ui.opt.lang_nb": "Norsk (bokmål)",
    "ui.opt.lang_nl": "Nederlands",
    "ui.opt.lang_pl": "Polski",
    "ui.opt.lang_pt": "Português",
    "ui.opt.lang_pt_br": "Português (Brasil)",
    "ui.opt.lang_ro": "Română",
    "ui.opt.lang_ru": "Русский",
    "ui.opt.lang_sv": "Svenska",
    "ui.opt.lang_tr": "Türkçe",
    "ui.opt.lang_uk": "Українська",
    "ui.opt.lang_vi": "Tiếng Việt",
    "ui.opt.lang_zh": "简体中文",
}


def main() -> None:
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print(
            "Install deep-translator in a venv: python3 -m venv .venv-i18n && "
            ".venv-i18n/bin/pip install deep-translator && "
            ".venv-i18n/bin/python scripts/gen_app_i18n_es_419.py",
            file=sys.stderr,
        )
        raise SystemExit(1) from None

    en_path = I18N_DIR / "app_i18n_en.json"
    out_path = I18N_DIR / "app_i18n_es_419.json"
    en: dict[str, str] = json.loads(en_path.read_text(encoding="utf-8"))
    translator = GoogleTranslator(source="en", target="es")

    uniq_vals = list(dict.fromkeys(en.values()))
    val_to_es: dict[str, str] = {}
    for i, v in enumerate(uniq_vals):
        try:
            val_to_es[v] = translator.translate(v)
        except Exception:
            val_to_es[v] = v
        if (i + 1) % 80 == 0:
            print(f"{i + 1}/{len(uniq_vals)}", flush=True)
        time.sleep(0.06)

    es_419 = {k: val_to_es[v] for k, v in en.items()}
    if es_419.get("ui.opt.lang_en") in ("Inglés", "Ingles"):
        es_419["ui.opt.lang_en"] = "English"
    for k, native in LANG_SELECTOR_NATIVE.items():
        if k in es_419:
            es_419[k] = native
    for k in list(es_419.keys()):
        if "{Name}" in es_419[k]:
            es_419[k] = es_419[k].replace("{Name}", "{name}")

    out_path.write_text(
        json.dumps(es_419, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(es_419)} keys to {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
