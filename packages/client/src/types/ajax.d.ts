import type { Image } from "./image";

export type AjaxData<T> = {
  code: number;
  data?: T;
  message?: string;
};

export type ImagesData = {
  images: Image[];
  prefixs: string[];
  nextMarker: string;
};
