// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri_plugin_log::{Target, TargetKind};
use walkdir::WalkDir;

fn get_drives() -> Vec<String> {
  let mut drives = Vec::new();
  // 使用单引号写成 byte 字面量
  for letter in b'A'..=b'Z' {
    let drive = format!("{}:\\", letter as char);
    if std::path::Path::new(&drive).exists() {
      drives.push(drive);
    }
  }
  drives
}


fn scan_drives(drives: &[String], entries: &mut Vec<String>) {
    for drive in drives {
        println!("Scanning drive: {}", drive);
        // 使用 walkdir 从盘符的根目录开始遍历
        for entry in WalkDir::new(drive) {
            match entry {
                Ok(entry) => {
                    entries.push(entry.path().display().to_string());
                    println!("{}", entry.path().display().to_string());
                }
                Err(e) => {
                    eprintln!("Error: {}", e);
                }
            }
        }
    }
}


#[tauri::command]
fn read_disk_directory(path: &str) -> Result<Vec<String>, String> {
  let mut entries = Vec::new();
  let mut drives = Vec::new();
  if path.is_empty() {
    #[cfg(target_os = "windows")]
    {
      drives = get_drives();
    }
    scan_drives(&mut drives, &mut entries);
  }

  // for entry_res in WalkDir::new(path) {
  //   let entry = entry_res.map_err(|e| e.to_string())?;
  //   entries.push(entry.path().display().to_string());
  //   println!("{}", entry.path().display().to_string());
  // }
  Ok(entries)
}

// 获取当前路径
fn get_current_path() -> std::path::PathBuf {
  let current_dir = std::env::current_dir().unwrap();
  current_dir
}

// 初始化日志
fn tauri_plugin_log_init() -> impl tauri::plugin::Plugin<tauri::Wry> {
  let log_file_path = get_current_path().join("app").to_string_lossy().to_string();
  tauri_plugin_log::Builder::new()
    .targets([
      Target::new(TargetKind::Stdout),
      Target::new(TargetKind::LogDir {
        file_name: Some(log_file_path),
      }),
      Target::new(TargetKind::Webview),
    ])
    .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_log_init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![read_disk_directory])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
