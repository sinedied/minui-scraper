# 🎨 multi-scraper

[![NPM version](https://img.shields.io/npm/v/multi-scraper.svg)](https://www.npmjs.com/package/multi-scraper)
[![Build Status](https://github.com/sinedied/multi-scraper/workflows/build/badge.svg)](https://github.com/sinedied/multi-scraper/actions)
![Node version](https://img.shields.io/node/v/multi-scraper.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<img src="https://raw.githubusercontent.com/sinedied/multi-scraper/refs/heads/main/pic.jpg" alt="picture of a scraped boxart" width="180" align="right">

Artwork scraper for [MinUI](https://github.com/shauninman/MinUI), [NextUI](https://github.com/LoveRetro/NextUI) and [muOS](https://muos.dev/).

> [!NOTE]
> MinUI does't officially support boxarts, but still has [some support for it as stated by its author](https://www.reddit.com/r/SBCGaming/comments/1hycyqx/minui_box_art/).

**Features:**
- Scrapes boxart for your ROMs, in a compatible format with multiple frontends/OSes
- No account needed, uses [libretro thumbnails](https://github.com/libretro-thumbnails/libretro-thumbnails)
- Optionally uses local AI with [Ollama](https://ollama.com/) for better boxart matching
- No configuration needed

## Installation

Requires [Node.js](https://nodejs.org/), and optionally [Ollama](https://ollama.com/) for AI matching. You need to install these to be able to use the scraper.

This tool works with a Command Line Interface (CLI), and need to be installed and run from a terminal application.

Install the CLI globally by opening a terminal and running the following command:

```bash
npm install -g multi-scraper
```

## Usage

To run the scraper, open a terminal and use the following command:

```bash
mscraper <rompath> [options]
```

> [!TIP]
> Max width must be adjusted depending of the device and output format, the default works well for Trimui Brick. For 640x480 devices, try with `--width 200`.

### Options

- `-w, --width <size>`: Max width of the image (default: 300)
- `-h, --height <size>`: Max height of the image
- `-t, --type <type>`: Type of image to scrape (can be `boxart`, `snap`, `title`, `box+snap`, `box+title`) (default: `boxart`)
- `-o, --output <format>`: Artwork format (can be (`minui`, `nextui`, `muos`) (default: `minui`)
- `-a, --ai`: Use AI for advanced matching (default: false)
- `-m, --ai-model <name>`: Ollama model to use for AI matching (default: `gemma2:2b`)
- `-r, --regions <regions>`: Preferred regions to use for AI matching (default: `World,Europe,USA,Japan`)
- `-f, --force`: Force scraping over existing images
- `--cleanup`: Removes all scraped images in target folder
- `--verbose`: Show detailed logs
- `-v, --version`: Show current version

## Example

```bash
mscraper myroms --width 300 --ai
```

This will scrape the ROMs in the `myroms` folder with a max image width of 300 and using AI for advanced matching.

## Supported Systems

The following systems are supported for scraping:

<details>
<summary>Click to expand</summary>

- Nintendo - Game Boy Color
- Nintendo - Game Boy Advance
- Nintendo - Game Boy
- Nintendo - Super Nintendo Entertainment System
- Nintendo - Nintendo 64DD
- Nintendo - Nintendo 64
- Nintendo - Family Computer Disk System
- Nintendo - Nintendo Entertainment System
- Nintendo - Nintendo DSi
- Nintendo - Nintendo DS
- Nintendo - Pokemon Mini
- Nintendo - Virtual Boy
- Handheld Electronic Game
- Sega - 32X
- Sega - Dreamcast
- Sega - Mega Drive - Genesis
- Sega - Mega-CD - Sega CD
- Sega - Game Gear
- Sega - Master System - Mark III
- Sega - Saturn
- Sega - Naomi 2
- Sega - Naomi
- Sony - PlayStation
- Sony - PlayStation Portable
- Amstrad - CPC
- Atari - 2600
- Atari - 5200
- Atari - 7800
- Atari - Jaguar
- Atari - Lynx
- Atari - ST
- Bandai - WonderSwan Color
- Bandai - WonderSwan
- Coleco - ColecoVision
- Commodore - Amiga
- Commodore - VIC-20
- Commodore - 64
- FBNeo - Arcade Games
- GCE - Vectrex
- GamePark - GP32
- MAME
- Microsoft - MSX
- Mattel - Intellivision
- NEC - PC Engine CD - TurboGrafx-CD
- NEC - PC Engine SuperGrafx
- NEC - PC Engine - TurboGrafx 16
- SNK - Neo Geo CD
- SNK - Neo Geo Pocket Color
- SNK - Neo Geo Pocket
- SNK - Neo Geo
- Magnavox - Odyssey2
- TIC-80
- Sharp - X68000
- Watara - Supervision
- DOS
- DOOM
- ScummVM
- Atomiswave

</details>
