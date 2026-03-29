use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::Path;

fn mime_for_ext(ext: &str) -> &str {
    match ext {
        "wav" => "audio/wav",
        "mp3" => "audio/mpeg",
        "ogg" => "audio/ogg",
        "flac" => "audio/flac",
        "aac" => "audio/aac",
        "m4a" => "audio/mp4",
        "aiff" | "aif" => "audio/aiff",
        "opus" => "audio/opus",
        "wma" => "audio/x-ms-wma",
        _ => "application/octet-stream",
    }
}

pub fn start() -> u16 {
    let listener = TcpListener::bind("127.0.0.1:0").expect("failed to bind audio server");
    let port = listener.local_addr().unwrap().port();

    std::thread::spawn(move || {
        for stream in listener.incoming() {
            let mut stream = match stream {
                Ok(s) => s,
                Err(_) => continue,
            };

            // Read request
            let mut buf = [0u8; 4096];
            let n = match stream.read(&mut buf) {
                Ok(n) => n,
                Err(_) => continue,
            };
            let request = String::from_utf8_lossy(&buf[..n]);

            // Parse path from "GET /audio?path=... HTTP/1.1"
            let file_path = match extract_path(&request) {
                Some(p) => p,
                None => {
                    let _ = stream.write_all(b"HTTP/1.1 400 Bad Request\r\n\r\n");
                    continue;
                }
            };

            let path = Path::new(&file_path);
            if !path.exists() || !path.is_file() {
                let _ = stream.write_all(b"HTTP/1.1 404 Not Found\r\n\r\n");
                continue;
            }

            let ext = path
                .extension()
                .map(|e| e.to_string_lossy().to_lowercase())
                .unwrap_or_default();
            let mime = mime_for_ext(&ext);

            let file_size = match std::fs::metadata(path) {
                Ok(m) => m.len(),
                Err(_) => {
                    let _ = stream.write_all(b"HTTP/1.1 500 Error\r\n\r\n");
                    continue;
                }
            };

            let mut file = match std::fs::File::open(path) {
                Ok(f) => f,
                Err(_) => {
                    let _ = stream.write_all(b"HTTP/1.1 500 Error\r\n\r\n");
                    continue;
                }
            };

            let header = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccept-Ranges: bytes\r\n\r\n",
                mime, file_size
            );
            if stream.write_all(header.as_bytes()).is_err() {
                continue;
            }

            // Stream file in chunks
            let mut chunk = [0u8; 65536];
            loop {
                match file.read(&mut chunk) {
                    Ok(0) => break,
                    Ok(n) => {
                        if stream.write_all(&chunk[..n]).is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        }
    });

    port
}

fn extract_path(request: &str) -> Option<String> {
    let first_line = request.lines().next()?;
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 {
        return None;
    }
    let uri = parts[1];
    let query = uri.strip_prefix("/audio?path=")?;
    let decoded = urlencoding::decode(query).ok()?;
    // Strip any trailing HTTP version or fragments
    let path = decoded.split_whitespace().next().unwrap_or(&decoded);
    Some(path.to_string())
}
