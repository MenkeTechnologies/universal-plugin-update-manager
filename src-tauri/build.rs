use std::path::Path;
use std::process::Command;

fn read_package_json_version(repo_root: &Path) -> Option<String> {
    let pkg = repo_root.join("package.json");
    let contents = std::fs::read_to_string(&pkg).ok()?;
    let json: serde_json::Value = serde_json::from_str(&contents).ok()?;
    json.get("version")?.as_str().map(|s| s.to_string())
}

fn git_first_line(repo_root: &Path, args: &[&str]) -> Option<String> {
    let out = Command::new("git")
        .current_dir(repo_root)
        .args(args)
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    (!s.is_empty()).then_some(s)
}

fn main() {
    // Cargo sets `TARGET` only for build scripts; `lib.rs` cannot see it via `option_env!` unless we forward it.
    println!(
        "cargo:rustc-env=AUDIO_HAXOR_TARGET_TRIPLE={}",
        std::env::var("TARGET").expect("Cargo sets TARGET when running build.rs")
    );

    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let repo_root = manifest_dir.parent().unwrap_or(manifest_dir);

    if let Some(ver) = read_package_json_version(repo_root) {
        println!("cargo:rustc-env=CARGO_PKG_VERSION={ver}");
    }
    println!("cargo:rerun-if-changed=../package.json");

    let full =
        git_first_line(repo_root, &["rev-parse", "HEAD"]).unwrap_or_else(|| "unknown".to_string());
    let short = if full == "unknown" || full.len() < 7 {
        full.clone()
    } else {
        full[..7].to_string()
    };
    let date = git_first_line(repo_root, &["log", "-1", "--format=%cI"]).unwrap_or_default();

    println!("cargo:rustc-env=AUDIO_HAXOR_GIT_SHA_FULL={full}");
    println!("cargo:rustc-env=AUDIO_HAXOR_GIT_SHA_SHORT={short}");
    println!("cargo:rustc-env=AUDIO_HAXOR_GIT_COMMIT_DATE={date}");

    let git_head = repo_root.join(".git/HEAD");
    if git_head.is_file() {
        println!("cargo:rerun-if-changed={}", git_head.display());
    }

    // Skip tauri_build when TAURI_SKIP_BUILD=1 — it embeds a Windows GUI manifest that causes
    // STATUS_ENTRYPOINT_NOT_FOUND (0xC0000139) when running `cargo test` in a console context.
    // CI sets this for test runs; normal builds and `pnpm tauri build/dev` leave it unset.
    // See: https://github.com/orgs/tauri-apps/discussions/11179
    if std::env::var("TAURI_SKIP_BUILD").is_err() {
        tauri_build::build();
    }
}
