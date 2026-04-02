//! Audio similarity search via spectral fingerprinting.
//!
//! Computes a feature vector for each audio file (spectral centroid,
//! RMS energy, zero-crossing rate, spectral flatness, spectral rolloff)
//! from the first 10 seconds of decoded PCM. Compares fingerprints using
//! euclidean distance to find similar-sounding samples.

use serde::{Deserialize, Serialize};
use std::path::Path;

/// Audio fingerprint — a compact feature vector for similarity comparison.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioFingerprint {
    pub path: String,
    pub rms: f64,
    pub spectral_centroid: f64,
    pub spectral_spread: f64,
    pub zero_crossing_rate: f64,
    pub spectral_flatness: f64,
    pub spectral_rolloff: f64,
    pub low_energy_ratio: f64,
}

/// Compute a fingerprint for an audio file.
pub fn compute_fingerprint(file_path: &str) -> Option<AudioFingerprint> {
    let path = Path::new(file_path);
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();

    let (samples, sample_rate) = match ext.as_str() {
        "wav" => crate::bpm::read_wav_pcm_pub(path)?,
        "aiff" | "aif" => crate::bpm::read_aiff_pcm_pub(path)?,
        "mp3" | "flac" | "ogg" | "m4a" | "aac" | "opus" => {
            crate::bpm::decode_with_symphonia_pub(path)?
        }
        _ => return None,
    };

    if samples.len() < 1024 || sample_rate == 0 {
        return None;
    }

    // Use first 10 seconds max
    let max_samples = (sample_rate as usize) * 10;
    let samples = if samples.len() > max_samples {
        &samples[..max_samples]
    } else {
        &samples
    };

    let n = samples.len() as f64;

    // RMS energy
    let rms = (samples.iter().map(|&s| (s as f64) * (s as f64)).sum::<f64>() / n).sqrt();

    // Zero-crossing rate
    let mut zc = 0usize;
    for i in 1..samples.len() {
        if (samples[i] >= 0.0) != (samples[i - 1] >= 0.0) {
            zc += 1;
        }
    }
    let zero_crossing_rate = zc as f64 / n;

    // Low energy ratio (fraction of frames with below-average energy)
    let frame_size = 1024;
    let mut frame_energies = Vec::new();
    for chunk in samples.chunks(frame_size) {
        let energy: f64 = chunk.iter().map(|&s| (s as f64) * (s as f64)).sum::<f64>() / chunk.len() as f64;
        frame_energies.push(energy);
    }
    let avg_energy = frame_energies.iter().sum::<f64>() / frame_energies.len().max(1) as f64;
    let low_energy_ratio = frame_energies.iter().filter(|&&e| e < avg_energy).count() as f64
        / frame_energies.len().max(1) as f64;

    // Spectral features via simple DFT on overlapping frames
    let fft_size = 2048;
    let hop = fft_size / 2;
    let mut centroids = Vec::new();
    let mut spreads = Vec::new();
    let mut flatnesses = Vec::new();
    let mut rolloffs = Vec::new();

    let mut i = 0;
    while i + fft_size <= samples.len() {
        let frame = &samples[i..i + fft_size];

        // Compute magnitude spectrum (real DFT approximation via squared magnitudes)
        let mut magnitudes = vec![0.0f64; fft_size / 2];
        for k in 0..fft_size / 2 {
            let freq = k as f64;
            let mut re = 0.0f64;
            let mut im = 0.0f64;
            for (n_idx, &s) in frame.iter().enumerate() {
                let angle = 2.0 * std::f64::consts::PI * freq * n_idx as f64 / fft_size as f64;
                re += (s as f64) * angle.cos();
                im -= (s as f64) * angle.sin();
            }
            magnitudes[k] = (re * re + im * im).sqrt();
        }

        let total_mag: f64 = magnitudes.iter().sum::<f64>().max(1e-10);

        // Spectral centroid (weighted mean frequency)
        let centroid: f64 = magnitudes
            .iter()
            .enumerate()
            .map(|(k, &m)| k as f64 * m)
            .sum::<f64>()
            / total_mag;
        centroids.push(centroid);

        // Spectral spread (weighted std dev)
        let spread: f64 = (magnitudes
            .iter()
            .enumerate()
            .map(|(k, &m)| {
                let d = k as f64 - centroid;
                d * d * m
            })
            .sum::<f64>()
            / total_mag)
            .sqrt();
        spreads.push(spread);

        // Spectral flatness (geometric mean / arithmetic mean)
        let log_sum: f64 = magnitudes.iter().map(|&m| (m + 1e-10).ln()).sum::<f64>();
        let geo_mean = (log_sum / magnitudes.len() as f64).exp();
        let arith_mean = total_mag / magnitudes.len() as f64;
        flatnesses.push(geo_mean / arith_mean.max(1e-10));

        // Spectral rolloff (85% of energy)
        let threshold = total_mag * 0.85;
        let mut cumsum = 0.0;
        let mut rolloff_bin = magnitudes.len() - 1;
        for (k, &m) in magnitudes.iter().enumerate() {
            cumsum += m;
            if cumsum >= threshold {
                rolloff_bin = k;
                break;
            }
        }
        rolloffs.push(rolloff_bin as f64 * sample_rate as f64 / fft_size as f64);

        i += hop;
    }

    if centroids.is_empty() {
        return None;
    }

    let mean = |v: &[f64]| v.iter().sum::<f64>() / v.len() as f64;

    // Normalize centroid to Hz
    let spectral_centroid = mean(&centroids) * sample_rate as f64 / fft_size as f64;

    Some(AudioFingerprint {
        path: file_path.to_string(),
        rms,
        spectral_centroid,
        spectral_spread: mean(&spreads),
        zero_crossing_rate,
        spectral_flatness: mean(&flatnesses),
        spectral_rolloff: mean(&rolloffs),
        low_energy_ratio,
    })
}

/// Compute distance between two fingerprints (lower = more similar).
pub fn fingerprint_distance(a: &AudioFingerprint, b: &AudioFingerprint) -> f64 {
    // Normalize each feature to [0,1] range using typical audio ranges
    let norm = |va: f64, vb: f64, max: f64| -> f64 {
        let da = va / max;
        let db = vb / max;
        (da - db) * (da - db)
    };

    let d = norm(a.rms, b.rms, 1.0)
        + norm(a.spectral_centroid, b.spectral_centroid, 10000.0)
        + norm(a.spectral_spread, b.spectral_spread, 500.0)
        + norm(a.zero_crossing_rate, b.zero_crossing_rate, 0.5)
        + norm(a.spectral_flatness, b.spectral_flatness, 1.0)
        + norm(a.spectral_rolloff, b.spectral_rolloff, 20000.0)
        + norm(a.low_energy_ratio, b.low_energy_ratio, 1.0);

    d.sqrt()
}

/// Find the N most similar samples to a reference fingerprint.
pub fn find_similar(
    reference: &AudioFingerprint,
    candidates: &[AudioFingerprint],
    max_results: usize,
) -> Vec<(String, f64)> {
    let mut scored: Vec<(String, f64)> = candidates
        .iter()
        .filter(|c| c.path != reference.path)
        .map(|c| (c.path.clone(), fingerprint_distance(reference, c)))
        .collect();

    scored.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    scored.truncate(max_results);
    scored
}
