//! Directory names skipped during recursive filesystem scans.
//!
//! Audio, DAW, preset, PDF, and unified walkers match on the **final path
//! component** (case-sensitive on POSIX). Traversal sites also skip any name
//! starting with `.` (hidden) or `@` (Synology NAS). This list names additional
//! non-hidden directories that are almost never user media (dependency trees,
//! build caches, OS metadata).

pub const SCANNER_SKIP_DIRS: &[&str] = &[
    "node_modules",
    "bower_components",
    ".git",
    ".Trash",
    "$RECYCLE.BIN",
    "#recycle",
    "System Volume Information",
    "lost+found",
    ".cache",
    "__pycache__",
    "__pypackages__",
    // Never contain user audio/preset/pdf/daw content.
    "Caches",           // ~/Library/Caches, /Library/Caches, app caches
    "DerivedData",      // Xcode build artifacts
    "Backups.backupdb", // Time Machine bundle
    "__MACOSX",         // zip-extract artifact
    "target",           // Rust/Cargo (and some other tools) build output
    "Pods",             // CocoaPods
    "vendor",           // Composer, Bundler, etc.
    // Synology NAS (`#recycle` already listed). `@`-prefixed dirs use traversal guard.
    "#snapshot",
];

#[cfg(test)]
mod tests {
    use super::SCANNER_SKIP_DIRS;

    #[test]
    fn skip_dirs_contains_core_junk_and_build_artifacts() {
        for d in [
            "node_modules",
            "bower_components",
            ".git",
            "Caches",
            "DerivedData",
            "target",
            "Pods",
            "vendor",
            "lost+found",
            "__pypackages__",
            "#snapshot",
        ] {
            assert!(
                SCANNER_SKIP_DIRS.contains(&d),
                "SCANNER_SKIP_DIRS should contain {:?}",
                d
            );
        }
    }

    #[test]
    fn skip_dirs_has_no_duplicates() {
        let mut seen = std::collections::HashSet::new();
        for &d in SCANNER_SKIP_DIRS {
            assert!(seen.insert(d), "duplicate skip dir entry: {:?}", d);
        }
    }
}
