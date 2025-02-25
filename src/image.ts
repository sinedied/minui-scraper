import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Jimp } from "jimp";

export type Size = {
  width?: number;
  height?: number;
};

export async function resizeImageTo(url: string, destination: string, size?: Size) {
  try {
    const width = size?.width ?? 300;
    const height = size?.height;
    const image = await Jimp.read(url);
    await mkdir(path.dirname(destination), { recursive: true });
    await image.resize({ w: width, h: height }).write(destination as `${string}.${string}`);
  } catch (error: any) {
    console.error(`Failed to download art from "${url}": ${error.message}`);
  }
}

export async function composeImageTo(
  url1: string | undefined,
  url2: string | undefined,
  destination: string,
  size?: Size
) {
  try{
    const width = size?.width ?? 300;
    const margin = Math.round(width * 5 / 100);
    const height = size?.height ?? width;
    await mkdir(path.dirname(destination), { recursive: true });
    const image1 = url1 ? await Jimp.read(url1) : undefined;
    const image2 = url2 ? await Jimp.read(url2) : undefined;
    const image = new Jimp({ width, height, color: 0x00000000 });

    if (image2) {
      const img2Width = image2.bitmap.width >= image2.bitmap.height ? width - margin : undefined;
      const img2Height = image2.bitmap.width < image2.bitmap.height ? height - margin : undefined;
      image2.resize({ w: img2Width!, h: img2Height });
      image.composite(image2, 0, (height - image2.bitmap.height) / 2 - margin);
    }

    if (image1) {
      const img1Width = image1.bitmap.width >= image1.bitmap.height ? width / 2 - margin : undefined;
      const img1Height = image1.bitmap.width < image1.bitmap.height ? height / 2 - margin : undefined;
      image1.resize({ w: img1Width!, h: img1Height });
      image.composite(image1, width - image1.bitmap.width, height - image1.bitmap.height);
    }

    await image.write(destination as `${string}.${string}`);
  } catch (error: any) {
    console.error(`Failed to download art from "${url1}" or "${url2}": ${error.message}`);
  }
}
