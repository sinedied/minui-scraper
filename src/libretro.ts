import path from 'node:path';
import fs from 'node:fs/promises';
import createDebug from 'debug';
import glob from 'fast-glob';
import { closest } from 'fastest-levenshtein';
import { resizeImageTo } from './image.js';
import { type Options } from './options.js';

const debug = createDebug('libretro');

export type Machine = {
  extensions: string[];
  alias: string[];
  fallbacks?: string[];
};

export type MachineCache = Record<string, Partial<Record<ArtType, string[]>>>;

export enum ArtType {
  Boxart = 'Named_Boxarts',
  Snap = 'Named_Snaps',
  Title = 'Named_Titles'
}

const resFolder = '.res';
const baseUrl = 'https://thumbnails.libretro.com/';
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
    const boxartUrl = await findArtUrl(filePath, machine);
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

export async function findArtUrl(
  filePath: string,
  machine: string,
  type: ArtType = ArtType.Boxart,
  fallback = true
): Promise<string | undefined> {
  let arts = machineCache[machine]?.[type];
  if (!arts) {
    const artsPath = `${baseUrl}${machine}/${type}/`;
    const response = await fetch(artsPath);
    const text = await response.text();
    arts =
      text
        .match(/<a href="([^"]+)">/g)
        ?.map((a) => a.replace(/<a href="([^"]+)">/, '$1'))
        .map((a) => decodeURIComponent(a)) ?? [];
    machineCache[machine] ??= {};
    machineCache[machine][type] = arts;
  }

  const fileName = path.basename(filePath, path.extname(filePath));

  // Try exact match
  const pngName = `${fileName}.png`;
  if (arts.includes(pngName)) {
    debug(`Found exact match for "${fileName}"`);
    return `${baseUrl}${machine}/${type}/${pngName}`;
  }

  const findMatch = (name: string) => {
    const matches = arts.filter((a) => a.includes(name));
    if (matches.length > 0) {
      const bestMatch = closest(name, matches);
      debug(`Found match for "${name}" (file: "${fileName}"): "${bestMatch}"`);
      return `${baseUrl}${machine}/${type}/${bestMatch}`;
    }

    return undefined;
  };

  // Try searching after removing (...) and [...] in the name
  let strippedName = fileName.replaceAll(/(\(.*?\)|\[.*?])/g, '').trim();
  let match = findMatch(strippedName);
  if (match) return match;

  // Try searching after removing DX in the name
  strippedName = strippedName.replaceAll('DX', '').trim();
  match = findMatch(strippedName);
  if (match) return match;

  // Try searching after removing substitles in the name
  strippedName = strippedName.split('-')[0].trim();
  match = findMatch(strippedName);
  if (match) return match;

  // Try with fallback machines
  if (!fallback) return undefined;
  const fallbackMachines = machines[machine]?.fallbacks ?? [];
  for (const fallbackMachine of fallbackMachines) {
    const artUrl = await findArtUrl(filePath, fallbackMachine, type, false);
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
