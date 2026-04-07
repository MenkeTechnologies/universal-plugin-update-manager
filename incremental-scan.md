# Incremental directory scanning

## Behavior (unified scan)

- Each successfully scanned directory is stored in `directory_scan_state` with its modification time (Unix seconds from `metadata(path).modified()`).
- On a later run, before reading a directory’s children, if the stored mtime exists and **current mtime ≤ stored mtime**, the walker **skips** that entire subtree (no `read_dir` for that branch).
- If **current mtime > stored mtime** (or there is no row yet), the directory is fully walked and the row is **updated** after processing that directory.

## Limitations

- **Directory mtime** does not always change when a file inside is edited in place; some OS/filesystem combinations only bump the **file** mtime. Unchanged directory mtime can miss in-place edits. Set `incrementalDirectoryScan` to `off` in preferences for a full tree walk when you need that guarantee.
- **Symlinks / canonical paths**: Keys use the same normalization as the walker’s visit deduplication (`canonicalize` when possible).
- **Per-scan “new files” in History**: Listing only the files first seen in a given `scan_id` requires append-only inserts (no wholesale replace per scan) and optional columns such as `discovered_in_scan_id`. The directory layer is the prerequisite; file-level history UI is a separate follow-up.

## Preference

- `incrementalDirectoryScan` — when `off`, directory snapshots are ignored and every scan is a full tree walk. Default in `config.default.toml`: `on` (`[scanning]`).

## SQLite inventory (main UI)

When queries do not pass a specific `scan_id`, the app treats the database as a **library**: one canonical row per filesystem `path` (the row with the largest `id` for that path). New scans append rows; the UI aggregates across all scans without dropping prior paths. Analysis fields (BPM, key, LUFS) and cache stats for those columns use the same library scope; updates apply by `path` so duplicate rows from different scans stay consistent. History or drill-down APIs that pass an explicit `scan_id` still restrict to that scan only.
