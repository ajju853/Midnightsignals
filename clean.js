import fs from 'fs';
import path from 'path';

const pathsToClean = ['dist', 'server.js'];

pathsToClean.forEach((p) => {
  const fullPath = path.resolve(p);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Cleaned: ${p}`);
  }
});
