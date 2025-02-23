import { Jimp } from "jimp";

export type Size = {
  width: number;
  height?: number;
};

export async function resizeImageTo(url: string, size: Size = { width: 250 }, destination: string) {
  const image = await Jimp.read(url);
  const { width, height } = size;
  await image.resize({ w: width, h: height }).write(destination as any);
}
