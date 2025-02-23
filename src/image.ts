import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Jimp } from "jimp";

export type Size = {
  width: number;
  height?: number;
};

export async function resizeImageTo(url: string, size: Size = { width: 250 }, destination: string) {
  const image = await Jimp.read(url);
  const { width, height } = size;
  await mkdir(path.dirname(destination), { recursive: true });
  await image.resize({ w: width, h: height }).write(destination as any);
}
