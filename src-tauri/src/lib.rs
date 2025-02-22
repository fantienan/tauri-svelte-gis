// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};
use utils::response::create_response;
mod shapefile_server;
mod utils;

// 获取当前路径
fn get_current_path() -> std::path::PathBuf {
  let current_dir = std::env::current_dir().unwrap();
  current_dir
}

// 初始化日志
fn tauri_plugin_log_init() -> impl tauri::plugin::Plugin<tauri::Wry> {
  let log_file_path = get_current_path()
    .join("resources")
    .join("app")
    .to_string_lossy()
    .to_string();
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

#[tauri::command]
fn disk_read_dir(path: Option<&str>) -> Result<serde_json::Value, String> {
  utils::disk::disk_read_dir(path)
}

#[tauri::command]
async fn shapefile_to_geojson(shapefile_path: &str) -> Result<serde_json::Value, String> {
  shapefile_server::utilities::shapefile_to_geojson(shapefile_path).await
}

#[tauri::command]
fn shapefile_to_server(shapefile_path: &str) -> Result<serde_json::Value, String> {
  let path = std::path::Path::new(shapefile_path);
  if !path.exists() {
    return Err("文件不存在".to_string());
  }
  let file_name = path
    .file_stem()
    .and_then(|name| name.to_str())
    .ok_or_else(|| "无法获取文件名".to_string())?;
  let current_dir = get_current_path();
  let mbtiles_path = current_dir
    .join("resources")
    .join("mbtiles")
    .join(format!("{}.mbtiles", file_name));

  let server = shapefile_server::Server::new(shapefile_server::ServerConfig {
    shapefile_file_path: shapefile_path,
    mbtiles_file_path: mbtiles_path,
  })
  .map_err(|e| e.to_string())?
  .start_server();

  match server {
    Ok(_) => Ok(create_response::<()>(true, None, "成功".to_string())),
    Err(e) => Err(e.to_string()),
  }
}

#[tauri::command]
async fn shapefile_to_record(shapefile_path: &str) -> Result<serde_json::Value, String> {
  shapefile_server::utilities::shapefile_to_record(shapefile_path).await.map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_log_init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      disk_read_dir,
      shapefile_to_record,
      shapefile_to_server,
      shapefile_to_geojson
    ])
    .setup(|app| {
      init_window_config(&app.handle())?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
