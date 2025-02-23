import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import debug from 'debug';
import glob from 'fast-glob';
import {isRomFolder, scrapeFolder} from './libretro.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(arguments_: string[] = process.argv) {
  const [...arguments__] = arguments_;
  if (arguments__.length === 0) {
    console.log('Please provide a path');
    process.exit(1);
  }

  if (arguments_.includes('--verbose')) {
    debug.enable('*');
  }

  const targetPath = arguments__[0];
  process.chdir(targetPath);

  const folders = (await glob(['*'], {onlyDirectories: true})).filter(isRomFolder);
  for (const folder of folders) {
    debug(`Scraping folder: ${folder}`);
    await scrapeFolder(folder);
    debug('--------------------------------');
  }
}
