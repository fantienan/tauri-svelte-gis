use std::path::PathBuf;

#[derive(thiserror::Error, Debug)]
pub enum SfsError {
  #[error("mbtiles_file_path contains unsupported characters: {0}")]
  UnsupportedCharsInFilepathWithMbtiles(PathBuf),

  #[error("shapefile_file_path contains unsupported characters: {0}")]
  UnsupportedCharsInFilepathWithShapefile(PathBuf),

  #[error("Failed to read shapefile: {0}")]
  ShapefileReadError(String),

  #[error("MBTiles error: {0}")]
  MbtilesError(String),
}

pub type SfsResult<T> = Result<T, SfsError>;
