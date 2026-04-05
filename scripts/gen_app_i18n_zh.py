#!/usr/bin/env python3
"""Build i18n/app_i18n_zh.json from app_i18n_en.json (Simplified Chinese UI).

Requires: pip install deep-translator (use a venv, e.g. .venv-i18n).

Translates each unique English value once, then maps keys — re-run when app_i18n_en.json grows.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeout

ROOT = pathlib.Path(__file__).resolve().parents[1]
I18N_DIR = ROOT / "i18n"

# GoogleTranslate can hang on slow networks; bound wait per string.
_TRANSLATE_TIMEOUT_S = 25


def translate_one(translator, text: str) -> str:
    """Run GoogleTranslator.translate in a worker so the main thread can time out."""
    return translator.translate(text)


def translate_with_retry(translator, text: str) -> str:
    for attempt in range(4):
        try:
            with ThreadPoolExecutor(max_workers=1) as pool:
                fut = pool.submit(translate_one, translator, text)
                return fut.result(timeout=_TRANSLATE_TIMEOUT_S)
        except FutureTimeout:
            if attempt == 3:
                print(f"TIMEOUT after {_TRANSLATE_TIMEOUT_S}s, keeping English for len={len(text)}", flush=True)
                return text
        except Exception as e:
            if attempt == 3:
                print(f"translate error ({e!r}), keeping English for len={len(text)}", flush=True)
                return text
            time.sleep(0.35 * (2**attempt))
    return text


def align_placeholders(en_val: str, zh_val: str) -> str:
    """MT often translates `{name}` inside braces; keep English token names for appFmt."""
    ph_en = re.findall(r"\{(\w+)\}", en_val)
    ph_zh = re.findall(r"\{(\w+)\}", zh_val)
    if len(ph_en) != len(ph_zh):
        return zh_val
    it = iter(ph_en)
    return re.sub(r"\{[^}]+\}", lambda _: "{" + next(it) + "}", zh_val)


def restore_ipc_placeholders(en_val: str, loc_val: str) -> str:
    """Same token names as `app_i18n::tests` / `ipc.js` — MT may rewrite `{uptime}` in braces."""
    re_en = re.compile(r"\{[a-zA-Z_][a-zA-Z0-9_]*\}")
    re_any = re.compile(r"\{[^}]+\}")
    en_phs = re_en.findall(en_val)
    if not en_phs:
        return loc_val
    loc_phs = re_any.findall(loc_val)
    if len(loc_phs) != len(en_phs):
        return loc_val
    out = loc_val
    for wrong, right in zip(loc_phs, en_phs):
        if wrong != right:
            out = out.replace(wrong, right, 1)
    return out


def main() -> None:
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print(
            "Install deep-translator in a venv: python3 -m venv .venv-i18n && "
            ".venv-i18n/bin/pip install deep-translator && .venv-i18n/bin/python scripts/gen_app_i18n_zh.py",
            file=sys.stderr,
        )
        raise SystemExit(1) from None

    en_path = I18N_DIR / "app_i18n_en.json"
    out_path = I18N_DIR / "app_i18n_zh.json"
    en: dict[str, str] = json.loads(en_path.read_text(encoding="utf-8"))
    translator = GoogleTranslator(source="en", target="zh-CN")

    uniq_vals = list(dict.fromkeys(en.values()))
    val_to_zh: dict[str, str] = {}
    for i, v in enumerate(uniq_vals):
        val_to_zh[v] = translate_with_retry(translator, v)
        if (i + 1) % 80 == 0:
            print(f"{i + 1}/{len(uniq_vals)}", flush=True)
        time.sleep(0.05)

    zh_map = {k: val_to_zh[v] for k, v in en.items()}
    for k in zh_map:
        zh_map[k] = align_placeholders(en[k], zh_map[k])
        zh_map[k] = restore_ipc_placeholders(en[k], zh_map[k])
    if zh_map.get("ui.opt.lang_en") in ("英语", "英文"):
        zh_map["ui.opt.lang_en"] = "English"
    if "ui.opt.lang_de" in zh_map:
        zh_map["ui.opt.lang_de"] = "Deutsch"
    if "ui.opt.lang_es" in zh_map:
        zh_map["ui.opt.lang_es"] = "Español"
    if "ui.opt.lang_sv" in zh_map:
        zh_map["ui.opt.lang_sv"] = "Svenska"
    if "ui.opt.lang_fr" in zh_map:
        zh_map["ui.opt.lang_fr"] = "Français"
    if "ui.opt.lang_it" in zh_map:
        zh_map["ui.opt.lang_it"] = "Italiano"
    if "ui.opt.lang_el" in zh_map:
        zh_map["ui.opt.lang_el"] = "Ελληνικά"
    if "ui.opt.lang_pt" in zh_map:
        zh_map["ui.opt.lang_pt"] = "Português"
    if "ui.opt.lang_nl" in zh_map:
        zh_map["ui.opt.lang_nl"] = "Nederlands"
    if "ui.opt.lang_pl" in zh_map:
        zh_map["ui.opt.lang_pl"] = "Polski"
    if "ui.opt.lang_ru" in zh_map:
        zh_map["ui.opt.lang_ru"] = "Русский"
    if "ui.opt.lang_zh" in zh_map:
        zh_map["ui.opt.lang_zh"] = "简体中文"
    for k in list(zh_map.keys()):
        if "{Name}" in zh_map[k]:
            zh_map[k] = zh_map[k].replace("{Name}", "{name}")

    out_path.write_text(json.dumps(zh_map, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Wrote {len(zh_map)} keys to {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
