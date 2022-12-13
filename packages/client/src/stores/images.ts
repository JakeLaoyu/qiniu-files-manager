import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useBucketStore } from "./bucket";
import { stringify } from "qs";
import { ajax } from "@/utils/ajax";
import type { AjaxData, ImagesData } from "@/types/ajax";
import type { Image } from "@/types/image";

export const useImagesStore = defineStore("images", () => {
  const imagesList = useStorage<Image[]>("imagesList", []);
  const prefixs = useStorage<string[]>("prefixs", []);

  /**
   * It gets a list of images from the server and stores them in the imagesList and prefixs reactive
   * variables
   * @param  - query: The query parameters passed in by the user.
   */
  const getList = async ({ query = {} } = {}) => {
    const bucketStore = useBucketStore();
    const { bucket, isPrivate } = bucketStore.currentBucketInfo || {};
    let { domain } = bucketStore.currentBucketInfo || {};
    const prefix = "";

    if (!bucket || !domain) return;

    if (isPrivate) {
      domain = window.location.protocol + domain;
    }

    const queryString = stringify({
      bucket,
      prefix,
      domain,
      private: isPrivate,
      pagesize: 1000,
      ...query,
    });

    const { data } =
      (await ajax.get<any, AjaxData<ImagesData>>(
        `/api/getImages?${queryString}`
      )) || {};

    const { images, prefixs: prefixsData, nextMarker = "" } = data || {};
    console.log("images", images);
    console.log("prefixsData", prefixsData);
    console.log("nextMarker", nextMarker);
    if (!images) return {};

    images.forEach((item) => {
      item.key = prefix + item.key;
    });

    imagesList.value = images;
    prefixs.value = prefixsData;

    return {
      nextMarker,
    };
  };

  return {
    imagesList,
    prefixs,
    getList,
  };
});
