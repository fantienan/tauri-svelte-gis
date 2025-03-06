use std::path;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use utils::response::create_response;
mod map_server;
mod shapefile_server;
mod utils;

#[tauri::command]
fn disk_read_dir(path: Option<&str>) -> Result<serde_json::Value, String> {
  utils::disk::disk_read_dir(path)
}

#[tauri::command]
async fn shapefile_to_geojson(shapefile_path: &str) -> Result<serde_json::Value, String> {
  shapefile_server::utilities::shapefile_to_geojson(shapefile_path).await
}

#[tauri::command]
async fn shapefile_to_record(shapefile_path: &str) -> Result<serde_json::Value, String> {
  shapefile_server::utilities::shapefile_to_record(shapefile_path)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_server(app_handle: tauri::AppHandle, input_path: &str) -> Result<serde_json::Value, String> {
  let input_path = path::Path::new(input_path);
  if !input_path.exists() {
    return Err("文件不存在".to_string());
  }
  let file_name = input_path
    .file_stem()
    .and_then(|name| name.to_str())
    .ok_or_else(|| "无法获取文件名".to_string())?;

  let mbtiles_path = utils::files::get_mbtiles_path();

  let output_path = mbtiles_path.join(format!("{}.mbtiles", file_name));

  if let Err(e) = map_server::command::create_server(input_path, &output_path).await {
    return Ok(create_response::<()>(false, None, e.to_string()));
  }

  if let Err(e) = map_server::command::start_server(&app_handle)   {
    return Ok(create_response::<()>(false, None, e.to_string())); 
  }

  Ok(create_response::<()>(true, None, "成功".to_string()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(utils::log::tauri_plugin_log_init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      disk_read_dir,
      shapefile_to_record,
      create_server,
      shapefile_to_geojson
    ])
    .setup(|app| {
      utils::window::init_window_config(&app.handle())?;
      utils::files::init_workspace();
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
