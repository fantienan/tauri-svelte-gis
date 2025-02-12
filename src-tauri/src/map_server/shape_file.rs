// use mvt::{Feature, GeomType, Layer, Tile};
// use martin

use shapefile::ShapeType;
use geo::{Geometry, Point, LineString, Polygon};
use geo_types::{Geometry as GeoTypesGeometry, Point as GeoTypesPoint, LineString as GeoTypesLineString, Polygon as GeoTypesPolygon};
use std::fs::File;
use std::path::Path;

// 已将 shapefile 发布相关功能迁移到 shapefile_server 模块，统一管理服务接口。

// fn convert_shapefile_to_mbtiles(shapefile_path: &str, mbtiles_path: &str) -> Result<(), Box<dyn std::error::Error>> {

fn convert_shapefile_to_mbtiles(shapes: &[shapefile::Shape], mbtiles_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    // 创建 MBTiles 文件
    let mbtiles_file = File::create(mbtiles_path)?;
    let mut mbtiles = mbtiles::Mbtiles::new(mbtiles_file)?;


    // 遍历 Shapefile 中的所有形状
    for shape in shapes {
        match shape.shapetype() {
            ShapeType::Point => {
                let point = shape.to_point();
                let geometry = GeoTypesGeometry::Point(GeoTypesPoint::new(point.x, point.y));
                add_geometry_to_mbtiles(&geometry, &mut mbtiles)?;
            },
            ShapeType::Polyline => {
                let polyline = shape.to_polyline();
                let geometry = GeoTypesGeometry::LineString(GeoTypesLineString::from(polyline));
                add_geometry_to_mbtiles(&geometry, &mut mbtiles)?;
            },
            ShapeType::Polygon => {
                let polygon = shape.to_polygon();
                let geometry = GeoTypesGeometry::Polygon(GeoTypesPolygon::new(polygon));
                add_geometry_to_mbtiles(&geometry, &mut mbtiles)?;
            },
            _ => {
                eprintln!("Unsupported shape type: {:?}", shape.shape_type());
            }
        }
    }

    // 保存 MBTiles 文件
    mbtiles.commit()?;
    
    Ok(())
}

// 将几何数据添加到 MBTiles
fn add_geometry_to_mbtiles(geometry: &GeoTypesGeometry<f64>, mbtiles: &mut MBTiles) -> Result<(), Box<dyn std::error::Error>> {
    // 将几何数据转换为瓦片（这里只是一个示例，可能需要根据你的需求进行调整）
    let tile_data = match geometry {
        GeoTypesGeometry::Point(p) => format!("Point: ({}, {})", p.x(), p.y()),
        GeoTypesGeometry::LineString(ls) => format!("LineString: {:?}", ls),
        GeoTypesGeometry::Polygon(p) => format!("Polygon: {:?}", p),
        _ => return Err("Unsupported geometry type".into()),
    };
    
    // 这里只是一个简化的例子，假设所有瓦片都存储在缩放级别 0 和瓦片坐标 (0, 0)
    mbtiles.add_tile(0, 0, 0, &tile_data)?;
    
    Ok(())
}

pub fn read_shapefile(shapefile_path: &str) {
  // let mut reader = shapefile::Reader::from_path(filename).unwrap();
  // for result in reader.iter_shapes_and_records() {
  //   let (shape, record) = result.unwrap();
  //   println!("Shape: {}, records: ", shape);
  //   for (name, value) in record {
  //     println!("\t{}: {:?}, ", name, value);
  //   }
  // }
  let shapes = shapefile::read_shapes(shapefile_path).unwrap();
  convert_shapefile_to_mbtiles(&shapes, "");
}
