use super::error::{SfsError, SfsResult};
use std::path::Path;

#[derive(Clone, Debug)]
pub struct Server {
  mbtiles_file_path: String,
  shapefile_file_path: String,
}

impl Server {
  pub fn new<M: AsRef<Path>, S: AsRef<Path>>(mbtiles_file_path: M, shapefile_file_path: S) -> SfsResult<Self> {
    let mbtiles_path = mbtiles_file_path.as_ref().to_path_buf();
    let shapefile_path = shapefile_file_path.as_ref().to_path_buf();

    Ok(Self {
      mbtiles_file_path: mbtiles_file_path
        .as_ref()
        .to_str()
        .ok_or_else(|| SfsError::UnsupportedCharsInFilepathWithMbtiles(mbtiles_path))?
        .to_string(),
      shapefile_file_path: shapefile_file_path
        .as_ref()
        .to_str()
        .ok_or_else(|| SfsError::UnsupportedCharsInFilepathWithShapefile(shapefile_path))?
        .to_string(),
    })
  }

  pub fn start_server(&self) -> SfsResult<()> {
    let shapefile = shapefile::read(&self.shapefile_file_path).map_err(|e| SfsError::ShapefileReadError(e.to_string()))?;

    let mut mbtiles = mbtiles::Mbtiles::new(&self.mbtiles_file_path).map_err(|e| SfsError::MbtilesError(e.to_string()))?;

    Ok(())
  }

  pub fn read_shape_file(filename: &str) -> SfsResult<()> {
    let mut reader = shapefile::Reader::from_path(filename).unwrap();
    for result in reader.iter_shapes_and_records() {
      let (shape, record) = result.unwrap();
      println!("Shape: {}, records: ", shape);
      for (name, value) in record {
        println!("\t{}: {:?}, ", name, value);
      }
      println!();
    }
    Ok(())
  }

  pub fn upload_shape_file(file_path: &str) -> SfsResult<()> {
    Self::read_shape_file(file_path)?;
    Ok(())
  }
}
