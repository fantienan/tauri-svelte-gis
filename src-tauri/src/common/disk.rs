use crate::common::response::create_response;
use serde_json;
use std::io;
use walkdir::WalkDir;

pub fn get_root_drives() -> Result<Vec<serde_json::Value>, io::Error> {
  let mut drives = Vec::new();
  for letter in b'A'..=b'Z' {
    let drive = format!("{}:\\", letter as char);
    if std::path::Path::new(&drive).exists() {
      drives.push(serde_json::json!({ "path": drive, "name": letter as char, "type": "drive" }));
    }
  }
  Ok(drives)
}

pub fn scan_drives(drives: &[String], entries: &mut Vec<serde_json::Value>) {
  for drive in drives {
    println!("Scanning drive: {}", drive);
    for entry in WalkDir::new(drive).max_depth(1).min_depth(1) {
      match entry {
        Ok(entry) => {
          println!("{}", entry.path().display().to_string());
          let path = entry.path().display().to_string();
          let entry_type = if entry.path().is_dir() { "directory" } else { "file" };
          if let Some(file_name) = entry.path().file_name() {
            entries.push(serde_json::json!({ "path": path, "name": file_name.to_string_lossy().to_string(), "type": entry_type }));
          } else {
            entries.push(serde_json::json!({ "path": path, "name": "", "type": entry_type }));
          }
        }
        Err(e) => {
          eprintln!("Error: {}", e);
        }
      }
    }
  }
}

#[tauri::command]
pub fn read_disk_directory(path: Option<&str>) -> Result<serde_json::Value, String> {
  let mut success = true;
  let mut msg = String::from("Operation successful");
  let mut entries = Vec::new();
  #[cfg(target_os = "windows")]
  {
    if path.is_none() {
      match get_root_drives() {
        Ok(drives) => {
          for drive in drives {
            entries.push(drive);
          }
        }
        Err(e) => {
          success = false;
          msg = format!("Failed to get root drives: {}", e);
        }
      }
    } else {
      scan_drives(&[path.unwrap().to_string()], &mut entries);
    }
  }

  Ok(create_response(success, entries, msg))
}
