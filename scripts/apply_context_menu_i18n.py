#!/usr/bin/env python3
"""Rewrite frontend/js/context-menu.js labels to appFmt('menu.*') + ..._noEcho where needed."""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
PATH = ROOT / "frontend" / "js" / "context-menu.js"

# (pattern, replacement) — order matters: longer / more specific first
REPLACEMENTS: list[tuple[str, str]] = [
    # Dynamic / template
    (
        r"label: `\$\{has \? 'Remove' : 'Add'\} tag: \$\{tag\}`",
        "label: has ? appFmt('menu.remove_tag_named', { tag }) : appFmt('menu.add_tag_named', { tag }), ..._noEcho",
    ),
    (
        r"label: `Open in \$\{dawName\}`",
        "label: appFmt('menu.open_in_daw', { daw: dawName }), ..._noEcho",
    ),
    (
        r"label: `Open in \$\{daw \|\| 'DAW'\}`",
        "label: appFmt('menu.open_in_daw', { daw: daw || 'DAW' }), ..._noEcho",
    ),
    (
        r"label: `Copy \$\{label\}`",
        "label: appFmt('menu.copy_field_label', { label }), ..._noEcho",
    ),
    (
        r"label: `Copy \"\$\{label\}: \$\{val\}\"`",
        "label: appFmt('menu.copy_quoted_label_val', { label, val }), ..._noEcho",
    ),
    (
        r"label: `Copy \$\{title\} Data`",
        "label: appFmt('menu.copy_tabular_title', { title }), ..._noEcho",
    ),
    (
        r"label: `Apply \$\{scheme \|\| 'scheme'\}`",
        "label: appFmt('menu.apply_scheme', { scheme: scheme || 'scheme' }), ..._noEcho",
    ),
    (
        r"label: isRegex \? 'Switch to Fuzzy' : 'Switch to Regex'",
        "label: isRegex ? appFmt('menu.switch_to_fuzzy') : appFmt('menu.switch_to_regex')",
    ),
    (
        r"label: isOn \? 'Turn Off' : 'Turn On'",
        "label: isOn ? appFmt('menu.turn_off') : appFmt('menu.turn_on')",
    ),
    (
        r"label: settingsSection\.classList\.contains\('collapsed'\) \? 'Expand Section' : 'Collapse Section'",
        "label: settingsSection.classList.contains('collapsed') ? appFmt('menu.section_expand') : appFmt('menu.section_collapse')",
    ),
    (
        r"label: audioLooping \? 'Disable Loop' : 'Enable Loop'",
        "label: audioLooping ? appFmt('menu.disable_loop') : appFmt('menu.enable_loop'), ..._noEcho",
    ),
    (
        r"label: isExpanded \? 'Collapse Player' : 'Expand Player'",
        "label: isExpanded ? appFmt('menu.player_collapse') : appFmt('menu.player_expand'), ..._noEcho",
    ),
    (
        r"label: isPlaying \? 'Pause' : 'Play'",
        "label: isPlaying ? appFmt('menu.pause') : appFmt('menu.play'), ..._noEcho",
    ),
    (
        r"label: fav \? 'Remove from Favorites' : 'Add to Favorites'",
        "label: fav ? appFmt('menu.remove_from_favorites') : appFmt('menu.add_to_favorites'), ..._noEcho",
    ),
    (
        r"label: f \? 'Remove from Favorites' : 'Add to Favorites'",
        "label: f ? appFmt('menu.remove_from_favorites') : appFmt('menu.add_to_favorites'), ..._noEcho",
    ),
    (
        r"label: pluginFav \? 'Remove from Favorites' : 'Add to Favorites'",
        "label: pluginFav ? appFmt('menu.remove_from_favorites') : appFmt('menu.add_to_favorites'), ..._noEcho",
    ),
    (
        r"label: isFavorite\(path\) \? 'Remove from Favorites' : 'Add to Favorites'",
        "label: isFavorite(path) ? appFmt('menu.remove_from_favorites') : appFmt('menu.add_to_favorites'), ..._noEcho",
    ),
    (
        r"label: pluginFav \? 'Remove from Favorites' : 'Add to Favorites'",
        "label: pluginFav ? appFmt('menu.remove_from_favorites') : appFmt('menu.add_to_favorites'), ..._noEcho",
    ),
    (
        r"label: on \? 'Disable Row Expand' : 'Enable Row Expand'",
        "label: on ? appFmt('menu.disable_row_expand') : appFmt('menu.enable_row_expand')",
    ),
    (
        r"label: ap \? 'Disable Autoplay Next' : 'Enable Autoplay Next'",
        "label: ap ? appFmt('menu.disable_autoplay_next') : appFmt('menu.enable_autoplay_next')",
    ),
    (
        r"label: note \? 'Edit Note' : 'Add Note'",
        "label: note ? appFmt('menu.edit_note') : appFmt('menu.add_note'), ..._noEcho",
    ),
    (
        r"label: dirFav \? 'Remove Bookmark' : 'Bookmark Directory'",
        "label: dirFav ? appFmt('menu.remove_bookmark') : appFmt('menu.bookmark_directory'), ..._noEcho",
    ),
]

