//! Scenario-style tests for `history::compute_plugin_diff` (add / remove / combined).

use app_lib::history::{build_plugin_snapshot, compute_plugin_diff};
use app_lib::scanner::PluginInfo;

fn plugin(path: &str, name: &str, ver: &str) -> PluginInfo {
    PluginInfo {
        name: name.to_string(),
        path: path.to_string(),
        plugin_type: "VST3".to_string(),
        version: ver.to_string(),
        manufacturer: "M".to_string(),
        manufacturer_url: None,
        size: "1 MB".to_string(),
        size_bytes: 1,
        modified: "2024-01-01".to_string(),
        architectures: vec![],
    }
}

#[test]
fn diff_detects_single_added_plugin() {
    let old_snap = build_plugin_snapshot(&[], &[], &[]);
    let new_snap = build_plugin_snapshot(&[plugin("/p/a.vst3", "A", "1.0")], &[], &[]);
    let diff = compute_plugin_diff(&old_snap, &new_snap);
    assert_eq!(diff.added.len(), 1);
    assert_eq!(diff.removed.len(), 0);
    assert!(diff.version_changed.is_empty());
    assert_eq!(diff.added[0].name, "A");
}

#[test]
fn diff_detects_single_removed_plugin() {
    let old_snap = build_plugin_snapshot(&[plugin("/p/a.vst3", "A", "1.0")], &[], &[]);
    let new_snap = build_plugin_snapshot(&[], &[], &[]);
    let diff = compute_plugin_diff(&old_snap, &new_snap);
    assert_eq!(diff.removed.len(), 1);
    assert_eq!(diff.added.len(), 0);
    assert_eq!(diff.removed[0].name, "A");
}

#[test]
fn diff_detects_add_remove_and_version_change_together() {
    let old_snap = build_plugin_snapshot(
        &[
            plugin("/p/stays.vst3", "Stays", "1.0"),
            plugin("/p/removed.vst3", "Gone", "1.0"),
        ],
        &[],
        &[],
    );
    let new_snap = build_plugin_snapshot(
        &[
            plugin("/p/stays.vst3", "Stays", "2.0"),
            plugin("/p/new.vst3", "Fresh", "1.0"),
        ],
        &[],
        &[],
    );
    let diff = compute_plugin_diff(&old_snap, &new_snap);
    assert_eq!(diff.removed.len(), 1);
    assert_eq!(diff.removed[0].name, "Gone");
    assert_eq!(diff.added.len(), 1);
    assert_eq!(diff.added[0].name, "Fresh");
    assert_eq!(diff.version_changed.len(), 1);
    assert_eq!(diff.version_changed[0].plugin.name, "Stays");
}
