use axum::{
    routing::get,
    Router,
    response::IntoResponse,
    extract::Path,
};
use std::net::SocketAddr;
use crate::map_server::shapefile_server::{shapefile::Shapefile, mbtiles::{MBTiles, Tile}};

pub async fn start_server() {
    let shapefile = Shapefile::read("your_shapefile.shp").expect("Failed to read shapefile");
    let mut mbtiles = MBTiles::create("output.mbtiles").expect("Failed to create MBTiles");

    for feature in shapefile.features() {
        let tile = Tile::from_feature(&feature);
        mbtiles.add_tile(tile).expect("Failed to add tile");
    }

    let app = Router::new()
        .route("/tiles/:z/:x/:y", get(get_tile_handler));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));
    println!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn get_tile_handler(Path((z, x, y)): Path<(u32, u32, u32)>) -> impl IntoResponse {
    // 实现从 MBTiles 中检索瓦片的逻辑
    (axum::http::StatusCode::OK, "Tile data here")
}