# Simple literal: english -> (key, no_echo)
LITERALS: list[tuple[str, str, bool]] = [
    ("Stop &amp; Close", "menu.stop_and_close", True),
    ("Reveal in Finder", "menu.reveal_in_finder", True),
    ("Show in File Browser", "menu.show_file_browser", True),
    ("Show in Samples Tab", "menu.show_in_samples_tab", True),
    ("Copy Name", "menu.copy_name", True),
    ("Copy Path", "menu.copy_path", True),
    ("Copy Architecture", "menu.copy_architecture", True),
    ("Copy Plugin Name", "menu.copy_plugin_name", True),
    ("Copy Manufacturer", "menu.copy_manufacturer", True),
    ("Copy Tag Name", "menu.copy_tag_name", True),
    ("Copy Stats", "menu.copy_stats", True),
    ("Copy Process Stats", "menu.copy_process_stats", True),
    ("Copy File Path", "menu.copy_file_path", True),
    ("Copy Section Name", "menu.copy_section_name", True),
    ("Copy Scheme Name", "menu.copy_scheme_name", True),
    ("Copy Tile Name", "menu.copy_tile_name", True),
    ("Copy Tile Title", "menu.copy_tile_title", True),
    ("Copy All Paths", "menu.copy_all_paths", True),
    ("Loop", "menu.loop", True),
    ("Open in Music", "menu.open_in_music", True),
    ("Open in QuickTime", "menu.open_in_quicktime", True),
    ("Open in Audacity", "menu.open_audacity", True),
    ("Open in Default App", "menu.open_default_app", True),
    ("Open with Default App", "menu.open_with_default_app", True),
    ("Open on KVR", "menu.open_kvr", True),
    ("Open Manufacturer Site", "menu.open_manufacturer_site", True),
    ("Preview in GarageBand", "menu.open_garageband", True),
    ("Open in Logic Pro", "menu.open_in_logic_pro", True),
    ("Open in Ableton Live", "menu.open_ableton_live", True),
    ("Open in Text Editor", "menu.open_in_text_editor", True),
    ("Show Plugins Used", "menu.show_plugins_used", False),
    ("Explore Project Contents", "menu.explore_project_contents", False),
    ("Explore XML Contents", "menu.explore_xml_contents", False),
    ("Sort Ascending", "menu.sort_ascending", False),
    ("Sort Descending", "menu.sort_descending", False),
    ("Clear Search", "menu.clear_search", False),
    ("Paste & Search", "menu.paste_and_search", False),
    ("Reset to All", "menu.reset_to_all", False),
    ("Scan Plugins", "menu.scan_plugins", False),
    ("Check Updates", "menu.check_updates", False),
    ("Export Plugins", "menu.export_plugins", False),
    ("Import Plugins", "menu.import_plugins", False),
    ("Scan Samples", "menu.scan_samples", False),
    ("Export Samples", "menu.export_samples", False),
    ("Import Samples", "menu.import_samples", False),
    ("Scan DAW Projects", "menu.scan_daw", False),
    ("Export Projects", "menu.export_projects", False),
    ("Import Projects", "menu.import_projects_short", False),
    ("Scan Presets", "menu.scan_presets", False),
    ("Export Presets", "menu.export_presets", False),
    ("Import Presets", "menu.import_presets", False),
    ("Find Duplicates", "menu.find_duplicates", False),
    ("Heatmap Dashboard", "menu.heatmap_dashboard", False),
    ("Dependency Graph", "menu.dep_graph", False),
    ("Open GitHub Repository", "menu.open_github_repository", False),
    ("Settings", "menu.tab_settings", False),
    ("View Details", "menu.view_details", False),
    ("Delete Entry", "menu.delete_entry", False),
    ("Hide Player", "menu.hide_player", False),
    ("Remove from Favorites", "menu.remove_from_favorites", True),
    ("Add to Favorites", "menu.add_to_favorites", True),
    ("Filter by This Tag", "menu.filter_by_this_tag", False),
    ("Delete Tag from All Items", "menu.delete_tag_globally", False),
    ("Find in Plugins Tab", "menu.find_in_plugins_tab", False),
    ("Find Projects Using This", "menu.find_projects_using", False),
    ("Switch to Tab", "menu.switch_to_tab", False),
    ("Rescan Tab Data", "menu.rescan_tab_data", False),
    ("Export Tab Data", "menu.export_tab_data", False),
    ("Reset Tab Order", "menu.reset_tabs", False),
    ("Reset Column Widths", "menu.reset_columns", False),
    ("Clear All History", "menu.clear_history", False),
    ("Clear", "menu.clear", True),
    ("Open Directory", "menu.open_directory", True),
    ("Open in Finder", "menu.open_in_finder", True),
    ("Bookmark This Directory", "menu.bookmark_this_directory", False),
    ("Play", "menu.play", True),
    ("Find Similar", "menu.find_similar", False),
    ("Find Similar Samples", "menu.find_similar_samples", False),
    ("Find Similar to This", "menu.find_similar_to_this", False),
    ("Add Note / Tags", "menu.add_note_tags", False),
    ("Add Note", "menu.add_note", False),
    ("Edit Note", "menu.edit_note", False),
    ("Delete Note", "menu.delete_note", False),
    ("Delete", "menu.delete", False),
    ("Minimize", "menu.minimize", False),
    ("Close", "menu.close", False),
    ("Close Dashboard", "menu.close_dashboard", False),
    ("Close Panel", "menu.close_panel", False),
    ("Open", "menu.open", True),
    ("Open Folder", "menu.open_folder", True),
    ("Scan All", "menu.scan_all", False),
    ("Stop All Scans", "menu.stop_all_scans", False),
    ("Rebind This Shortcut", "menu.rebind_shortcut", False),
    ("Reset All Shortcuts", "menu.reset_all_shortcuts", False),
    ("Refresh Dashboard", "menu.refresh_dashboard", False),
    ("Move Up", "menu.move_up", False),
    ("Move Down", "menu.move_down", False),
    ("Export Snapshot (PNG)", "menu.export_snapshot_png", False),
    ("Toggle Fullscreen", "menu.toggle_fullscreen", False),
    ("Clear Tile", "menu.clear_tile", False),
    ("New Smart Playlist", "menu.new_smart_playlist", False),
    ("Copy", "menu.copy", True),
    ("Reset to Default", "menu.reset_eq_default", False),
]


def main() -> None:
    text = PATH.read_text(encoding="utf-8")

    for pat, repl in REPLACEMENTS:
        if "BUGPLACEHOLDER" in repl:
            continue
        text = re.sub(pat, repl, text)

    # Sort literals by length desc to avoid partial matches
    for eng, key, no_echo in sorted(LITERALS, key=lambda x: -len(x[0])):
        old = f"label: '{eng}'"
        suffix = ", ..._noEcho" if no_echo else ""
        new = f"label: appFmt('{key}'){suffix}"
        text = text.replace(old, new)

    PATH.write_text(text, encoding="utf-8")
    print("Updated", PATH)


if __name__ == "__main__":
    main()
