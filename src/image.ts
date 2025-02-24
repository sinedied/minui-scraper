import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {Jimp} from 'jimp';

export type Size = {
  width: number;
  height?: number;
};

export async function resizeImageTo(url: string, destination: string, size?: Size) {
  const width = size?.width ?? 250;
  const height = size?.height;
  const image = await Jimp.read(url);
  await mkdir(path.dirname(destination), {recursive: true});
  await image.resize({w: width, h: height}).write(destination as `${string}.${string}`);
}
