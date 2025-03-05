use std::{path::Path, process::Command};

// use tokio::process::Command as TokioCommand;

pub fn get_ogr2ogr_version() -> Result<String, String> {
  match Command::new("ogr2ogr").arg("--version").output() {
    Ok(output) => String::from_utf8(output.stdout)
      .map_err(|e| format!("无法解析版本信息: {}", e))
      .map(|s| s.trim().to_string()),
    Err(e) => Err(format!("执行 ogr2ogr --version 失败: {}", e)),
  }
}

pub fn command_to_string(cmd: &Command) -> String {
  let program = cmd.get_program().to_string_lossy();
  let args: Vec<String> = cmd
    .get_args()
    .map(|arg| arg.to_string_lossy().into_owned())
    .collect();

  format!("{} {}", program, args.join(" "))
}

#[derive(Debug)]
pub struct CommandOgr2ogrParams {
  input_path: String,
  output_path: String,
  format_name: String,
  min_zoom: Option<u8>,
  max_zoom: Option<u8>,
  epsg: Option<String>,
}

pub fn command_ogr2ogr(params: CommandOgr2ogrParams) -> Command {
  println!("params: {:?}", params);
  let mut cmd = Command::new("ogr2ogr");
  let CommandOgr2ogrParams {
    input_path,
    output_path,
    format_name,
    min_zoom,
    max_zoom,
    epsg,
  } = params;
  let min_zoom = min_zoom.unwrap_or(1);
  let max_zoom = max_zoom.unwrap_or(22);
  let epsg = epsg.unwrap_or("EPSG:3857".to_string());

  cmd
    .arg("-f")
    .arg(format_name)
    .arg(output_path)
    .arg(input_path)
    .arg("-dsco")
    .arg(format!("MINZOOM={}", min_zoom))
    .arg("-dsco")
    .arg(format!("MAXZOOM={}", max_zoom))
    .arg("-t_srs")
    .arg(epsg);
  cmd
}

pub async fn create_server<P, Q>(input_path: P, output_path: Q) -> Result<(), String>
where
  P: AsRef<Path>,
  Q: AsRef<Path>,
{
  let input_path = input_path
    .as_ref()
    .to_str()
    .ok_or_else(|| "无法转换 input_path".to_string())?
    .to_string();
  let output_path = output_path
    .as_ref()
    .to_str()
    .ok_or_else(|| "无法转换 output_path".to_string())?
    .to_string();
  let mut cmd = command_ogr2ogr(CommandOgr2ogrParams {
    input_path,
    output_path,
    format_name: "MBTiles".to_string(),
    min_zoom: None,
    max_zoom: None,
    epsg: None,
  });

  println!("{:?}", get_ogr2ogr_version());

  let mut child = cmd.spawn().map_err(|e| format!("执行命令失败: {}", e))?;

  println!("执行命令: {}", command_to_string(&cmd));

  // 等待子进程执行完毕
  let status = child
    .wait()
    .map_err(|e| format!("等待进程完成时发生错误: {}", e))?;

  if !status.success() {
    return Err(format!("命令执行失败，退出码: {:?}", status.code()));
  }

  println!("命令执行完成，退出码: {:?}", status.code());
  Ok(())
}

