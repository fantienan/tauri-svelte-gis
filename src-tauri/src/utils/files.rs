use std::{fs, path};

// 获取当前路径
pub fn get_current_path() -> path::PathBuf {
  let current_dir = std::env::current_dir().unwrap();
  current_dir
}

pub fn get_workspace_path() -> path::PathBuf {
  let current_dir = get_current_path();
  current_dir.join("workspace")
}

pub fn get_mbtiles_path() -> path::PathBuf {
  let workspace_path = get_workspace_path();
  workspace_path.join("mbtiles")
}

pub fn create_mbtiles_workspace() -> std::io::Result<()> {
  let workspace_path = path::Path::new("workspace");
  if !workspace_path.exists() {
    fs::create_dir(workspace_path)?;
  }

  let mbtiles_path = workspace_path.join("mbtiles");
  if !mbtiles_path.exists() {
    fs::create_dir(mbtiles_path)?
  }

  Ok(())
}

pub fn init_workspace() {
  match create_mbtiles_workspace() {
    Ok(_) => {
      log::info!("Workspace initialized successfully");
    }
    Err(e) => {
      log::error!("Failed to initialize workspace: {}", e);
    }
  }
}
