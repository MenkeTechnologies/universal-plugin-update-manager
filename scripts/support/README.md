# `scripts/support/` — required-but-empty stub for `bundle_dmg.sh`

This directory exists solely to satisfy a hardcoded existence check in
`scripts/bundle_dmg.sh` (the create-dmg / Tauri-vendored DMG bundler):

```bash
if [[ ! -d "$CDMG_SUPPORT_DIR" ]]; then
    echo >&2 "Cannot find support/ directory: expected at: $CDMG_SUPPORT_DIR"
    exit 1
fi
```

The script also requires a sentinel file `scripts/.this-is-the-create-dmg-repo`
to make it look for `support/` next to itself instead of at
`/usr/local/share/create-dmg/support/`.

## Why empty?

`bundle_dmg.sh` only **reads** files inside `support/` for two features we
don't use in `scripts/postbundle-audio-engine-helper.sh`:

- `template.applescript` — used only when bundling **without** `--skip-jenkins`,
  to position the `.app` icon and `/Applications` drop link via AppleScript /
  Finder. We pass `--skip-jenkins` (same flag Tauri uses) because the script is
  invoked from a non-GUI context where the AppleScript tends to fail.
- `eula-resources-template.xml` — used only when bundling with `--eula <file>`.
  We don't ship a EULA.

So the directory just needs to exist; its contents are never read. If you ever
want to enable the AppleScript prettify step (drop `--skip-jenkins`), download
[`template.applescript`](https://github.com/create-dmg/create-dmg/blob/master/support/template.applescript)
into this directory. Same for the EULA template if you ever add a license file.

Do not delete this file or the parent directory — it would break `pnpm nuke`,
`pnpm rebuild`, and `pnpm build` on macOS.
