import path from 'node:path';
import fs from 'node:fs/promises';
import createDebug from 'debug';
import glob from 'fast-glob';
import { resizeImageTo } from './image.js';
import { type Options } from './options.js';

const debug = createDebug('command');

export type Machine = {
  extensions: string[];
  alias: string[];
  fallbacks?: string[];
};

export type MachineCache = Record<
  string,
  {
    boxarts?: string[];
    snaps?: string[];
    titles?: string[];
  }
>;

const resFolder = '.res';
const baseUrl = 'https://thumbnails.libretro.com/';
const boxartPath = 'Named_Boxarts';
const snapPath = 'Named_Snaps';
const titlePath = 'Named_Titles';
const machines: Record<string, Machine> = {
  'Nintendo - Game Boy': {
    extensions: ['gb', 'sgb', 'zip'],
    alias: ['GB', 'Game Boy'],
    fallbacks: ['Nintendo - Game Boy Color']
  },
  'Nintendo - Game Boy Color': {
    extensions: ['gbc', 'zip'],
    alias: ['GBC', 'Game Boy Color'],
    fallbacks: ['Nintendo - Game Boy']
  },
  'Nintendo - Game Boy Advance': {
    extensions: ['gba', 'zip'],
    alias: ['GBA', 'Game Boy Advance']
  },
  'Nintendo - Nintendo Entertainment System': {
    extensions: ['nes', 'zip'],
    alias: ['NES', 'Famicom', 'Nintendo']
  },
  'Nintendo - Super Nintendo Entertainment System': {
    extensions: ['sfc', 'smc', 'zip'],
    alias: ['SNES', 'Super Famicom', 'Super Nintendo', 'Super NES']
  },
  'Nintendo - Nintendo 64': {
    extensions: ['n64', 'v64', 'zip'],
    alias: ['N64', 'Nintendo 64']
  },
  'Sega - 32X': {
    extensions: ['32x', 'zip'],
    alias: ['32X', 'THIRTYTWOX']
  },
  'Sega - Dreamcast': {
    extensions: ['dc', 'chd', 'gdi'],
    alias: ['DC', 'Dreamcast']
  },
  'Sega - Mega Drive - Genesis': {
    extensions: ['md', 'gen', 'zip'],
    alias: ['MD', 'Mega Drive', 'Genesis']
  },
  'Sega - Mega-CD - Sega CD': {
    extensions: ['chd', 'iso', 'cue'],
    alias: ['Mega CD', 'Sega CD', 'MegaCD', 'SegaCD']
  },
  'Sega - Game Gear': {
    extensions: ['gg', 'zip'],
    alias: ['GG', 'Game Gear']
  },
  'Sega - Master System - Mark III': {
    extensions: ['sms', 'zip'],
    alias: ['SMS', 'MS', 'Master System', 'Mark III']
  },
  'Sony - PlayStation': {
    extensions: ['chd', 'cue'],
    alias: ['PSX', 'PS1', 'PlayStation']
  },
  'Sega - Saturn': {
    extensions: ['chd', 'cue'],
    alias: ['Saturn']
  }
};
const aliases = Object.values(machines).flatMap((machine) => machine.alias);
const machineCache: MachineCache = {};

export function getMachine(file: string) {
  const extension = file.split('.').pop() ?? '';
  const firstComponent = file.split(/\\|\//)[0];
  const machine = Object.entries(machines).find(([machine, { extensions, alias }]) => {
    return extensions.includes(extension) && alias.some((a) => firstComponent.includes(a));
  });
  return machine ? machine[0] : undefined;
}

export function isRomFolder(folderName: string) {
  return aliases.some((alias) => folderName.toLowerCase().includes(alias.toLowerCase()));
}

export async function scrapeFolder(folderPath: string, options: Options = {}) {
  debug('Options:', options);
  debug(`Scraping folder: ${folderPath}`);
  const files = await glob(['**/*'], { onlyFiles: true, cwd: folderPath });
  let found = 0;
  let missing = 0;
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const artPath = path.join(path.dirname(filePath), resFolder, `${path.basename(filePath)}.png`);

    if ((await pathExists(artPath)) && !options.force) {
      debug(`Art file already exists, skipping "${artPath}"`);
      continue;
    }

    const machine = getMachine(filePath);
    if (!machine) continue;

    debug(`Machine: ${machine} (file: ${filePath})`);
    const boxartUrl = await findBoxartUrl(filePath, machine);
    if (boxartUrl) {
      found++;
      debug(`Found boxart URL: "${boxartUrl}"`);
      await resizeImageTo(boxartUrl, artPath, { width: options.width, height: options.height });
    } else {
      missing++;
      debug(`No boxart found for "${filePath}"`);
      console.log(`No boxart found for "${filePath}"`);
    }
  }

  debug('--------------------------------');
}

export async function findBoxartUrl(filePath: string, machine: string, fallback = true): Promise<string | undefined> {
  let boxarts = machineCache[machine]?.boxarts;
  if (!boxarts) {
    const boxartsPath = `${baseUrl}${machine}/${boxartPath}/`;
    const response = await fetch(boxartsPath);
    const text = await response.text();
    boxarts =
      text
        .match(/<a href="([^"]+)">/g)
        ?.map((a) => a.replace(/<a href="([^"]+)">/, '$1'))
        .map((a) => decodeURIComponent(a)) ?? [];
    machineCache[machine] ??= {};
    machineCache[machine].boxarts = boxarts;
  }

  const fileName = path.basename(filePath, path.extname(filePath));

  // Try exact match
  const pngName = `${fileName}.png`;
  if (boxarts.includes(pngName)) {
    debug(`Found exatct match for "${fileName}"`);
    return `${baseUrl}${machine}/${boxartPath}/${pngName}`;
  }

  // Try searching after removing (...) and [...] in the name
  const strippedName = fileName.replaceAll(/(\(.*?\)|\[.*?])/g, '').trim();
  const matchedArt = boxarts.find((b) => b.includes(strippedName));
  if (matchedArt) {
    debug(`Found match for "${strippedName}" after stripping () []`);
    return `${baseUrl}${machine}/${boxartPath}/${matchedArt}`;
  }

  if (!fallback) return undefined;

  // Try with fallback machines
  const fallbackMachines = machines[machine]?.fallbacks ?? [];
  for (const fallbackMachine of fallbackMachines) {
    const artUrl = await findBoxartUrl(filePath, fallbackMachine, false);
    if (artUrl) {
      debug(`Found match for "${fileName}" in fallback machine "${fallbackMachine}"`);
      return artUrl;
    }

    debug(`No match for "${fileName}" in fallback machine "${fallbackMachine}"`);
  }

  return undefined;
}

export async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
