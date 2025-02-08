use mvt::{Feature, GeomType, Layer, Tile};

pub fn read_shape_file(filename: &str) {
  let mut reader = shapefile::Reader::from_path(filename).unwrap();

  for result in reader.iter_shapes_and_records() {
    let (shape, record) = result.unwrap();
    println!("Shape: {}, records: ", shape);
    for (name, value) in record {
      println!("\t{}: {:?}, ", name, value);
    }
    println!();
  }
}
