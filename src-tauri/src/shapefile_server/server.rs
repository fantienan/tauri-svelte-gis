use super::error::{SfsError, SfsResult};
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

  pub fn start_server(&self) -> SfsResult<Self> {
    println!("mbtiles: {:?}", self.mbtiles_file_path);
    // let shapefile = shapefile::read(&self.shapefile_file_path)
    //   .map_err(|e| SfsError::ShapefileReadError(e.to_string()))?;

    let mut mbtiles = mbtiles::Mbtiles::new(&self.mbtiles_file_path).map_err(|e| {
      println!("mbtiles: {:?}", e.to_string());
      SfsError::MbtilesError(e.to_string())
    })?;
    println!("-----mbtiles: {:?}", mbtiles);
    Ok(self.clone())
  }
}
