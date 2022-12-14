import { ref, nextTick } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useBucketStore } from "./bucket";
import { stringify } from "qs";
import { ajax } from "@/utils/ajax";
import type { AjaxData, ImagesData } from "@/types/ajax";
import type { Image } from "@/types/image";

export const useImagesStore = defineStore("images", () => {
  const imagesList = ref<Image[]>([]);
  const prefixsArr = useStorage<string[]>("prefixsArr", []);
  const prefixs = ref<string[]>([]);

  const listLoading = ref(false);

  const setPrefixs = (prefixs: string[]) => {
    console.log("prefixs", prefixs);
    prefixsArr.value = prefixs;
  };

  /**
   * It gets a list of images from the server and stores them in the imagesList and prefixs reactive
   * variables
   * @param  - query: The query parameters passed in by the user.
   */
  const getList = async ({ query = {} } = {}) => {
    const bucketStore = useBucketStore();
    const { bucket, isPrivate } = bucketStore.currentBucketInfo || {};
    let { domain } = bucketStore.currentBucketInfo || {};
    const prefixsStr = prefixsArr.value.join("/");
    const prefix = prefixsArr.value.length ? `${prefixsStr}/` : "";

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
      search: "",
      nextMarker: "",
      ...query,
    });

    listLoading.value = true;

    const { data } =
      (await ajax.get<any, AjaxData<ImagesData>>(
        `/api/getImages?${queryString}`
      )) || {};

    nextTick(() => {
      listLoading.value = false;
    });

    const { images, prefixs: prefixsData, nextMarker = "" } = data || {};
    console.log("images", images);
    console.log("prefixsData", prefixsData);
    console.log("nextMarker", nextMarker);
    if (!images) return {};

    images.forEach((item) => {
      item.key = prefix + item.key;
    });

    imagesList.value = images;
    prefixs.value = prefixsData || [];

    return {
      nextMarker,
    };
  };

  return {
    listLoading,
    imagesList,
    prefixsArr,
    prefixs,
    getList,
    setPrefixs,
  };
});
