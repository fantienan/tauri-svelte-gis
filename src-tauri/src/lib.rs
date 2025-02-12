// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};
mod common;

mod map_server;

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

fn init_window_config(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
  let window = app_handle.get_webview_window("main").unwrap();

  let js = format!(
    r#"
    sessionStorage.setItem('__SM_SCOPE__', JSON.stringify({{
        config: {{
          "SM_MAPBOX_TOKEN": "pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY20xdXM1OWQ5MDQ5MDJrb2U1cGcyazR6MiJ9.ZtSFvLFKtrwOt01u-COlYg",
          "SM_GEOVIS_TOKEN": "62d17dd1bcd9b6b4cde180133d80aa420446c9d132f88cb84c29d51e77d01c4c",
          "SM_TIANDITU_TOKEN": "211138deb6faa1f236b45eacd0fd331d"
        }},
    }}));
    "#,
  );

  match window.eval(&js) {
    Ok(_) => {
      log::info!("Init Window config injected successfully");
      Ok(())
    }
    Err(e) => {
      log::error!("Failed to inject window config: {}", e);
      Err(Box::new(e))
    }
  }
}

// #[tauri::command]
// fn upload_shapefile(filename: &str) {
//   // 示例：上传shape file
//   if let Err(e) = map_server::upload_shapefile(filename) {
//     eprintln!("Error uploading shape file: {}", e);
//   }

//   // 示例：发布矢量地图服务
//   if let Err(e) = map_server::publish_vector_map_service() {
//     eprintln!("Error publishing vector map service: {}", e);
//   }

//   // 示例：属性查询
//   if let Err(e) = map_server::query_attributes() {
//     eprintln!("Error querying attributes: {}", e);
//   }
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_log_init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      common::disk::read_disk_directory,
      map_server::upload_shapefile
    ])
    .setup(|app| {
      init_window_config(&app.handle())?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
