interface ImgproxyLoaderProps {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
}

export default function imgproxyLoader({ src, width, height, quality }: ImgproxyLoaderProps) {
  const path =
    `/size:${width ? width : 0}:${height ? height : 0}` +
    `/resizing_type:fill` +
    (quality ? `/quality:${quality}` : "") +
    `/sharpen:0.5` +
    `/plain/${src}` +
    `@webp`;

  const host = process.env.NEXT_PUBLIC_IMGPROXY_URL || "https://imgproxy.antlur.co";

  const imgUrl = `${host}/insecure${path}`;

  return imgUrl;
}
