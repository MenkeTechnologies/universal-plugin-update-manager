//! Separate **audio-engine** process: output device discovery (via cpal) and stubs for future
//! real-time I/O and plugin hosting. Invoked by the main app with one JSON line on stdin; responds
//! with one JSON line on stdout.

use std::collections::HashMap;

use cpal::traits::{DeviceTrait, HostTrait};
use cpal::Device;
use serde::{Deserialize, Serialize};
use serde_json::json;

const ENGINE_VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Debug, Deserialize)]
struct Request {
    cmd: String,
    #[serde(default)]
    device_id: Option<String>,
}

#[derive(Debug, Serialize)]
struct OutputDeviceInfo {
    id: String,
    name: String,
    is_default: bool,
}

fn main() {
    let mut line = String::new();
    if let Err(e) = std::io::stdin().read_line(&mut line) {
        eprintln!("audio-engine: stdin read failed: {e}");
        std::process::exit(1);
    }
    let trimmed = line.trim();
    if trimmed.is_empty() {
        eprintln!("audio-engine: empty request");
        std::process::exit(1);
    }
    let req: Request = match serde_json::from_str(trimmed) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("audio-engine: bad JSON: {e}");
            std::process::exit(1);
        }
    };
    let resp = match dispatch(&req) {
        Ok(v) => v,
        Err(msg) => json!({ "ok": false, "error": msg }),
    };
    println!("{}", resp);
}

fn dispatch(req: &Request) -> Result<serde_json::Value, String> {
    match req.cmd.as_str() {
        "ping" => Ok(json!({
            "ok": true,
            "version": ENGINE_VERSION,
            "host": cpal::default_host().id().name(),
        })),
        "list_output_devices" => list_output_devices(),
        "get_output_device_info" => get_output_device_info(req.device_id.as_deref()),
        "set_output_device" => set_output_device(req.device_id.as_deref()),
        "plugin_chain" => Ok(json!({
            "ok": true,
            "slots": [],
            "note": "plugin hosting will attach here",
        })),
        other => Err(format!("unknown cmd: {other}")),
    }
}

/// Stable id across one enumeration pass: first "Name", then "Name#2", "Name#3", …
fn unique_device_id(name: &str, seen: &mut HashMap<String, u32>) -> String {
    let n = seen.entry(name.to_string()).or_insert(0);
    *n += 1;
    if *n == 1 {
        name.to_string()
    } else {
        format!("{name}#{}", n)
    }
}

fn list_output_devices() -> Result<serde_json::Value, String> {
    let rows = enumerate_output_devices()?;
    let default_id = rows.iter().find(|d| d.is_default).map(|d| d.id.clone());

    Ok(json!({
        "ok": true,
        "default_device_id": default_id,
        "devices": rows,
    }))
}

fn enumerate_output_devices() -> Result<Vec<OutputDeviceInfo>, String> {
    let host = cpal::default_host();
    let default_dev = host.default_output_device();
    let default_name = default_dev.as_ref().and_then(|d| d.name().ok());

    let mut seen = HashMap::new();
    let mut out = Vec::new();

    for (i, dev) in host
        .output_devices()
        .map_err(|e| format!("cpal output_devices: {e}"))?
        .enumerate()
    {
        let name = dev.name().unwrap_or_else(|_| format!("device {i}"));
        let id = unique_device_id(&name, &mut seen);
        let is_default = default_name
            .as_ref()
            .map(|dn| dn == &name)
            .unwrap_or(false);
        out.push(OutputDeviceInfo {
            id,
            name,
            is_default,
        });
    }

    Ok(out)
}

fn find_output_device_by_id(id: &str) -> Result<Device, String> {
    let host = cpal::default_host();

    // Legacy: numeric index (same ordering as enumeration without id dedup — approximate).
    if let Ok(idx) = id.parse::<usize>() {
        let list: Vec<_> = host
            .output_devices()
            .map_err(|e| format!("cpal output_devices: {e}"))?
            .collect();
        return list
            .into_iter()
            .nth(idx)
            .ok_or_else(|| format!("device_id out of range: {id}"));
    }

    let mut seen = HashMap::new();
    for dev in host
        .output_devices()
        .map_err(|e| format!("cpal output_devices: {e}"))?
    {
        let name = dev.name().unwrap_or_else(|_| String::new());
        let uid = unique_device_id(&name, &mut seen);
        if uid == id {
            return Ok(dev);
        }
    }
    Err(format!("unknown device_id: {id}"))
}

fn get_output_device_info(device_id: Option<&str>) -> Result<serde_json::Value, String> {
    let device = match device_id.filter(|s| !s.is_empty()) {
        None => cpal::default_host()
            .default_output_device()
            .ok_or_else(|| "no default output device".to_string())?,
        Some(id) => find_output_device_by_id(id)?,
    };

    let name = device.name().unwrap_or_default();
    let cfg = device
        .default_output_config()
        .map_err(|e| format!("default_output_config: {e}"))?;

    let mut rate_min = None::<u32>;
    let mut rate_max = None::<u32>;
    if let Ok(mut configs) = device.supported_output_configs() {
        for range in configs.by_ref() {
            let mn = range.min_sample_rate().0;
            let mx = range.max_sample_rate().0;
            rate_min = Some(rate_min.map_or(mn, |a: u32| a.min(mn)));
            rate_max = Some(rate_max.map_or(mx, |a: u32| a.max(mx)));
        }
    }

    let mut j = json!({
        "ok": true,
        "device_name": name,
        "sample_rate_hz": cfg.sample_rate().0,
        "channels": cfg.channels(),
        "sample_format": format!("{:?}", cfg.sample_format()),
    });
    if let (Some(lo), Some(hi)) = (rate_min, rate_max) {
        j.as_object_mut().unwrap().insert(
            "sample_rate_range_hz".to_string(),
            json!({ "min": lo, "max": hi }),
        );
    }
    Ok(j)
}

fn set_output_device(device_id: Option<&str>) -> Result<serde_json::Value, String> {
    let Some(id) = device_id.filter(|s| !s.is_empty()) else {
        return Err("device_id required".to_string());
    };
    let _device = find_output_device_by_id(id)?;
    Ok(json!({
        "ok": true,
        "device_id": id,
        "note": "selection stored by UI; real-time stream not started yet",
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unique_device_id_counts_duplicates() {
        let mut seen = HashMap::new();
        assert_eq!(unique_device_id("A", &mut seen), "A");
        assert_eq!(unique_device_id("A", &mut seen), "A#2");
        assert_eq!(unique_device_id("A", &mut seen), "A#3");
        assert_eq!(unique_device_id("B", &mut seen), "B");
    }
}
