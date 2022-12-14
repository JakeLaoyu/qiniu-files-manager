export type Image = {
  fsize: number;
  hash: string;
  key: string;
  mimeType: string;
  putTime: number;
  type: number;
  status: number;
  private: string;
};

export type Folder = {
  key: string;
  mimeType: "folder";
};
