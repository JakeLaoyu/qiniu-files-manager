import { ref, nextTick, computed } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useBucketStore } from "./bucket";
import { stringify } from "qs";
import { ajax } from "@/utils/ajax";
import type {
  AjaxData,
  ImagesData,
  UploadToken,
  PrivateToken,
} from "@/types/ajax";
import type { Image } from "@/types/image";

export const useImagesStore = defineStore("images", () => {
  const imagesList = ref<Image[]>([]);
  const imageDetail = ref<Image>();
  const prefixsOpened = useStorage<string[]>("prefixsOpened", []);
  const prefixs = ref<string[]>([]);
  const newPrefix = ref("");

  const listLoading = ref(false);

  const newPrefixFormat = computed(() => {
    if (!newPrefix.value) return "";

    let newPrefixFormat = newPrefix.value.endsWith("/")
      ? newPrefix.value
      : newPrefix.value + "/";

    newPrefixFormat = newPrefixFormat.replace(/\s/g, "-");

    return newPrefixFormat;
  });

  /**
   * It gets a list of images from the server and stores them in the imagesList and prefixs reactive
   * variables
   * @param  - query: The query parameters passed in by the user.
   */
  const getList = async ({ query = {} } = {}) => {
    const bucketStore = useBucketStore();
    const { bucket, isPrivate } = bucketStore.currentBucketInfo || {};
    let { domain } = bucketStore.currentBucketInfo || {};
    const prefixsStr = prefixsOpened.value.join("/");
    const prefix = prefixsOpened.value.length ? `${prefixsStr}/` : "";

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

  const getImageDetail = async (image: Image) => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    const res = await ajax.get<any, AjaxData<Image>>("/api/detail", {
      params: {
        key: image.key,
        bucket: bucket,
      },
    });

    imageDetail.value = {
      ...image,
      ...res.data,
    };
  };

  const deleteImage = async (image: Image) => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    return ajax.post<any, AjaxData<any>>("/api/delImage", {
      key: image.key,
      bucket: bucket,
    });
  };

  const getUploadToken = async () => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    if (!bucket) return;

    // 获取token
    const { data } = await ajax.get<any, AjaxData<UploadToken>>(
      `/api/uploadToken?bucket=${bucket}`
    );

    const { uploadToken } = data || {};

    return uploadToken;
  };

  const getPrivateToken = async (key: string) => {
    const bucketStore = useBucketStore();
    const { domain } = bucketStore.currentBucketInfo || {};

    // 获取token
    const { data } = await ajax.get<any, AjaxData<PrivateToken>>(
      `/api/getPrivateToken`,
      {
        params: {
          key,
          domain: window.location.protocol + domain,
        },
      }
    );

    const { token } = data || {};

    return token;
  };

  const getImageUrl = (image?: Image) => {
    if (!image) return "";

    const bucketStore = useBucketStore();
    const { domain, isPrivate } = bucketStore.currentBucketInfo || {};

    if (isPrivate) {
      return `${domain}${image.key}?${image.private}`;
    }

    return `//${domain}/${image.key}`;
  };

  return {
    listLoading,
    imagesList,
    prefixsOpened,
    prefixs,
    newPrefix,
    newPrefixFormat,
    imageDetail,
    getList,
    getUploadToken,
    getImageDetail,
    deleteImage,
    getImageUrl,
    getPrivateToken,
  };
});
