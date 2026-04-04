#!/usr/bin/env python3
"""Apply hand-edited German strings where EN and DE must differ for UX but MT yields EN cognates.

Run after fill_de_i18n_gaps.py when refreshing the DE catalog.
"""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DE_PATH = ROOT / "i18n" / "app_i18n_de.json"

# Key -> German value (must preserve appFmt placeholders exactly as in English).
OVERRIDES: dict[str, str] = {
    "help.section.navigation": "Navigation in Listen",
    "menu.pause": "Pausieren",
    "menu.scan": "Scannen",
    "menu.tab_plugins": "Plug-ins",
    "ui.audio.scan_progress_line": "↻ {n} gefunden{elapsed}",
    "ui.btn.11015_downloads": "Herunterladungen",
    "ui.btn.bands": "Bänder",
    "ui.btn.eq_amp_fx": "EQ & Effekte",
    "ui.btn.plugins": "Plug-ins",
    "ui.export.plugins_in_project": "Plug-ins in {name}",
    "ui.hm.overview_plugins": "Plug-ins",
    "ui.opt.plugins": "Plug-ins",
    "ui.palette.type_bookmark": "Ordner",
    "ui.palette.type_plugin": "Plug-in",
    "ui.perf.scan_plugins": "Plug-ins",
    "ui.ph.path_to_plugins_10_another_path": "/pfad/zu/plugins&#10;/ein/anderer/pfad",
    "ui.ph.path_to_presets_10_another_path": "/pfad/zu/presets&#10;/ein/anderer/pfad",
    "ui.ph.path_to_projects_10_another_path": "/pfad/zu/projekten&#10;/ein/anderer/pfad",
    "ui.ph.path_to_samples_10_another_path": "/pfad/zu/samples&#10;/ein/anderer/pfad",
    "ui.scan_status.plugins": "Plug-ins",
    "ui.st.visualizer_fps": "Visualizer (FPS)",
    "ui.tt.shuffle": "Zufallswiedergabe",
    "ui.welcome.plugins": "Plug-ins",
}


def main() -> None:
    de: dict[str, str] = json.loads(DE_PATH.read_text(encoding="utf-8"))
    for k, v in OVERRIDES.items():
        if k not in de:
            raise SystemExit(f"missing key in DE catalog: {k}")
        de[k] = v
    DE_PATH.write_text(
        json.dumps(de, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Applied {len(OVERRIDES)} overrides to {DE_PATH}")


if __name__ == "__main__":
    main()
