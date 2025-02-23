import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import glob from 'fast-glob';
import { getMachine, isRomFolder } from './libretro.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
export async function run(arguments_ = process.argv) {
    const [...arguments__] = arguments_;
    if (arguments__.length === 0) {
        console.log('Please provide a path');
        process.exit(1);
    }
    const targetPath = arguments__[0];
    process.chdir(targetPath);
    // List all folders in the current directory using fast-glob
    const files = (await glob(['*'], { onlyDirectories: true })).filter(isRomFolder);
    console.log(files);
    await getMachine(targetPath);
}
