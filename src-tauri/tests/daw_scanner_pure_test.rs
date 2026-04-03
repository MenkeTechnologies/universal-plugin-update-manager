//! Pure helpers from `daw_scanner` (extension matching, display names) — no filesystem walks.

use std::path::Path;

use app_lib::daw_scanner::{daw_name_for_format, ext_matches, is_package_ext};

#[test]
fn ext_matches_recognizes_common_daw_suffixes() {
    assert_eq!(
        ext_matches(Path::new("/p/MyProject.als")).as_deref(),
        Some("ALS")
    );
    assert_eq!(
        ext_matches(Path::new("/p/Session.bwproject")).as_deref(),
        Some("BWPROJECT")
    );
    assert_eq!(
        ext_matches(Path::new("/p/backup.RPP-BAK")).as_deref(),
        Some("RPP-BAK")
    );
    assert_eq!(ext_matches(Path::new("/p/foo.txt")), None);
}

#[test]
fn is_package_ext_logicx_and_band_only() {
    assert!(is_package_ext(Path::new("/Music/Beat.logicx")));
    assert!(is_package_ext(Path::new("/Music/Song.band")));
    assert!(!is_package_ext(Path::new("/p/x.als")));
}

#[test]
fn daw_name_for_format_maps_and_unknown_fallback() {
    assert_eq!(daw_name_for_format("ALS"), "Ableton Live");
    assert_eq!(daw_name_for_format("RPP"), "REAPER");
    assert_eq!(daw_name_for_format("RPP-BAK"), "REAPER");
    assert_eq!(daw_name_for_format("DAWPROJECT"), "DAWproject");
    assert_eq!(daw_name_for_format("NOT_A_FORMAT"), "Unknown");
}

/// Every suffix registered in `daw_scanner::DAW_EXTENSIONS` must map through `ext_matches`
/// and `daw_name_for_format` without returning "Unknown".
#[test]
fn ext_matches_and_names_cover_all_registered_suffixes() {
    const PAIRS: &[(&str, &str, &str)] = &[
        (".als", "ALS", "Ableton Live"),
        (".logicx", "LOGICX", "Logic Pro"),
        (".flp", "FLP", "FL Studio"),
        (".cpr", "CPR", "Cubase"),
        (".npr", "NPR", "Nuendo"),
        (".bwproject", "BWPROJECT", "Bitwig Studio"),
        (".rpp", "RPP", "REAPER"),
        (".rpp-bak", "RPP-BAK", "REAPER"),
        (".ptx", "PTX", "Pro Tools"),
        (".ptf", "PTF", "Pro Tools"),
        (".song", "SONG", "Studio One"),
        (".reason", "REASON", "Reason"),
        (".aup", "AUP", "Audacity"),
        (".aup3", "AUP3", "Audacity"),
        (".band", "BAND", "GarageBand"),
        (".ardour", "ARDOUR", "Ardour"),
        (".dawproject", "DAWPROJECT", "DAWproject"),
    ];
    for (ext, code, daw) in PAIRS {
        let path = Path::new("/tmp").join(format!("project{}", ext));
        assert_eq!(
            ext_matches(&path).as_deref(),
            Some(*code),
            "ext_matches should recognize *{}",
            ext
        );
        assert_eq!(daw_name_for_format(code), *daw);
    }
}

#[test]
fn ext_matches_is_case_insensitive_on_file_name() {
    assert_eq!(
        ext_matches(Path::new("/p/MySession.ALS")).as_deref(),
        Some("ALS")
    );
    assert_eq!(ext_matches(Path::new("/p/Mix.FLP")).as_deref(), Some("FLP"));
}

#[test]
fn ext_matches_recognizes_reaper_backup_suffix() {
    assert_eq!(
        ext_matches(Path::new("/backups/song.RPP-BAK")).as_deref(),
        Some("RPP-BAK")
    );
}

#[test]
fn ext_matches_distinguishes_aup_and_aup3() {
    assert_eq!(
        ext_matches(Path::new("/a/legacy.aup")).as_deref(),
        Some("AUP")
    );
    assert_eq!(
        ext_matches(Path::new("/a/new.aup3")).as_deref(),
        Some("AUP3")
    );
}

#[test]
fn daw_name_for_format_covers_remaining_branches() {
    assert_eq!(daw_name_for_format("PTX"), "Pro Tools");
    assert_eq!(daw_name_for_format("PTF"), "Pro Tools");
    assert_eq!(daw_name_for_format("NPR"), "Nuendo");
    assert_eq!(daw_name_for_format("BWPROJECT"), "Bitwig Studio");
    assert_eq!(daw_name_for_format("SONG"), "Studio One");
    assert_eq!(daw_name_for_format("REASON"), "Reason");
    assert_eq!(daw_name_for_format("AUP"), "Audacity");
    assert_eq!(daw_name_for_format("AUP3"), "Audacity");
    assert_eq!(daw_name_for_format("BAND"), "GarageBand");
    assert_eq!(daw_name_for_format("ARDOUR"), "Ardour");
}

#[test]
fn ext_matches_empty_path_returns_none() {
    assert_eq!(ext_matches(Path::new("")), None);
}

#[test]
fn is_package_ext_case_insensitive() {
    assert!(is_package_ext(Path::new("/Music/Beat.LOGICX")));
    assert!(is_package_ext(Path::new("/Music/Song.BAND")));
}

#[test]
fn ext_matches_accepts_dotdot_before_extension() {
    assert_eq!(
        ext_matches(Path::new("/tmp/foo..als")).as_deref(),
        Some("ALS")
    );
}
