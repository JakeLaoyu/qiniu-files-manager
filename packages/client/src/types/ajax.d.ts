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

export type UploadToken = {
  uploadToken: string;
};

export type PrivateToken = {
  token: string;
};
