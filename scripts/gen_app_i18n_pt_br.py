#!/usr/bin/env python3
"""Build i18n/app_i18n_pt_br.json from app_i18n_en.json (Brazilian Portuguese UI).

Requires: pip install deep-translator (use a venv, e.g. .venv-i18n).

Uses the same Google Translate target as `gen_app_i18n_pt.py` (`pt`); the shipped
catalog is a distinct locale row (`pt-BR` in SQLite) so prefs and OS conventions
can use BCP 47. Re-run when `app_i18n_en.json` grows.

Usage:
  .venv-i18n/bin/python scripts/gen_app_i18n_pt_br.py
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[1]
I18N_DIR = ROOT / "i18n"


def align_placeholders(en_val: str, pt_val: str) -> str:
    """MT often translates `{name}` inside braces; keep English token names for appFmt."""
    ph_en = re.findall(r"\{(\w+)\}", en_val)
    ph_pt = re.findall(r"\{(\w+)\}", pt_val)
    if len(ph_en) != len(ph_pt):
        return pt_val
    it = iter(ph_en)
    return re.sub(r"\{[^}]+\}", lambda _: "{" + next(it) + "}", pt_val)


def main() -> None:
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print(
            "Install deep-translator in a venv: python3 -m venv .venv-i18n && "
            ".venv-i18n/bin/pip install deep-translator && .venv-i18n/bin/python scripts/gen_app_i18n_pt_br.py",
            file=sys.stderr,
        )
        raise SystemExit(1) from None

    en_path = I18N_DIR / "app_i18n_en.json"
    out_path = I18N_DIR / "app_i18n_pt_br.json"
    en: dict[str, str] = json.loads(en_path.read_text(encoding="utf-8"))
    translator = GoogleTranslator(source="en", target="pt")

    uniq_vals = list(dict.fromkeys(en.values()))
    val_to_pt: dict[str, str] = {}
    for i, v in enumerate(uniq_vals):
        try:
            val_to_pt[v] = translator.translate(v)
        except Exception:
            val_to_pt[v] = v
        if (i + 1) % 80 == 0:
            print(f"{i + 1}/{len(uniq_vals)}", flush=True)
        time.sleep(0.06)

    pt_br = {k: val_to_pt[v] for k, v in en.items()}
    for k in pt_br:
        pt_br[k] = align_placeholders(en[k], pt_br[k])
    if pt_br.get("ui.opt.lang_en") in ("Inglês", "ingles"):
        pt_br["ui.opt.lang_en"] = "English"
    if "ui.opt.lang_de" in pt_br:
        pt_br["ui.opt.lang_de"] = "Deutsch"
    if "ui.opt.lang_es" in pt_br:
        pt_br["ui.opt.lang_es"] = "Español"
    if "ui.opt.lang_sv" in pt_br:
        pt_br["ui.opt.lang_sv"] = "Svenska"
    if "ui.opt.lang_fr" in pt_br:
        pt_br["ui.opt.lang_fr"] = "Français"
    if "ui.opt.lang_pt" in pt_br:
        pt_br["ui.opt.lang_pt"] = "Português"
    if "ui.opt.lang_pt_br" in pt_br:
        pt_br["ui.opt.lang_pt_br"] = "Português (Brasil)"
    for k in list(pt_br.keys()):
        if "{Name}" in pt_br[k]:
            pt_br[k] = pt_br[k].replace("{Name}", "{name}")

    out_path.write_text(
        json.dumps(pt_br, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(pt_br)} keys to {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
