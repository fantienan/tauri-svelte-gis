use super::error::{SfsError, SfsResult};
use super::shapefile_to_geojson::convert_shapefile_to_geojson;
use futures::TryFutureExt;
use std::path::Path;

#[derive(Clone, Debug)]
pub struct ServerConfig<M, S>
where
  M: AsRef<Path>,
  S: AsRef<Path>,
{
  pub mbtiles_file_path: M,
  pub shapefile_file_path: S,
}

#[derive(Clone, Debug)]
pub struct Server {
  mbtiles_file_path: String,
  shapefile_file_path: String,
}

impl Server {
  pub fn new<M: AsRef<Path>, S: AsRef<Path>>(config: ServerConfig<M, S>) -> SfsResult<Self> {
    let mbtiles_path = config.mbtiles_file_path.as_ref().to_path_buf();
    let shapefile_path = config.shapefile_file_path.as_ref().to_path_buf();

    Ok(Self {
      mbtiles_file_path: config
        .mbtiles_file_path
        .as_ref()
        .to_str()
        .ok_or_else(|| SfsError::UnsupportedCharsInFilepathWithMbtiles(mbtiles_path))?
        .to_string(),
      shapefile_file_path: config
        .shapefile_file_path
        .as_ref()
        .to_str()
        .ok_or_else(|| SfsError::UnsupportedCharsInFilepathWithShapefile(shapefile_path))?
        .to_string(),
    })
  }

  pub async fn create(&self) -> SfsResult<Self> {
    let feature_collection = convert_shapefile_to_geojson(&self.shapefile_file_path)
      .map_err(|e| SfsError::CreateServer(e.to_string()))
      .await?;

    Ok(self.clone())
  }
}

