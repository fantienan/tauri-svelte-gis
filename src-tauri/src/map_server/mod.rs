pub mod shape_file;
pub mod shapefile_server;

#[tauri::command]
pub fn upload_shapefile(file_path: &str) -> Result<(), String> {
  shape_file::read_shapefile(file_path);
  Ok(())
}

pub fn publish_vector_map_service() -> Result<(), String> {
  // 实现发布矢量地图服务的逻辑
  // ...existing code...
  Ok(())
}

pub fn query_attributes() -> Result<(), String> {
  // 实现属性查询功能的逻辑
  // ...existing code...
  Ok(())
}
