# 🎨 minui-scraper

[![NPM version](https://img.shields.io/npm/v/minui-scraper.svg)](https://www.npmjs.com/package/minui-scraper)
[![Build Status](https://github.com/sinedied/minui-scraper/workflows/build/badge.svg)](https://github.com/sinedied/minui-scraper/actions)
![Node version](https://img.shields.io/node/v/minui-scraper.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Artwork scraper for MinUI.

> [!NOTE]
> MinUI does't officially support it, but still has [some support for it as stated by its author](https://www.reddit.com/r/SBCGaming/comments/1hycyqx/minui_box_art/).

**Features:**
- Scrapes boxart for your ROMs, in a MinUI compatible format
- No account needed, uses [libretro thumbnails](https://github.com/libretro-thumbnails/libretro-thumbnails)
- Optionally uses local AI with [Ollama](https://ollama.com/) for better boxart matching
- Fast, ~30s to scrap 1000+ images
- No configuration needed

## Installation

Requires [Node.js](https://nodejs.org/), and optionally [Ollama](https://ollama.com/) for AI matching.
Install the CLI globally with:

```bash
npm install -g minui-scraper
```

## Usage

To run the scraper, use the following command:

```bash
mscraper <rompath> [options]
```

> [!TIP]
> Max width must be adjusted depending of the device, the default works well for Trimui Brick. For 640x480 devices, try with `--width 150`.

### Options

- `--width, -w <size>`: Max width of the image (default: 250)
- `--height, -h <size>`: Max height of the image
- `--ai, -a`: Use AI for advanced matching (default: false)
- `--ai-model, -m <name>`: Ollama model to use for AI matching (default: `gemma2:2b`)
- `--regions, -r <regions>`: Preferred regions to use for AI matching (default: `World,Europe,USA,Japan`)
- `--force, -f`: Force scraping over existing images
- `--cleanup`: Removes all scraped images in target folder
- `--verbose`: Show detailed logs
- `-v, --version`: Show current version

## Example

```bash
mscraper myroms --width 300 --ai
```

This will scrape the ROMs in the `myroms` folder with a max image width of 300 and using AI for advanced matching.
