use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub plugin_type: String,
    pub version: String,
    pub manufacturer: String,
    #[serde(rename = "manufacturerUrl")]
    pub manufacturer_url: Option<String>,
    pub size: String,
    pub modified: String,
}

pub fn get_vst_directories() -> Vec<String> {
    let home = dirs::home_dir().unwrap_or_default();
    let mut dirs_list: Vec<PathBuf> = Vec::new();

    #[cfg(target_os = "macos")]
    {
        dirs_list.extend([
            PathBuf::from("/Library/Audio/Plug-Ins/VST"),
            PathBuf::from("/Library/Audio/Plug-Ins/VST3"),
            PathBuf::from("/Library/Audio/Plug-Ins/Components"),
            home.join("Library/Audio/Plug-Ins/VST"),
            home.join("Library/Audio/Plug-Ins/VST3"),
            home.join("Library/Audio/Plug-Ins/Components"),
        ]);
    }

    #[cfg(target_os = "windows")]
    {
        let pf = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".into());
        let pf86 =
            std::env::var("ProgramFiles(x86)").unwrap_or_else(|_| "C:\\Program Files (x86)".into());
        dirs_list.extend([
            PathBuf::from(&pf).join("Common Files").join("VST3"),
            PathBuf::from(&pf).join("VSTPlugins"),
            PathBuf::from(&pf).join("Steinberg").join("VSTPlugins"),
            PathBuf::from(&pf86).join("Common Files").join("VST3"),
            PathBuf::from(&pf86).join("VSTPlugins"),
            PathBuf::from(&pf86)
                .join("Steinberg")
                .join("VSTPlugins"),
        ]);
    }

    #[cfg(target_os = "linux")]
    {
        dirs_list.extend([
            PathBuf::from("/usr/lib/vst"),
            PathBuf::from("/usr/lib/vst3"),
            PathBuf::from("/usr/local/lib/vst"),
            PathBuf::from("/usr/local/lib/vst3"),
            home.join(".vst"),
            home.join(".vst3"),
        ]);
    }

    dirs_list
        .into_iter()
        .filter(|d| d.exists())
        .map(|d| d.to_string_lossy().to_string())
        .collect()
}

fn get_plugin_type(ext: &str) -> &str {
    match ext {
        ".vst" => "VST2",
        ".vst3" => "VST3",
        ".component" => "AU",
        ".dll" => "VST2",
        _ => "Unknown",
    }
}

fn get_directory_size(dir: &Path) -> u64 {
    let mut size = 0u64;
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                size += get_directory_size(&path);
            } else if let Ok(meta) = fs::metadata(&path) {
                size += meta.len();
            }
        }
    }
    size
}

fn format_size(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".into();
    }
    let units = ["B", "KB", "MB", "GB"];
    let i = (bytes as f64).log(1024.0).floor() as usize;
    let i = i.min(units.len() - 1);
    format!("{:.1} {}", bytes as f64 / 1024f64.powi(i as i32), units[i])
}

#[cfg(target_os = "macos")]
fn read_plist_info(plugin_path: &Path) -> (Option<String>, Option<String>, Option<String>) {
    let plist_path = plugin_path.join("Contents").join("Info.plist");
    if !plist_path.exists() {
        return (None, None, None);
    }

    let plist_val = match plist::Value::from_file(&plist_path) {
        Ok(v) => v,
        Err(_) => return (None, None, None),
    };

    let dict = match plist_val.as_dictionary() {
        Some(d) => d,
        None => return (None, None, None),
    };

    let version = dict
        .get("CFBundleShortVersionString")
        .and_then(|v| v.as_string())
        .map(|s| s.to_string());

    let mut manufacturer: Option<String> = None;
    let mut manufacturer_url: Option<String> = None;

    if let Some(bundle_id) = dict.get("CFBundleIdentifier").and_then(|v| v.as_string()) {
        let parts: Vec<&str> = bundle_id.split('.').collect();
        if parts.len() >= 2 {
            let domain = parts[1];
            let mut mfg = domain.to_string();
            if let Some(first) = mfg.get_mut(0..1) {
                first.make_ascii_uppercase();
            }
            manufacturer = Some(mfg);

            let lower = domain.to_lowercase();
            if lower != "apple" && lower.len() > 1 {
                manufacturer_url = Some(format!("https://www.{}.com", lower));
            }
        }
    }

    if manufacturer_url.is_none() {
        if let Some(copyright) = dict
            .get("NSHumanReadableCopyright")
            .and_then(|v| v.as_string())
        {
            let url_re = regex::Regex::new(r#"https?://[^\s)"',]+"#).unwrap();
            if let Some(m) = url_re.find(copyright) {
                manufacturer_url = Some(m.as_str().to_string());
            }
        }
    }

    (version, manufacturer, manufacturer_url)
}

#[cfg(not(target_os = "macos"))]
fn read_plist_info(_plugin_path: &Path) -> (Option<String>, Option<String>, Option<String>) {
    (None, None, None)
}

pub fn get_plugin_info(file_path: &Path) -> Option<PluginInfo> {
    let ext = file_path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();

    let name = file_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();

    let meta = fs::metadata(file_path).ok()?;

    let (version, manufacturer, manufacturer_url) = read_plist_info(file_path);

    let size = if meta.is_dir() {
        get_directory_size(file_path)
    } else {
        meta.len()
    };

    let modified = meta
        .modified()
        .ok()
        .map(|t| {
            let datetime: chrono::DateTime<chrono::Utc> = t.into();
            datetime.format("%Y-%m-%d").to_string()
        })
        .unwrap_or_default();

    Some(PluginInfo {
        name,
        path: file_path.to_string_lossy().to_string(),
        plugin_type: get_plugin_type(&ext).to_string(),
        version: version.unwrap_or_else(|| "Unknown".into()),
        manufacturer: manufacturer.unwrap_or_else(|| "Unknown".into()),
        manufacturer_url,
        size: format_size(size),
        modified,
    })
}

pub fn discover_plugins(directories: &[String]) -> Vec<PathBuf> {
    let valid_extensions = [".vst", ".vst3", ".component", ".dll"];
    let mut plugin_paths = Vec::new();

    for dir in directories {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let ext = path
                    .extension()
                    .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
                    .unwrap_or_default();
                if valid_extensions.contains(&ext.as_str()) {
                    plugin_paths.push(path);
                }
            }
        }
    }

    plugin_paths
}
