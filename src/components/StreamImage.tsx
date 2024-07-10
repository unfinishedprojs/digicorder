import { JSX } from 'solid-js';

export default (props: JSX.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
    src="http://192.168.1.137:8080/?action=stream"
    alt="Stream"
    style={{
      width: '100%',
      "max-width": '800px',
      height: 'auto'
    }}
  />
);
