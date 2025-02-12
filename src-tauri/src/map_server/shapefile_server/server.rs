use std::collections::HashMap;
// use std::fs::File;
use std::path::Path;
use geo_types::{Geometry as GeoTypesGeometry, Point as GeoTypesPoint, LineString as GeoTypesLineString, Polygon as GeoTypesPolygon};
use shapefile::{self, Shape};

// 定义一个结构体来保存几何数据及属性
pub struct ShapefileFeature {
    pub geometry: GeoTypesGeometry<f64>,
    pub attributes: HashMap<String, String>,
}

// 转换 shapefile 形状和属性到 mbtiles 文件
pub fn convert_shapefile_to_mbtiles(features: &[ShapefileFeature], mbtiles_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut mbtiles = mbtiles::Mbtiles::new(mbtiles_path)?;

    for feature in features {
        // 将几何与属性整合到 tile_data 中，实际项目中可自定义格式
        let tile_data = format!("Geometry: {:?}, Attributes: {:?}", feature.geometry, feature.attributes);
        // 简化示例：假定所有瓦片均存储在缩放级别0，坐标(0,0)
        mbtiles.add_tile(0, 0, 0, &tile_data)?;
    }

    mbtiles.commit()?;
    Ok(())
}

// 从 shapefile 读取形状及属性，并组装为 ShapefileFeature 列表
pub fn read_shapefile_with_attributes(shapefile_path: &str) -> Result<Vec<ShapefileFeature>, Box<dyn std::error::Error>> {
    let mut features = Vec::new();
    // 使用 shapefile::Reader 同时获取形状和属性
    let mut reader = shapefile::Reader::from_path(shapefile_path)?;
    for result in reader.iter_shapes_and_records() {
        let (shape, record) = result?;
        let geometry = match shape.shapetype() {
            shapefile::ShapeType::Point => {
                let point = shape.to_point();
                GeoTypesGeometry::Point(GeoTypesPoint::new(point.x, point.y))
            },
            shapefile::ShapeType::Polyline => {
                let polyline = shape.to_polyline();
                GeoTypesGeometry::LineString(GeoTypesLineString::from(polyline))
            },
            shapefile::ShapeType::Polygon => {
                let polygon = shape.to_polygon();
                GeoTypesGeometry::Polygon(GeoTypesPolygon::new(polygon))
            },
            _ => continue, // 忽略不支持的类型
        };
        // 将 record 转为 HashMap<String, String>（示例转换）
        let mut attributes = HashMap::new();
        for (name, value) in record.iter() {
            attributes.insert(name.clone(), format!("{:?}", value));
        }
        features.push(ShapefileFeature { geometry, attributes });
    }
    Ok(features)
}

// 启动 martin 服务，发布矢量瓦片与支持属性查询的接口
pub fn start_martin_vector_service(mbtiles_path: &str, port: u16) -> Result<(), Box<dyn std::error::Error>> {
    // 初始化 martin 服务
    // 示例中假设 martin::server::serve 接收 mbtiles 路径及监听端口
    server::serve(mbtiles_path, port)?;
    Ok(())
}
