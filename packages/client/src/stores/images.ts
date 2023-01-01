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
  const filterKeyword = ref("");
  const nextMarker = ref("");
  const multipleMode = ref(false);
  const selectedList = ref<string[]>([]);

  const listLoading = ref(false);

  const newPrefixFormat = computed(() => {
    if (!newPrefix.value) return "";

    let newPrefixFormat = newPrefix.value.endsWith("/")
      ? newPrefix.value
      : newPrefix.value + "/";

    newPrefixFormat = newPrefixFormat.replace(/\s/g, "-");

    return newPrefixFormat;
  });

  const resetImageStore = () => {
    imagesList.value = [];
    imageDetail.value = undefined;
    prefixsOpened.value = [];
    prefixs.value = [];
    newPrefix.value = "";
    filterKeyword.value = "";
    nextMarker.value = "";
    multipleMode.value = false;
  };

  /**
   * It gets a list of images from the server and stores them in the imagesList and prefixs reactive
   * variables
   * @param  - query: The query parameters passed in by the user.
   */
  const getList = async ({ query = {}, search = "" } = {}) => {
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
      prefix: search.length ? "" : prefix,
      domain,
      private: isPrivate,
      pagesize: 200,
      search,
      nextMarker: nextMarker.value,
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

    const {
      images,
      prefixs: prefixsData,
      nextMarker: nextMarkerFlag = "",
    } = data || {};

    if (!images) return {};

    if (!search) {
      images.forEach((item) => {
        item.key = prefix + item.key;
      });

      imagesList.value = [...imagesList.value, ...images];
      prefixs.value = [...prefixs.value, ...(prefixsData || [])];
      nextMarker.value = nextMarkerFlag;
    }

    return {
      nextMarker: nextMarkerFlag,
      images,
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

  const deleteImage = async (image: Image | string[]) => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    return ajax.post<any, AjaxData<any>>("/api/delImage", {
      key: Array.isArray(image) ? image : image.key,
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

  const moveImage = async (image: Image, newKey: string) => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    return ajax.post<any, AjaxData<any>>("/api/moveImage", {
      bucket: bucket,
      key: image.key,
      newKey: newKey,
    });
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

  const multipleMoveImage = (newKey: string) => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    return ajax.post<any, AjaxData<any>>("/api/multipleMoveImage", {
      bucket: bucket,
      keys: selectedList.value,
      newKey: newKey,
    });
  };

  return {
    listLoading,
    imagesList,
    prefixsOpened,
    prefixs,
    newPrefix,
    newPrefixFormat,
    imageDetail,
    filterKeyword,
    nextMarker,
    multipleMode,
    selectedList,
    resetImageStore,
    getList,
    getUploadToken,
    getImageDetail,
    deleteImage,
    getImageUrl,
    getPrivateToken,
    moveImage,
    multipleMoveImage,
  };
});
