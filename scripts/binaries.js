import { execa } from 'execa';
import fs from 'fs';
import path from 'path';

let extension = '';
if (process.platform === 'win32') {
  extension = '.exe';
}

// async function findOgr2OgrPath() {
//   const command = `where ogr2ogr${extension}`;
//   const ogr2ogrPath = (await execa(command)).stdout;
//   return ogr2ogrPath.trim().split('\n')[0];
// }

async function main() {
  const rustInfo = (await execa('rustc', ['-vV'])).stdout;
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
  if (!targetTriple) {
    console.error('Failed to determine platform target triple');
  }
  // const ogr2ogrPath = await findOgr2OgrPath();
  // fs.renameSync(ogr2ogrPath, `src-tauri/binaries/ogr2ogr-${targetTriple}${extension}`);

  fs.renameSync(
    path.resolve(__dirname, `../src-tauri/binaries/martin${extension}`),
    path.resolve(__dirname, `../src-tauri/binaries/martin-${targetTriple}${extension}`)
  );
}

main().catch((e) => {
  throw e;
});
