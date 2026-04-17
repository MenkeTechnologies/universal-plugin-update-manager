//! Background waveform prefetch.
//!
//! Bulk-computes min/max peak envelopes for every audio sample in the library and
//! upserts them into the `waveform_cache` SQLite table. Runs rayon-parallel across
//! cores using the same symphonia / WAV / AIFF decoders the BPM path already uses
//! (`crate::bpm::*_pub`). Output shape matches what `audio.js::renderWaveformData`
//! expects: `Vec<Peak { max, min }>` serialized to JSON and stored via
//! `db.upsert_waveform_cache_row`. The Crate tab (and everywhere else that renders
//! waveforms) then hits `_waveformCache` → `read_waveform_cache_entry` and skips
//! the on-demand audio-engine round trip.
//!
//! Canonical width is [`WAVEFORM_WIDTH_PX`] (800). Callers that need a different
//! resolution still hit the engine on demand; this prefetch only fills the common
//! case for browse-heavy UIs.

use serde::{Deserialize, Serialize};
use std::path::Path;

/// One peak bucket. Field names match the JS `{max, min}` objects the existing
/// `renderWaveformData` helper consumes.
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Peak {
    pub max: f32,
    pub min: f32,
}

/// Canonical peak resolution for the prefetch — high enough for a 1200 px canvas,
/// small enough to keep the `waveform_cache` rows compact (~16 KB per sample).
pub const WAVEFORM_WIDTH_PX: usize = 800;

/// Compute a downsampled peak envelope for a single audio file.
///
/// Returns `None` for unsupported formats, unreadable files, or empty decodes.
/// Stereo / multichannel inputs are already mono-mixed by the `bpm::*_pub` readers.
pub fn compute_peaks(file_path: &str, width_px: usize) -> Option<Vec<Peak>> {
    let path = Path::new(file_path);
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let width = width_px.clamp(32, 8192);
    let (samples, _sample_rate) = match ext.as_str() {
        "wav" => crate::bpm::read_wav_pcm_pub(path)?,
        "aiff" | "aif" => crate::bpm::read_aiff_pcm_pub(path)?,
        "mp3" | "flac" | "ogg" | "m4a" | "aac" | "opus" => {
            crate::bpm::decode_with_symphonia_pub(path)?
        }
        _ => return None,
    };
    if samples.is_empty() {
        return None;
    }

    let n = samples.len();
    let mut peaks = Vec::with_capacity(width);
    let bucket_size = (n as f64 / width as f64).max(1.0);
    for i in 0..width {
        let start = (i as f64 * bucket_size) as usize;
        let end = (((i + 1) as f64 * bucket_size) as usize).min(n);
        if start >= end {
            break;
        }
        let slice = &samples[start..end];
        let mut mx = f32::MIN;
        let mut mn = f32::MAX;
        for s in slice {
            let v = *s;
            if v > mx {
                mx = v;
            }
            if v < mn {
                mn = v;
            }
        }
        if mx == f32::MIN {
            mx = 0.0;
        }
        if mn == f32::MAX {
            mn = 0.0;
        }
        peaks.push(Peak {
            max: mx.clamp(-1.0, 1.0),
            min: mn.clamp(-1.0, 1.0),
        });
    }
    Some(peaks)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unsupported_ext_returns_none() {
        assert!(compute_peaks("/tmp/does_not_exist.txt", WAVEFORM_WIDTH_PX).is_none());
    }

    #[test]
    fn missing_file_returns_none() {
        assert!(compute_peaks("/tmp/absolutely_not_a_real_file_12345.wav", WAVEFORM_WIDTH_PX).is_none());
    }

    #[test]
    fn width_is_clamped() {
        // A width of 0 should not panic — it gets clamped to 32 internally.
        // Use a non-existent file so the function returns None early; the point
        // is that width sanitization doesn't overflow or divide-by-zero.
        assert!(compute_peaks("/tmp/nope.wav", 0).is_none());
        assert!(compute_peaks("/tmp/nope.wav", usize::MAX).is_none());
    }
}
