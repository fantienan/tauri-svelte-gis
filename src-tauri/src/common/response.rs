use serde_json;

pub fn create_response(success: bool, data: Vec<serde_json::Value>, msg: String) -> serde_json::Value {
  serde_json::json!({
      "success": success,
      "data": data,
      "msg": msg
  })
}
