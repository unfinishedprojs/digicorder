import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {fileTypeFromBuffer} from 'file-type';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
    return new Uint8Array(buffer);
}

export async function createVideo(imageBuffers: ArrayBuffer[]): Promise<string> {
    const ffmpeg = new FFmpeg();
    
    console.log('Loading ffmpeg')

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      console.log('loaded, loading images')

    for (let i = 0; i < imageBuffers.length; i++) {
        ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageBuffers[i]));
    }

    let inputString = '';
    for (let i = 0; i < imageBuffers.length; i++) {
        inputString += `-i image${i}.jpg `;
    }

    console.log('loaded. generating video')

    await ffmpeg.exec(['-framerate', '30', inputString, '-c:v', 'libx264', 'output.mp4']);

    console.log('generated video. reading video')

    const data = await ffmpeg.readFile('output.mp4').catch((err) => console.log(err))

    console.log('read video. generating url')

    const blob = new Blob([data as FileData], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    console.log('done. cleaning up...')

    ffmpeg.unmount('output.mp4');
    for (let i = 0; i < imageBuffers.length; i++) {
        ffmpeg.unmount(`image${i}.jpg`);
    }

    console.log('everything clean, returning url now...')

    return url;
}
