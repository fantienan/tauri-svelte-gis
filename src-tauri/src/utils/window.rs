use tauri::Manager;

pub fn init_window_config(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
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
