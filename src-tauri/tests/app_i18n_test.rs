//! Integration tests for SQLite-backed UI strings (`app_i18n` merge + `Database::get_app_strings`).
//! Uses the real on-disk DB via `init_global` (same pattern as `tests/db_test.rs`).
//!
//! Seed JSON parity (key sets, placeholders, native menu keys) is covered by unit tests in
//! `app_i18n::tests`. These tests assert `get_app_strings` through the real DB matches that model.

use std::collections::HashSet;
use std::sync::Once;

static INIT_DB: Once = Once::new();

fn ensure_db() {
    INIT_DB.call_once(|| {
        app_lib::db::init_global().expect("init_global for app_i18n tests");
    });
}

#[test]
fn app_strings_en_contains_core_menu_keys() {
    ensure_db();
    let m = app_lib::db::global()
        .get_app_strings("en")
        .expect("get_app_strings en");
    for key in [
        "menu.scan_all",
        "menu.tab_plugins",
        "menu.scan_daw",
        "menu.about",
    ] {
        assert!(
            m.get(key).map(|s| !s.is_empty()).unwrap_or(false),
            "missing or empty key: {key}"
        );
    }
}

#[test]
fn app_strings_all_supported_locales_have_substantial_maps() {
    ensure_db();
    for loc in ["en", "de", "es", "sv", "fr"] {
        let m = app_lib::db::global()
            .get_app_strings(loc)
            .unwrap_or_else(|e| panic!("get_app_strings {loc}: {e}"));
        assert!(
            m.len() > 200,
            "locale {loc} should expose many keys, got {}",
            m.len()
        );
        assert!(
            m.contains_key("menu.scan_all"),
            "locale {loc} missing menu.scan_all"
        );
    }
}

#[test]
fn app_strings_unknown_locale_falls_back_to_english_values() {
    ensure_db();
    let en = app_lib::db::global()
        .get_app_strings("en")
        .expect("en");
    let pseudo = app_lib::db::global()
        .get_app_strings("zz")
        .expect("zz");
    assert_eq!(
        pseudo.get("menu.scan_all"),
        en.get("menu.scan_all"),
        "unknown locale should keep English for keys without zz rows"
    );
}

#[test]
fn app_strings_all_locales_share_same_key_set_as_en_in_db() {
    ensure_db();
    let en = app_lib::db::global()
        .get_app_strings("en")
        .expect("en");
    let keys_en: HashSet<_> = en.keys().cloned().collect();
    for loc in ["de", "es", "sv", "fr"] {
        let m = app_lib::db::global()
            .get_app_strings(loc)
            .unwrap_or_else(|e| panic!("get_app_strings {loc}: {e}"));
        let keys: HashSet<_> = m.keys().cloned().collect();
        assert_eq!(
            keys_en, keys,
            "DB merged map for {loc} should expose the same keys as en"
        );
    }
}

#[test]
fn app_strings_de_retains_placeholder_for_menu_batch_selected() {
    ensure_db();
    let de = app_lib::db::global()
        .get_app_strings("de")
        .expect("de");
    let v = de
        .get("menu.batch_selected")
        .expect("menu.batch_selected should exist");
    assert!(
        v.contains("{n}"),
        "German menu.batch_selected must keep {{n}} for appFmt: {v:?}"
    );
}

#[test]
fn app_strings_en_contains_tray_keys() {
    ensure_db();
    let m = app_lib::db::global()
        .get_app_strings("en")
        .expect("en");
    for key in [
        "tray.show",
        "tray.scan_all",
        "tray.stop_all",
        "tray.play_pause",
        "tray.next_track",
        "tray.quit",
        "tray.tooltip",
    ] {
        assert!(
            m.get(key).map(|s| !s.is_empty()).unwrap_or(false),
            "missing or empty tray key: {key}"
        );
    }
}
