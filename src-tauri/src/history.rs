use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::scanner::PluginInfo;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSnapshot {
    pub id: String,
    pub timestamp: String,
    #[serde(rename = "pluginCount")]
    pub plugin_count: usize,
    pub plugins: Vec<PluginInfo>,
    pub directories: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSummary {
    pub id: String,
    pub timestamp: String,
    #[serde(rename = "pluginCount")]
    pub plugin_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanHistory {
    pub scans: Vec<ScanSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionChangedPlugin {
    #[serde(flatten)]
    pub plugin: PluginInfo,
    #[serde(rename = "previousVersion")]
    pub previous_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanDiff {
    #[serde(rename = "oldScan")]
    pub old_scan: ScanSummary,
    #[serde(rename = "newScan")]
    pub new_scan: ScanSummary,
    pub added: Vec<PluginInfo>,
    pub removed: Vec<PluginInfo>,
    #[serde(rename = "versionChanged")]
    pub version_changed: Vec<VersionChangedPlugin>,
}

// KVR Cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KvrCacheEntry {
    #[serde(rename = "kvrUrl")]
    pub kvr_url: Option<String>,
    #[serde(rename = "updateUrl")]
    pub update_url: Option<String>,
    #[serde(rename = "latestVersion")]
    pub latest_version: Option<String>,
    #[serde(rename = "hasUpdate")]
    pub has_update: bool,
    pub source: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KvrCacheUpdateEntry {
    pub key: String,
    #[serde(rename = "kvrUrl")]
    pub kvr_url: Option<String>,
    #[serde(rename = "updateUrl")]
    pub update_url: Option<String>,
    #[serde(rename = "latestVersion")]
    pub latest_version: Option<String>,
    #[serde(rename = "hasUpdate")]
    pub has_update: Option<bool>,
    pub source: Option<String>,
}

// Audio scan types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioSample {
    pub name: String,
    pub path: String,
    pub directory: String,
    pub format: String,
    pub size: u64,
    #[serde(rename = "sizeFormatted")]
    pub size_formatted: String,
    pub modified: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioScanSnapshot {
    pub id: String,
    pub timestamp: String,
    #[serde(rename = "sampleCount")]
    pub sample_count: usize,
    #[serde(rename = "totalBytes")]
    pub total_bytes: u64,
    #[serde(rename = "formatCounts")]
    pub format_counts: std::collections::HashMap<String, usize>,
    pub samples: Vec<AudioSample>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioScanSummary {
    pub id: String,
    pub timestamp: String,
    #[serde(rename = "sampleCount")]
    pub sample_count: usize,
    #[serde(rename = "totalBytes")]
    pub total_bytes: u64,
    #[serde(rename = "formatCounts")]
    pub format_counts: std::collections::HashMap<String, usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioHistory {
    pub scans: Vec<AudioScanSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioScanDiff {
    #[serde(rename = "oldScan")]
    pub old_scan: AudioScanSummary,
    #[serde(rename = "newScan")]
    pub new_scan: AudioScanSummary,
    pub added: Vec<AudioSample>,
    pub removed: Vec<AudioSample>,
}

fn get_data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("com.menketechnologies.universal-plugin-update-manager")
}

fn ensure_data_dir() -> PathBuf {
    let dir = get_data_dir();
    let _ = fs::create_dir_all(&dir);
    dir
}

fn history_file() -> PathBuf {
    ensure_data_dir().join("scan-history.json")
}

fn kvr_cache_file() -> PathBuf {
    ensure_data_dir().join("kvr-cache.json")
}

fn audio_history_file() -> PathBuf {
    ensure_data_dir().join("audio-scan-history.json")
}

fn gen_id() -> String {
    use rand::Rng;
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let mut rng = rand::thread_rng();
    let rand_part: u32 = rng.gen();
    format!(
        "{}{}",
        radix_string(ts as u64, 36),
        radix_string(rand_part as u64, 36)
    )
}

fn radix_string(mut n: u64, base: u64) -> String {
    if n == 0 {
        return "0".into();
    }
    let chars: Vec<char> = "0123456789abcdefghijklmnopqrstuvwxyz".chars().collect();
    let mut result = Vec::new();
    while n > 0 {
        result.push(chars[(n % base) as usize]);
        n /= base;
    }
    result.reverse();
    result.into_iter().collect()
}

fn now_iso() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

// ── Plugin scan history ──

fn load_history() -> ScanHistory {
    let path = history_file();
    if path.exists() {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(h) = serde_json::from_str(&data) {
                return h;
            }
        }
    }
    ScanHistory { scans: vec![] }
}

fn save_history(history: &ScanHistory) {
    let path = history_file();
    if let Ok(data) = serde_json::to_string_pretty(history) {
        let _ = fs::write(path, data);
    }
}

pub fn save_scan(plugins: &[PluginInfo], directories: &[String]) -> ScanSnapshot {
    let mut history = load_history();
    let snapshot = ScanSnapshot {
        id: gen_id(),
        timestamp: now_iso(),
        plugin_count: plugins.len(),
        plugins: plugins.to_vec(),
        directories: directories.to_vec(),
    };
    history.scans.insert(0, snapshot.clone());
    if history.scans.len() > 50 {
        history.scans.truncate(50);
    }
    save_history(&history);
    snapshot
}

pub fn get_scans() -> Vec<ScanSummary> {
    let history = load_history();
    history
        .scans
        .iter()
        .map(|s| ScanSummary {
            id: s.id.clone(),
            timestamp: s.timestamp.clone(),
            plugin_count: s.plugin_count,
        })
        .collect()
}

pub fn get_scan_detail(id: &str) -> Option<ScanSnapshot> {
    let history = load_history();
    history.scans.into_iter().find(|s| s.id == id)
}

pub fn delete_scan(id: &str) {
    let mut history = load_history();
    history.scans.retain(|s| s.id != id);
    save_history(&history);
}

pub fn clear_history() {
    save_history(&ScanHistory { scans: vec![] });
}

pub fn diff_scans(old_id: &str, new_id: &str) -> Option<ScanDiff> {
    let history = load_history();
    let old_scan = history.scans.iter().find(|s| s.id == old_id)?;
    let new_scan = history.scans.iter().find(|s| s.id == new_id)?;

    let old_paths: std::collections::HashSet<&str> =
        old_scan.plugins.iter().map(|p| p.path.as_str()).collect();
    let new_paths: std::collections::HashSet<&str> =
        new_scan.plugins.iter().map(|p| p.path.as_str()).collect();

    let old_by_path: std::collections::HashMap<&str, &PluginInfo> =
        old_scan.plugins.iter().map(|p| (p.path.as_str(), p)).collect();

    let added: Vec<PluginInfo> = new_scan
        .plugins
        .iter()
        .filter(|p| !old_paths.contains(p.path.as_str()))
        .cloned()
        .collect();

    let removed: Vec<PluginInfo> = old_scan
        .plugins
        .iter()
        .filter(|p| !new_paths.contains(p.path.as_str()))
        .cloned()
        .collect();

    let version_changed: Vec<VersionChangedPlugin> = new_scan
        .plugins
        .iter()
        .filter_map(|p| {
            let old = old_by_path.get(p.path.as_str())?;
            if old.version != p.version && p.version != "Unknown" && old.version != "Unknown" {
                Some(VersionChangedPlugin {
                    plugin: p.clone(),
                    previous_version: old.version.clone(),
                })
            } else {
                None
            }
        })
        .collect();

    Some(ScanDiff {
        old_scan: ScanSummary {
            id: old_scan.id.clone(),
            timestamp: old_scan.timestamp.clone(),
            plugin_count: old_scan.plugin_count,
        },
        new_scan: ScanSummary {
            id: new_scan.id.clone(),
            timestamp: new_scan.timestamp.clone(),
            plugin_count: new_scan.plugin_count,
        },
        added,
        removed,
        version_changed,
    })
}

pub fn get_latest_scan() -> Option<ScanSnapshot> {
    let history = load_history();
    history.scans.into_iter().next()
}

// ── KVR Cache ──

pub fn load_kvr_cache() -> std::collections::HashMap<String, KvrCacheEntry> {
    let path = kvr_cache_file();
    if path.exists() {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(cache) = serde_json::from_str(&data) {
                return cache;
            }
        }
    }
    std::collections::HashMap::new()
}

fn save_kvr_cache(cache: &std::collections::HashMap<String, KvrCacheEntry>) {
    let path = kvr_cache_file();
    if let Ok(data) = serde_json::to_string_pretty(cache) {
        let _ = fs::write(path, data);
    }
}

pub fn update_kvr_cache(entries: &[KvrCacheUpdateEntry]) {
    let mut cache = load_kvr_cache();
    for entry in entries {
        cache.insert(
            entry.key.clone(),
            KvrCacheEntry {
                kvr_url: entry.kvr_url.clone(),
                update_url: entry.update_url.clone(),
                latest_version: entry.latest_version.clone(),
                has_update: entry.has_update.unwrap_or(false),
                source: entry.source.clone().unwrap_or_else(|| "kvr".into()),
                timestamp: now_iso(),
            },
        );
    }
    save_kvr_cache(&cache);
}

// ── Audio scan history ──

fn load_audio_history() -> AudioHistory {
    let path = audio_history_file();
    if path.exists() {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(h) = serde_json::from_str(&data) {
                return h;
            }
        }
    }
    AudioHistory { scans: vec![] }
}

fn save_audio_history(history: &AudioHistory) {
    let path = audio_history_file();
    if let Ok(data) = serde_json::to_string_pretty(history) {
        let _ = fs::write(path, data);
    }
}

pub fn save_audio_scan(samples: &[AudioSample]) -> AudioScanSnapshot {
    let mut history = load_audio_history();
    let mut format_counts = std::collections::HashMap::new();
    let mut total_bytes = 0u64;
    for s in samples {
        *format_counts.entry(s.format.clone()).or_insert(0) += 1;
        total_bytes += s.size;
    }
    let snapshot = AudioScanSnapshot {
        id: gen_id(),
        timestamp: now_iso(),
        sample_count: samples.len(),
        total_bytes,
        format_counts,
        samples: samples.to_vec(),
    };
    history.scans.insert(0, snapshot.clone());
    if history.scans.len() > 50 {
        history.scans.truncate(50);
    }
    save_audio_history(&history);
    snapshot
}

pub fn get_audio_scans() -> Vec<AudioScanSummary> {
    let history = load_audio_history();
    history
        .scans
        .iter()
        .map(|s| AudioScanSummary {
            id: s.id.clone(),
            timestamp: s.timestamp.clone(),
            sample_count: s.sample_count,
            total_bytes: s.total_bytes,
            format_counts: s.format_counts.clone(),
        })
        .collect()
}

pub fn get_audio_scan_detail(id: &str) -> Option<AudioScanSnapshot> {
    let history = load_audio_history();
    history.scans.into_iter().find(|s| s.id == id)
}

pub fn delete_audio_scan(id: &str) {
    let mut history = load_audio_history();
    history.scans.retain(|s| s.id != id);
    save_audio_history(&history);
}

pub fn clear_audio_history() {
    save_audio_history(&AudioHistory { scans: vec![] });
}

pub fn get_latest_audio_scan() -> Option<AudioScanSnapshot> {
    let history = load_audio_history();
    history.scans.into_iter().next()
}

pub fn diff_audio_scans(old_id: &str, new_id: &str) -> Option<AudioScanDiff> {
    let history = load_audio_history();
    let old_scan = history.scans.iter().find(|s| s.id == old_id)?;
    let new_scan = history.scans.iter().find(|s| s.id == new_id)?;

    let old_paths: std::collections::HashSet<&str> =
        old_scan.samples.iter().map(|s| s.path.as_str()).collect();
    let new_paths: std::collections::HashSet<&str> =
        new_scan.samples.iter().map(|s| s.path.as_str()).collect();

    let added: Vec<AudioSample> = new_scan
        .samples
        .iter()
        .filter(|s| !old_paths.contains(s.path.as_str()))
        .cloned()
        .collect();

    let removed: Vec<AudioSample> = old_scan
        .samples
        .iter()
        .filter(|s| !new_paths.contains(s.path.as_str()))
        .cloned()
        .collect();

    Some(AudioScanDiff {
        old_scan: AudioScanSummary {
            id: old_scan.id.clone(),
            timestamp: old_scan.timestamp.clone(),
            sample_count: old_scan.sample_count,
            total_bytes: old_scan.total_bytes,
            format_counts: old_scan.format_counts.clone(),
        },
        new_scan: AudioScanSummary {
            id: new_scan.id.clone(),
            timestamp: new_scan.timestamp.clone(),
            sample_count: new_scan.sample_count,
            total_bytes: new_scan.total_bytes,
            format_counts: new_scan.format_counts.clone(),
        },
        added,
        removed,
    })
}
