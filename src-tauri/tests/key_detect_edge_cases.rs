//! Key detection: `detect_key` handles missing or non-audio paths.

use app_lib::key_detect::detect_key;

#[test]
fn detect_key_nonexistent_file_returns_none() {
    assert!(detect_key("/nonexistent/audio_haxor/key.wav").is_none());
}

#[test]
fn detect_key_plain_text_file_returns_none() {
    let p = std::env::temp_dir().join("audio_haxor_not_audio.keytest");
    std::fs::write(&p, b"hello").unwrap();
    let path = p.to_string_lossy().to_string();
    assert!(detect_key(&path).is_none());
    let _ = std::fs::remove_file(&p);
}
