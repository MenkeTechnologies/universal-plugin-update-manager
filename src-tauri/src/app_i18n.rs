//! App UI strings for i18n: seeded into SQLite (`app_i18n` table) from `app_i18n_en.json`
//! (toasts, menus, tray, HTML `data-i18n*`, dialogs). Other locales add rows with the same keys.

use rusqlite::{params, Connection};
use std::collections::HashMap;

static SEED_JSON: &str = include_str!("../app_i18n_en.json");

/// Insert default English rows (`INSERT OR IGNORE`) so new app versions can add keys without
/// overwriting user-edited translations.
pub fn seed_defaults(conn: &Connection) -> Result<(), String> {
    let map: HashMap<String, String> = serde_json::from_str(SEED_JSON).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare_cached("INSERT OR IGNORE INTO app_i18n (key, locale, value) VALUES (?1, 'en', ?2)")
        .map_err(|e| e.to_string())?;
    for (k, v) in map {
        stmt.execute(params![k, v]).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Merge English with `locale` (falls back to English for missing keys).
pub fn load_merged(conn: &Connection, locale: &str) -> Result<HashMap<String, String>, String> {
    let mut out: HashMap<String, String> = HashMap::new();
    let mut stmt = conn
        .prepare("SELECT key, value FROM app_i18n WHERE locale = 'en'")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;
    for row in rows {
        let (k, v) = row.map_err(|e| e.to_string())?;
        out.insert(k, v);
    }
    if locale == "en" || locale.is_empty() {
        return Ok(out);
    }
    let mut stmt = conn
        .prepare("SELECT key, value FROM app_i18n WHERE locale = ?1")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(params![locale], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    for row in rows {
        let (k, v) = row.map_err(|e| e.to_string())?;
        out.insert(k, v);
    }
    Ok(out)
}
