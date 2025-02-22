pub fn create_response<T>(success: bool, data: Option<T>, msg: String) -> serde_json::Value
where
  T: serde::Serialize,
{
  serde_json::json!({
      "success": success,
      "data": data,
      "msg": msg
  })
}
