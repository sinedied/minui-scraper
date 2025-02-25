import path from 'node:path';
import fs from 'node:fs/promises';
import createDebug from 'debug';
import glob from 'fast-glob';
import { resizeImageTo } from './image.js';
import { type Options } from './options.js';
import { findBestMatch } from './matcher.js';
import { stats } from './stats.js';

const debug = createDebug('libretro');

export type Machine = {
  extensions: string[];
  alias: string[];
  fallbacks?: string[];
  folders?: boolean;
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
  'Nintendo - Game Boy Color': {
    extensions: ['gbc', 'zip'],
    alias: ['GBC', 'Game Boy Color'],
    fallbacks: ['Nintendo - Game Boy']
  },
  'Nintendo - Game Boy Advance': {
    extensions: ['gba', 'zip'],
    alias: ['GBA', 'Game Boy Advance']
  },
  'Nintendo - Game Boy': {
    extensions: ['gb', 'sgb', 'zip'],
    alias: ['GB', 'SGB', 'Game Boy'],
    fallbacks: ['Nintendo - Game Boy Color']
  },
  'Nintendo - Super Nintendo Entertainment System': {
    extensions: ['sfc', 'smc', 'zip'],
    alias: ['SNES', 'SFC', 'Super Famicom', 'Super Nintendo', 'Super NES']
  },
  'Nintendo - Nintendo 64DD': {
    extensions: ['n64dd', 'zip'],
    alias: ['N64DD', 'Nintendo 64DD'],
    fallbacks: ['Nintendo - Nintendo 64']
  },
  'Nintendo - Nintendo 64': {
    extensions: ['n64', 'v64', 'zip'],
    alias: ['N64', 'Nintendo 64']
  },
  'Nintendo - Family Computer Disk System': {
    extensions: ['fds', 'zip'],
    alias: ['FDS', 'Family Computer Disk System', 'Famicom Disk System']
  },
  'Nintendo - Nintendo Entertainment System': {
    extensions: ['nes', 'zip'],
    alias: ['NES', 'FC', 'Famicom', 'Nintendo']
  },
  'Nintendo - Nintendo DSi': {
    extensions: ['dsi', 'zip'],
    alias: ['DSi', 'Nintendo DSi'],
    fallbacks: ['Nintendo - Nintendo DS']
  },
  'Nintendo - Nintendo DS': {
    extensions: ['nds', 'zip'],
    alias: ['DS', 'Nintendo DS']
  },
  'Nintendo - Pokemon Mini': {
    extensions: ['pm', 'zip'],
    alias: ['PKM', 'Pokemon Mini']
  },
  'Nintendo - Virtual Boy': {
    extensions: ['vb', 'zip'],
    alias: ['VB', 'Virtual Boy']
  },
  'Handheld Electronic Game': {
    extensions: ['gw', 'zip'],
    alias: ['GW', 'Game & Watch']
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
  'Sega - Saturn': {
    extensions: ['chd', 'cue'],
    alias: ['Saturn']
  },
  'Sony - PlayStation': {
    extensions: ['chd', 'cue'],
    alias: ['PSX', 'PS1', 'PlayStation']
  },
  'Sony - PlayStation Portable': {
    extensions: ['iso', 'cso', 'chd'],
    alias: ['PSP', 'PlayStation Portable'],
    fallbacks: ['Sony - PlayStation']
  },
  'Amstrad - CPC': {
    extensions: ['dsk', 'zip'],
    alias: ['CPC', 'Amstrad']
  },
  'Atari - 2600': {
    extensions: ['a26', 'zip'],
    alias: ['A26', '2600', 'Atari 2600']
  },
  'Atari - 5200': {
    extensions: ['a52', 'zip'],
    alias: ['A52', '5200', 'Atari 5200']
  },
  'Atari - 7800': {
    extensions: ['a78', 'zip'],
    alias: ['A78', '7800', 'Atari 7800']
  },
  'Atari - Jaguar': {
    extensions: ['jag', 'zip'],
    alias: ['JAG', 'Jaguar']
  },
  'Atari - Lynx': {
    extensions: ['lynx', 'zip'],
    alias: ['LYNX', 'Lynx']
  },
  'Atari - ST': {
    extensions: ['st', 'zip'],
    alias: ['ST', 'Atari ST']
  },
  'Bandai - WonderSwan Color': {
    extensions: ['wsc', 'zip'],
    alias: ['WSC', 'WonderSwan Color'],
    fallbacks: ['Bandai - WonderSwan']
  },
  'Bandai - WonderSwan': {
    extensions: ['ws', 'zip'],
    alias: ['WS', 'WonderSwan']
  },
  'Coleco - ColecoVision': {
    extensions: ['col', 'zip'],
    alias: ['COL', 'Coleco', 'ColecoVision']
  },
  'Commodore - Amiga': {
    extensions: ['adf', 'zip'],
    alias: ['ADF', 'Amiga']
  },
  'Commodore - VIC-20': {
    extensions: ['v64', 'zip'],
    alias: ['VIC']
  },
  'Commodore - 64': {
    extensions: ['d64', 'zip'],
    alias: ['D64', 'C64', 'Commodore 64', 'Commodore']
  },
  'FBNeo - Arcade Games': {
    extensions: ['zip'],
    alias: ['FBN', 'FBNeo', 'FB Alpha', 'FBA', 'Final Burn Alpha']
  },
  'GCE - Vectrex': {
    extensions: ['vec', 'zip'],
    alias: ['VEC', 'Vectrex']
  },
  'GamePark - GP32': {
    extensions: ['gp', 'zip'],
    alias: ['GP32', 'GamePark']
  },
  'MAME': {
    extensions: ['zip'],
    alias: ['MAME']
  },
  'Microsoft - MSX': {
    extensions: ['rom', 'zip'],
    alias: ['MSX']
  },
  'Mattel - Intellivision': {
    extensions: ['int', 'zip'],
    alias: ['INT', 'Intellivision']
  },
  'NEC - PC Engine CD - TurboGrafx-CD': {
    extensions: ['chd', 'cue'],
    alias: ['PCECD', 'TGCD', 'PC Engine CD', 'TurboGrafx-CD']
  },
  'NEC - PC Engine SuperGrafx': {
    extensions: ['sgx', 'zip'],
    alias: ['SGFX', 'SGX', 'SuperGrafx']
  },
  'NEC - PC Engine - TurboGrafx 16': {
    extensions: ['pce', 'zip'],
    alias: ['PCE', 'TG16', 'PC Engine', 'TurboGrafx 16']
  },
  'SNK - Neo Geo CD': {
    extensions: ['chd', 'cue'],
    alias: ['NEOCD', 'NGCD', 'Neo Geo CD']
  },
  'SNK - Neo Geo Pocket Color': {
    extensions: ['ngc', 'zip'],
    alias: ['NGPC', 'Neo Geo Pocket Color'],
    fallbacks: ['SNK - Neo Geo Pocket']
  },
  'SNK - Neo Geo Pocket': {
    extensions: ['ngp', 'zip'],
    alias: ['NGP', 'Neo Geo Pocket']
  },
  'SNK - Neo Geo': {
    extensions: ['neogeo', 'zip'],
    alias: ['NEOGEO', 'Neo Geo']
  },
  'Magnavox - Odyssey2': {
    extensions: ['bin', 'zip'],
    alias: ['ODYSSEY']
  },
  'TIC-80': {
    extensions: ['tic', 'zip'],
    alias: ['TIC']
  },
  'Sharp - X68000': {
    extensions: ['hdf', 'zip'],
    alias: ['X68000']
  },
  'Watara - Supervision': {
    extensions: ['sv', 'zip'],
    alias: ['SV', 'Supervision']
  },
  'DOS': {
    extensions: ['pc', 'dos', 'zip'],
    alias: ['DOS']
  },
  'DOOM': {
    extensions: ['wad', 'zip'],
    alias: ['WAD']
  },
  'ScummVM': {
    extensions: ['scummvm', 'zip'],
    alias: ['SCUMM']
  }
};
const aliases = Object.values(machines).flatMap((machine) => machine.alias);
const machineCache: MachineCache = {};

export function getMachine(file: string, isFolder = false) {
  const extension = file.split('.').pop() ?? '';
  const firstComponent = file.split(/\\|\//)[0];
  const machine = Object.entries(machines).find(([_, { extensions, alias }]) => {
    return (isFolder || extensions.includes(extension)) && alias.some((a) => firstComponent.includes(a));
  });
  return machine ? machine[0] : undefined;
}

export function isRomFolder(folderName: string) {
  return aliases.some((alias) => folderName.toLowerCase().includes(alias.toLowerCase()));
}

export async function scrapeFolder(folderPath: string, options: Options = {}) {
  debug('Options:', options);
  console.info(`Scraping folder: ${folderPath} [Detected: ${getMachine(folderPath, true)}]`);
  const files = await glob(['**/*'], { onlyFiles: true, cwd: folderPath });

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const artPath = path.join(path.dirname(filePath), resFolder, `${path.basename(filePath)}.png`);

    if ((await pathExists(artPath)) && !options.force) {
      debug(`Art file already exists, skipping "${artPath}"`);
      stats.skipped++;
      continue;
    }

    const machine = getMachine(filePath);
    if (!machine) continue;

    debug(`Machine: ${machine} (file: ${filePath})`);
    const boxartUrl = await findArtUrl(filePath, machine, options);
    if (boxartUrl) {
      debug(`Found boxart URL: "${boxartUrl}"`);
      await resizeImageTo(boxartUrl, artPath, { width: options.width, height: options.height });
    } else {
      debug(`No boxart found for "${filePath}"`);
      console.info(`No boxart found for "${filePath}"`);
    }
  }

  debug('--------------------------------');
}

export async function findArtUrl(
  filePath: string,
  machine: string,
  options: Options = {},
  type: ArtType = ArtType.Boxart,
  fallback = true
): Promise<string | undefined> {
  let arts = machineCache[machine]?.[type];
  if (!arts) {
    debug(`Fetching arts list for "${machine}" (${type})`);
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
  const pngName = santizeName(`${fileName}.png`);
  if (arts.includes(pngName)) {
    debug(`Found exact match for "${fileName}"`);
    stats.matches.perfect++;
    return `${baseUrl}${machine}/${type}/${pngName}`;
  }

  const findMatch = async (name: string) => {
    const matches = arts.filter((a) => a.includes(santizeName(name)));
    if (matches.length > 0) {
      const bestMatch = await findBestMatch(name, fileName, matches, options);
      return `${baseUrl}${machine}/${type}/${bestMatch}`;
    }

    return undefined;
  };

  // Try searching after removing (...) and [...] in the name
  let strippedName = fileName.replaceAll(/(\(.*?\)|\[.*?])/g, '').trim();
  let match = await findMatch(strippedName);
  if (match) return match;

  // Try searching after removing DX in the name
  strippedName = strippedName.replaceAll('DX', '').trim();
  match = await findMatch(strippedName);
  if (match) return match;

  // Try searching after removing substitles in the name
  strippedName = strippedName.split(' - ')[0].trim();
  match = await findMatch(strippedName);
  if (match) return match;

  // Try with fallback machines
  if (!fallback) return undefined;
  const fallbackMachines = machines[machine]?.fallbacks ?? [];
  for (const fallbackMachine of fallbackMachines) {
    const artUrl = await findArtUrl(filePath, fallbackMachine, options, type, false);
    if (artUrl) {
      debug(`Found match for "${fileName}" in fallback machine "${fallbackMachine}"`);
      return artUrl;
    }

    debug(`No match for "${fileName}" in fallback machine "${fallbackMachine}"`);
  }

  stats.matches.none++;
  return undefined;
}

export async function cleanupResFolder(folderPath: string) {
  const resFolders = await glob([`**/${resFolder}`], { onlyDirectories: true, cwd: folderPath });
  await Promise.all(resFolders.map(async (resFolder) => fs.rm(resFolder, { recursive: true })));
  console.info(`Removed ${resFolders.length} ${resFolder} folders`);
}

export function santizeName(name: string) {
  return name.replaceAll(/[&*/:`<>?|"]/g, '_');
}

export async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
