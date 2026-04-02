//! Audio similarity search via spectral fingerprinting.
//!
//! Computes a feature vector for each audio file using fast energy-band
//! analysis (no DFT needed). Compares fingerprints using euclidean distance
//! to find similar-sounding samples. Fingerprints are cached to avoid
//! recomputation.

use serde::{Deserialize, Serialize};
use std::path::Path;

/// Audio fingerprint — a compact feature vector for similarity comparison.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioFingerprint {
    pub path: String,
    pub rms: f64,
    pub spectral_centroid: f64,
    pub zero_crossing_rate: f64,
    pub low_band_energy: f64,
    pub mid_band_energy: f64,
    pub high_band_energy: f64,
    pub low_energy_ratio: f64,
    pub attack_time: f64,
}

/// Compute a fingerprint for an audio file using fast energy-band analysis.
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
    let s = if samples.len() > max_samples { &samples[..max_samples] } else { &samples };
    let n = s.len() as f64;
    let sr = sample_rate as f64;

    // RMS energy
    let rms = (s.iter().map(|&x| (x as f64) * (x as f64)).sum::<f64>() / n).sqrt();

    // Zero-crossing rate
    let mut zc = 0usize;
    for i in 1..s.len() {
        if (s[i] >= 0.0) != (s[i - 1] >= 0.0) { zc += 1; }
    }
    let zero_crossing_rate = zc as f64 / n;

    // Spectral centroid approximation via zero-crossing rate
    // ZCR is proportional to spectral centroid for many signals
    let spectral_centroid = zero_crossing_rate * sr / 2.0;

    // Energy in 3 frequency bands using bandpass via averaging
    // Low: 0-300Hz, Mid: 300-3000Hz, High: 3000Hz+
    // Approximate by splitting samples into blocks and measuring energy
    let frame_size = (sr / 50.0) as usize; // ~20ms frames
    let mut low_e = 0.0f64;
    let mut mid_e = 0.0f64;
    let mut high_e = 0.0f64;
    let mut frame_count = 0usize;

    for chunk in s.chunks(frame_size) {
        if chunk.len() < 4 { continue; }
        frame_count += 1;

        // Simple 3-band energy split using differences
        // Low-pass: running average (smoothed)
        // High-pass: sample - running average
        let mut lp = 0.0f32;
        let alpha_low = 0.05f32;  // ~300Hz cutoff at 44.1kHz
        let alpha_high = 0.7f32;  // ~3kHz cutoff
        let mut low_sum = 0.0f64;
        let mut mid_sum = 0.0f64;
        let mut high_sum = 0.0f64;

        let mut lp_slow = 0.0f32;
        for &x in chunk {
            lp = lp + alpha_low * (x - lp);           // low-pass ~300Hz
            lp_slow = lp_slow + alpha_high * (x - lp_slow); // low-pass ~3kHz
            let low = lp as f64;
            let mid = (lp_slow - lp) as f64;
            let high = (x - lp_slow) as f64;
            low_sum += low * low;
            mid_sum += mid * mid;
            high_sum += high * high;
        }
        low_e += low_sum / chunk.len() as f64;
        mid_e += mid_sum / chunk.len() as f64;
        high_e += high_sum / chunk.len() as f64;
    }

    let _fc = frame_count.max(1) as f64;
    let total_e = (low_e + mid_e + high_e).max(1e-10);
    let low_band_energy = low_e / total_e;
    let mid_band_energy = mid_e / total_e;
    let high_band_energy = high_e / total_e;

    // Low energy ratio
    let mut frame_energies = Vec::new();
    for chunk in s.chunks(1024) {
        let e: f64 = chunk.iter().map(|&x| (x as f64) * (x as f64)).sum::<f64>() / chunk.len() as f64;
        frame_energies.push(e);
    }
    let avg_energy = frame_energies.iter().sum::<f64>() / frame_energies.len().max(1) as f64;
    let low_energy_ratio = frame_energies.iter().filter(|&&e| e < avg_energy).count() as f64
        / frame_energies.len().max(1) as f64;

    // Attack time: how quickly the signal reaches peak energy
    let env_size = 256;
    let mut envelope = Vec::new();
    for chunk in s.chunks(env_size) {
        let peak = chunk.iter().map(|&x| x.abs()).fold(0.0f32, f32::max);
        envelope.push(peak as f64);
    }
    let peak_val = envelope.iter().cloned().fold(0.0f64, f64::max).max(1e-10);
    let attack_threshold = peak_val * 0.9;
    let attack_time = envelope.iter().position(|&e| e >= attack_threshold)
        .map(|i| i as f64 * env_size as f64 / sr)
        .unwrap_or(1.0);

    Some(AudioFingerprint {
        path: file_path.to_string(),
        rms,
        spectral_centroid,
        zero_crossing_rate,
        low_band_energy,
        mid_band_energy,
        high_band_energy,
        low_energy_ratio,
        attack_time,
    })
}

/// Compute distance between two fingerprints (lower = more similar).
pub fn fingerprint_distance(a: &AudioFingerprint, b: &AudioFingerprint) -> f64 {
    let norm = |va: f64, vb: f64, max: f64| -> f64 {
        let da = va / max.max(1e-10);
        let db = vb / max.max(1e-10);
        (da - db) * (da - db)
    };

    let d = norm(a.rms, b.rms, 1.0)
        + norm(a.spectral_centroid, b.spectral_centroid, 10000.0)
        + norm(a.zero_crossing_rate, b.zero_crossing_rate, 0.5)
        + norm(a.low_band_energy, b.low_band_energy, 1.0)
        + norm(a.mid_band_energy, b.mid_band_energy, 1.0)
        + norm(a.high_band_energy, b.high_band_energy, 1.0)
        + norm(a.low_energy_ratio, b.low_energy_ratio, 1.0)
        + norm(a.attack_time, b.attack_time, 2.0);

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
