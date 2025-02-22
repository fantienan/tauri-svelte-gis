use std::{path::Path, sync::Arc};
use futures::{stream, StreamExt};
use regex::Regex;
use crate::utils::response::create_response;
use tokio::sync::Mutex;


pub async fn shapefile_to_geojson(shapefile_path: &str) -> Result<serde_json::Value, String> {
  let path = std::path::Path::new(shapefile_path);
  let parent_dir = path.parent().ok_or("无法获取父目录")?;
  let file_name = path
    .file_stem()
    .and_then(|name| name.to_str())
    .ok_or("无法获取文件名")?;
  let output_path = parent_dir.join(format!("{}.geojson", file_name));

  shapefile_to_geojson::convert_shapefile_to_geojson(shapefile_path, output_path.to_str().unwrap())
    .await
    .map_err(|e| format!("转换失败: {}", e))?;
  // 读取output_path 文件内容
  let content = std::fs::read_to_string(output_path).map_err(|e| format!("读取文件失败: {}", e))?;
  Ok(create_response(true, Some(content), "成功".to_string()))
}

pub async fn shapefile_to_record(shapefile_path: &str) -> Result<serde_json::Value, Box<dyn std::error::Error + Send + Sync>> {
  let base_path = Path::new(shapefile_path);
  let shp_path = base_path.with_extension("shp");
  let dbf_path = base_path.with_extension("dbf");
  let mut shp_reader = shapefile::Reader::from_path(shp_path.clone())?;
  let shape_records: Vec<_> = shp_reader.iter_shapes_and_records().collect();
  let properties = Arc::new(Mutex::new(Vec::new()));

  let tasks = stream::iter(shape_records.into_iter())
    .map(|shape_record| {
      let properties = Arc::clone(&properties);
      tokio::spawn(async move { process_shape_record(shape_record, properties).await })
    })
    .buffer_unordered(num_cpus::get());
    tasks.for_each(|_| async {}).await;

  let data = properties.lock().await.clone();
  Ok(create_response(
    true,
    Some(data),
    "成功".to_string(),
  ))
}

async fn process_shape_record(
  shape_record: Result<(shapefile::Shape, shapefile::dbase::Record), shapefile::Error>,
  properties: Arc<Mutex<Vec<serde_json::Value>>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
  let (shape, record) = shape_record?;

  let mut propertie = serde_json::Map::new();
  let re_numeric = Regex::new(r"Numeric\(Some\(([0-9]+(\.[0-9]+)?)\)\)").unwrap();
  let re_character = Regex::new(r#"^Character\(Some\("(.+)"\)\)"#).unwrap();
    
  for (field, value) in record.into_iter() {
    let value_string = value.to_string();
    let value_json = match value_string.as_str() {
      "Numeric(None)" => serde_json::Value::Null,
      "Character(None)" => serde_json::Value::Null,
      _=> {
        if let Some(caps) = re_numeric.captures(&value_string) {
          let number_str = caps.get(1).map_or("", |m| m.as_str());
          if let Ok(number) = number_str.parse::<f64>() {
            serde_json::json!(number)
          } else {
            serde_json::json!(value_string)
          }
        } else if let Some(caps) = re_character.captures(&value_string) {
          let string = caps.get(1).map_or("", |m| m.as_str());
          serde_json::json!(string)
        } else {
          serde_json::json!(value_string)
        }
      }
    };
    propertie.insert(field.to_string(), value_json);
  }
  properties.lock().await.push(serde_json::Value::Object(propertie));
  Ok(())
}
