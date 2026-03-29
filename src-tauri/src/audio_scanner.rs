use crate::history::AudioSample;
use std::collections::HashSet;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

const AUDIO_EXTENSIONS: &[&str] = &[
    ".wav", ".mp3", ".aiff", ".aif", ".flac", ".ogg", ".m4a", ".wma", ".aac", ".opus", ".rex",
    ".rx2", ".sf2", ".sfz",
];

const SKIP_DIRS: &[&str] = &[
    "node_modules",
    ".git",
    ".Trash",
    "$RECYCLE.BIN",
    "System Volume Information",
    ".cache",
    "__pycache__",
];

fn format_size(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".into();
    }
    let units = ["B", "KB", "MB", "GB"];
    let i = (bytes as f64).log(1024.0).floor() as usize;
    let i = i.min(units.len() - 1);
    format!("{:.1} {}", bytes as f64 / 1024f64.powi(i as i32), units[i])
}

pub fn get_audio_roots() -> Vec<PathBuf> {
    let home = dirs::home_dir().unwrap_or_default();
    let mut roots = Vec::new();

    #[cfg(target_os = "macos")]
    {
        roots.push(home.clone());
        roots.push(PathBuf::from("/Library/Audio"));
        roots.push(PathBuf::from("/Applications"));
        if let Ok(vols) = fs::read_dir("/Volumes") {
            for entry in vols.flatten() {
                let path = entry.path();
                if path.is_dir() || path.is_symlink() {
                    roots.push(path);
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        roots.push(home.clone());
        roots.push(PathBuf::from(
            std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".into()),
        ));
        roots.push(PathBuf::from(
            std::env::var("ProgramFiles(x86)")
                .unwrap_or_else(|_| "C:\\Program Files (x86)".into()),
        ));
        for c in b'C'..=b'Z' {
            let drive = format!("{}:\\", c as char);
            if Path::new(&drive).exists() {
                roots.push(PathBuf::from(drive));
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        roots.push(home.clone());
        roots.push(PathBuf::from("/usr/share/sounds"));
        roots.push(PathBuf::from("/usr/local/share/sounds"));
    }

    roots.sort();
    roots.dedup();
    roots.into_iter().filter(|r| r.exists()).collect()
}

pub fn walk_for_audio(
    roots: &[PathBuf],
    on_batch: &mut dyn FnMut(&[AudioSample], usize),
    should_stop: &dyn Fn() -> bool,
) {
    let mut visited = HashSet::new();
    let mut batch = Vec::new();
    let mut found = 0usize;
    let batch_size = 50;

    for root in roots {
        if should_stop() {
            break;
        }
        walk_dir(
            root,
            0,
            &mut visited,
            &mut batch,
            &mut found,
            batch_size,
            on_batch,
            should_stop,
        );
    }

    if !batch.is_empty() {
        on_batch(&batch, found);
    }
}

fn walk_dir(
    dir: &Path,
    depth: u32,
    visited: &mut HashSet<PathBuf>,
    batch: &mut Vec<AudioSample>,
    found: &mut usize,
    batch_size: usize,
    on_batch: &mut dyn FnMut(&[AudioSample], usize),
    should_stop: &dyn Fn() -> bool,
) {
    if depth > 30 || should_stop() {
        return;
    }

    let real_dir = match fs::canonicalize(dir) {
        Ok(p) => p,
        Err(_) => return,
    };
    if !visited.insert(real_dir) {
        return;
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        if should_stop() {
            return;
        }

        let name = entry.file_name();
        let name_str = name.to_string_lossy();
        if name_str.starts_with('.') || SKIP_DIRS.contains(&name_str.as_ref()) {
            continue;
        }

        let path = entry.path();

        if path.is_dir() {
            walk_dir(
                &path,
                depth + 1,
                visited,
                batch,
                found,
                batch_size,
                on_batch,
                should_stop,
            );
        } else if path.is_file() {
            let ext = path
                .extension()
                .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
                .unwrap_or_default();

            if AUDIO_EXTENSIONS.contains(&ext.as_str()) {
                if let Ok(meta) = fs::metadata(&path) {
                    let sample_name = path
                        .file_stem()
                        .map(|s| s.to_string_lossy().to_string())
                        .unwrap_or_default();
                    let modified = meta
                        .modified()
                        .ok()
                        .map(|t| {
                            let dt: chrono::DateTime<chrono::Utc> = t.into();
                            dt.format("%Y-%m-%d").to_string()
                        })
                        .unwrap_or_default();

                    batch.push(AudioSample {
                        name: sample_name,
                        path: path.to_string_lossy().to_string(),
                        directory: dir.to_string_lossy().to_string(),
                        format: ext[1..].to_uppercase(),
                        size: meta.len(),
                        size_formatted: format_size(meta.len()),
                        modified,
                    });
                    *found += 1;

                    if batch.len() >= batch_size {
                        on_batch(batch, *found);
                        batch.clear();
                    }
                }
            }
        }
    }
}

// Audio metadata extraction
#[derive(Debug, Clone, serde::Serialize)]
pub struct AudioMetadata {
    #[serde(rename = "fullPath")]
    pub full_path: String,
    #[serde(rename = "fileName")]
    pub file_name: String,
    pub directory: String,
    pub format: String,
    #[serde(rename = "sizeBytes")]
    pub size_bytes: u64,
    pub created: String,
    pub modified: String,
    pub accessed: String,
    pub permissions: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub channels: Option<u16>,
    #[serde(rename = "sampleRate", skip_serializing_if = "Option::is_none")]
    pub sample_rate: Option<u32>,
    #[serde(rename = "bitsPerSample", skip_serializing_if = "Option::is_none")]
    pub bits_per_sample: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

pub fn get_audio_metadata(file_path: &str) -> AudioMetadata {
    let path = Path::new(file_path);
    let meta = match fs::metadata(path) {
        Ok(m) => m,
        Err(e) => {
            return AudioMetadata {
                full_path: file_path.to_string(),
                file_name: String::new(),
                directory: String::new(),
                format: String::new(),
                size_bytes: 0,
                created: String::new(),
                modified: String::new(),
                accessed: String::new(),
                permissions: String::new(),
                channels: None,
                sample_rate: None,
                bits_per_sample: None,
                duration: None,
                error: Some(e.to_string()),
            };
        }
    };

    let ext = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();

    let fmt_time = |t: std::io::Result<std::time::SystemTime>| -> String {
        t.ok()
            .map(|t| {
                let dt: chrono::DateTime<chrono::Utc> = t.into();
                dt.to_rfc3339()
            })
            .unwrap_or_default()
    };

    #[cfg(unix)]
    let permissions = {
        use std::os::unix::fs::PermissionsExt;
        format!("0{:o}", meta.permissions().mode() & 0o777)
    };
    #[cfg(not(unix))]
    let permissions = String::new();

    let mut result = AudioMetadata {
        full_path: file_path.to_string(),
        file_name: path
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default(),
        directory: path
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default(),
        format: ext[1..].to_uppercase(),
        size_bytes: meta.len(),
        created: fmt_time(meta.created()),
        modified: fmt_time(meta.modified()),
        accessed: fmt_time(meta.accessed()),
        permissions,
        channels: None,
        sample_rate: None,
        bits_per_sample: None,
        duration: None,
        error: None,
    };

    // Parse audio headers
    match ext.as_str() {
        ".wav" => parse_wav(path, &mut result),
        ".aiff" | ".aif" => parse_aiff(path, &mut result),
        ".flac" => parse_flac(path, &mut result),
        _ => {}
    }

    result
}

fn parse_wav(path: &Path, meta: &mut AudioMetadata) {
    let mut file = match fs::File::open(path) {
        Ok(f) => f,
        Err(_) => return,
    };
    let mut header = [0u8; 44];
    if file.read_exact(&mut header).is_err() {
        return;
    }

    if &header[0..4] == b"RIFF" && &header[8..12] == b"WAVE" {
        meta.channels = Some(u16::from_le_bytes([header[22], header[23]]));
        meta.sample_rate = Some(u32::from_le_bytes([
            header[24], header[25], header[26], header[27],
        ]));
        let byte_rate = u32::from_le_bytes([header[28], header[29], header[30], header[31]]);
        meta.bits_per_sample = Some(u16::from_le_bytes([header[34], header[35]]));
        let data_size = u32::from_le_bytes([header[40], header[41], header[42], header[43]]);
        if byte_rate > 0 {
            meta.duration = Some(data_size as f64 / byte_rate as f64);
        }
    }
}

fn parse_aiff(path: &Path, meta: &mut AudioMetadata) {
    let mut file = match fs::File::open(path) {
        Ok(f) => f,
        Err(_) => return,
    };
    let mut buf = [0u8; 512];
    let bytes_read = match file.read(&mut buf) {
        Ok(n) => n,
        Err(_) => return,
    };

    if bytes_read < 12 || &buf[0..4] != b"FORM" || &buf[8..12] != b"AIFF" {
        return;
    }

    let mut offset = 12usize;
    while offset + 8 < bytes_read {
        let chunk_id = &buf[offset..offset + 4];
        let chunk_size =
            u32::from_be_bytes([buf[offset + 4], buf[offset + 5], buf[offset + 6], buf[offset + 7]])
                as usize;

        if chunk_id == b"COMM" && offset + 18 < bytes_read {
            meta.channels = Some(u16::from_be_bytes([buf[offset + 8], buf[offset + 9]]));
            let num_frames = u32::from_be_bytes([
                buf[offset + 10],
                buf[offset + 11],
                buf[offset + 12],
                buf[offset + 13],
            ]);
            meta.bits_per_sample = Some(u16::from_be_bytes([buf[offset + 14], buf[offset + 15]]));

            // 80-bit extended float for sample rate
            let exponent = u16::from_be_bytes([buf[offset + 16], buf[offset + 17]]) as i32;
            let mantissa = u32::from_be_bytes([
                buf[offset + 18],
                buf[offset + 19],
                buf[offset + 20],
                buf[offset + 21],
            ]);
            let exp = exponent - 16383 - 31;
            let sample_rate = (mantissa as f64 * 2f64.powi(exp)).round() as u32;
            meta.sample_rate = Some(sample_rate);
            if sample_rate > 0 {
                meta.duration = Some(num_frames as f64 / sample_rate as f64);
            }
            break;
        }

        offset += 8 + chunk_size;
        if chunk_size % 2 != 0 {
            offset += 1;
        }
    }
}

fn parse_flac(path: &Path, meta: &mut AudioMetadata) {
    let mut file = match fs::File::open(path) {
        Ok(f) => f,
        Err(_) => return,
    };
    let mut buf = [0u8; 42];
    if file.read_exact(&mut buf).is_err() {
        return;
    }

    if &buf[0..4] != b"fLaC" {
        return;
    }

    let sample_rate = ((buf[18] as u32) << 12) | ((buf[19] as u32) << 4) | ((buf[20] as u32) >> 4);
    let channels = ((buf[20] >> 1) & 0x07) + 1;
    let bits_per_sample = (((buf[20] & 1) as u16) << 4) | ((buf[21] >> 4) as u16) + 1;

    let total_samples = ((buf[21] & 0x0F) as u64) * (1u64 << 32)
        | ((buf[22] as u64) << 24)
        | ((buf[23] as u64) << 16)
        | ((buf[24] as u64) << 8)
        | (buf[25] as u64);

    meta.sample_rate = Some(sample_rate);
    meta.channels = Some(channels as u16);
    meta.bits_per_sample = Some(bits_per_sample);

    if sample_rate > 0 && total_samples > 0 {
        meta.duration = Some(total_samples as f64 / sample_rate as f64);
    }
}
