import { ref, nextTick, computed, unref } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useBucketStore } from "./bucket";
import { stringify } from "qs";
import { ajax } from "@/utils/ajax";
import axios, { type CancelTokenSource } from "axios";
import type {
  AjaxData,
  ImagesData,
  UploadToken,
  PrivateToken,
} from "@/types/ajax";
import type { Image } from "@/types/image";
import { Message } from "@arco-design/web-vue";

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
  const listHomePrefixFilter = ref("");

  const hasImageListCache = ref(false);
  const hasPrefixsCache = ref(false);

  const imageListCache = ref<Record<string, Image[]>>({});
  const prefixsCache = ref<Record<string, string[]>>({});

  const listLoading = ref(false);

  let cancelTokenSource: CancelTokenSource | null = null;

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

    hasPrefixsCache.value = false;
    hasImageListCache.value = false;

    if (!bucket || !domain) return;

    if (cancelTokenSource) {
      cancelTokenSource.cancel("Operation canceled by the user.");
      cancelTokenSource = null;
    }

    const CancelToken = axios.CancelToken;
    cancelTokenSource = CancelToken.source();

    if (isPrivate) {
      domain = window.location.protocol + domain;
    }

    const queryString = stringify({
      bucket,
      prefix: search.length ? "" : prefix,
      costomPrefixSearch: search || prefix ? "" : listHomePrefixFilter.value,
      domain,
      private: isPrivate,
      pagesize: 200,
      search,
      nextMarker: nextMarker.value,
      ...query,
    });

    const preImageList = [...unref(imagesList)];
    const prePrefixs = [...unref(prefixs)];

    if (imageListCache.value[queryString]) {
      hasImageListCache.value = true;
      imagesList.value = [
        ...imagesList.value,
        ...imageListCache.value[queryString],
      ];
    }

    if (prefixsCache.value[queryString]) {
      hasPrefixsCache.value = true;
      prefixs.value = [...prefixs.value, ...prefixsCache.value[queryString]];
    }

    listLoading.value = true;

    const { data } =
      (await ajax.get<any, AjaxData<ImagesData>>(`/api/images?${queryString}`, {
        cancelToken: cancelTokenSource.token,
      })) || {};

    nextTick(() => {
      listLoading.value = false;
    });

    const {
      images,
      prefixs: prefixsData = [],
      nextMarker: nextMarkerFlag = "",
    } = data || {};

    if (!images) return {};

    if (nextMarker.value && prefixsData.length) {
      Message.info("有新的文件夹");
    }

    if (!search) {
      images.forEach((item) => {
        item.key = prefix + item.key;
      });

      imageListCache.value[queryString] = [...images];
      prefixsCache.value[queryString] = [...prefixsData];

      imagesList.value = [...preImageList, ...images];
      prefixs.value = [...prePrefixs, ...prefixsData];
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

    return ajax
      .delete<any, AjaxData<any>>("/api/image", {
        data: {
          key: Array.isArray(image) ? image : image.key,
          bucket: bucket,
        },
      })
      .then((res) => {
        if (res.code === 0) {
          imagesList.value = imagesList.value.filter((item) => {
            if (Array.isArray(image)) {
              return !image.includes(item.key);
            }
            return item.key !== image.key;
          });
        }
        return res;
      });
  };

  const getUploadToken = async () => {
    const bucketStore = useBucketStore();
    const { bucket } = bucketStore.currentBucketInfo || {};

    if (!bucket) return;

    await bucketStore.postSecret();

    // 获取token
    const { data } = await ajax.get<any, AjaxData<UploadToken>>(
      `/api/upload-token?bucket=${bucket}`
    );

    const { uploadToken } = data || {};

    return uploadToken;
  };

  const getPrivateToken = async (key: string) => {
    const bucketStore = useBucketStore();
    const { domain } = bucketStore.currentBucketInfo || {};

    // 获取token
    const { data } = await ajax.get<any, AjaxData<PrivateToken>>(
      `/api/private-token`,
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

    return ajax.post<any, AjaxData<any>>("/api/move-image", {
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

    return ajax.post<any, AjaxData<any>>("/api/multiple-move-image", {
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
    listHomePrefixFilter,
    hasPrefixsCache,
    hasImageListCache,
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
