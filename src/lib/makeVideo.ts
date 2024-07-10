import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

export async function createVideo(images: ArrayBuffer[]) {
    console.log("starting ffmpeg")
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
    ffmpeg.on("progress", ({ progress, time }) => {
      console.log(`${progress * 100} %, time: ${time / 1000000} s`);
    });
    console.log('started ffmpeg')
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    });
    console.log('loaded ffmpeg')

  images.forEach((img, i) => {
    ffmpeg.writeFile(`image_${i}.jpg`, new Uint8Array(img))
  })

  await ffmpeg.exec(['-framerate', '30', '-i', 'image_%d.jpg', 'output.mp4'])

  const videoData = ffmpeg.readFile('output.mp4') as unknown as Uint8Array

  const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });

  return URL.createObjectURL(videoBlob);
}
