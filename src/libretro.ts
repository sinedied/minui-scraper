

const SITE_URL = 'https://thumbnails.libretro.com/';
const BOXART_PATH = 'Named_Boxarts';
const SNAP_PATH = 'Named_Snaps';
const TITLE_PATH = 'Named_Titles';
const MACHINE_MAP = {
  'Nintendo - Game Boy' : {
    extensions: ['gb', 'sgb'],
    alias: ['GB', 'Game Boy'],
    fallbacks: ['Nintendo - Game Boy Color']
  },
  'Nintendo - Game Boy Color': {
    extensions: ['gbc'],
    alias: ['GBC', 'Game Boy Color'],
    fallbacks: ['Nintendo - Game Boy']
  },
  'Nintendo - Game Boy Advance': {
    extensions: ['gba'],
    alias: ['GBA', 'Game Boy Advance']
  },
  'Nintendo - Nintendo Entertainment System': {
    extensions: ['nes'],
    alias: ['NES', 'Famicom', 'Nintendo'],
  },
  'Nintendo - Super Nintendo Entertainment System': {
    extensions: ['sfc', 'smc'],
    alias: ['SNES', 'Super Famicom', 'Super Nintendo', 'Super NES']
  },
  'Nintendo - Nintendo 64': {
    extensions: ['n64', 'v64'],
    alias: ['N64', 'Nintendo 64']
  },
  'Sega - 32X': {
    extensions: ['32x'],
    alias: ['32X', 'THIRTYTWOX']
  },
  'Sega - Dreamcast': {
    extensions: ['dc', 'chd', 'gdi'],
    alias: ['DC', 'Dreamcast']
  },
  'Sega - Mega Drive - Genesis': {
    extensions: ['md', 'gen'],
    alias: ['MD', 'Mega Drive', 'Genesis']
  },
  'Sega - Mega-CD - Sega CD': {
    extensions: ['chd', 'iso', 'cue'],
    alias: ['Mega CD', 'Sega CD', 'MegaCD', 'SegaCD']
  },
  'Sega - Game Gear': {
    extensions: ['gg'],
    alias: ['GG', 'Game Gear']
  },
  'Sega - Master System - Mark III': {
    extensions: ['sms'],
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

